// services/dizimoOferta.service.js
import mongoose from 'mongoose'
import DizimoOfertaModel from '../models/dizimoOferta.model.js'
import UserModel from '../models/user.model.js'
import AppError from '../errors/AppError.js'
import { declareDTO, checkoutDTO, manualDTO } from '../dtos/dizimoOferta.dto.js'
import { MercadoPagoService } from './mercadoPago.service.js'
import { PaymentSettingsService } from './paymentSettings.service.js'

const TZ = 'America/Sao_Paulo'
function validId(id) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid id', 400)
    return id
}

const round = n => Math.round((n ?? 0) * 100) / 100

async function findUser(userId) {
    const user = await UserModel.findById(userId)
    if (!user) throw new AppError('User not found', 404)
    return user
}

async function churchOf(userId) {
    const user = await findUser(userId)
    if (!user.churchId) throw new AppError('Cadastre sua igreja no perfil antes de contribuir', 400)
    return { user, churchId: user.churchId }
}

// super_admin vê todas as igrejas (ou a escolhida); os demais só a própria
async function scopeChurch(authUser, requestedChurchId) {
    if (requestedChurchId) validId(requestedChurchId)
    const user = await findUser(authUser.id)
    if ((user.roles ?? []).includes('super_admin')) {
        return requestedChurchId ? new mongoose.Types.ObjectId(String(requestedChurchId)) : null
    }
    if (!user.churchId) throw new AppError('Seu usuário não tem igreja cadastrada', 400)
    return user.churchId
}

// Início/fim do período no horário de Brasília (UTC-3, sem horário de verão)
function periodRange(period, value) {
    const now = new Date(Date.now() - 3 * 3600 * 1000)
    const [y, m, d] = (value ?? '').split('-').map(Number)
    const year = y || now.getUTCFullYear()
    const month = (m || now.getUTCMonth() + 1) - 1
    const dayOfMonth = d || now.getUTCDate()

    const at = (yy, mm, dd) => new Date(Date.UTC(yy, mm, dd, 3)) // 00:00 em Brasília
    switch (period) {
        case 'day': return { start: at(year, month, dayOfMonth), end: at(year, month, dayOfMonth + 1), format: '%Y-%m-%d' }
        case 'month': return { start: at(year, month, 1), end: at(year, month + 1, 1), format: '%Y-%m-%d' }
        case 'year': return { start: at(year, 0, 1), end: at(year + 1, 0, 1), format: '%Y-%m' }
        default: throw new AppError('Período inválido (use day, month ou year)', 400)
    }
}

function withUser(query) {
    return query.populate('userId', 'name email phone').populate('registeredBy', 'name')
}

export const DizimoOfertaService = {
    // ---------- membro ----------
    async findMine(userId) {
        return await DizimoOfertaModel.find({ userId, status: { $ne: 'recusado' } }).sort({ date: -1 })
    },

    async declare(body, userId) {
        const { churchId } = await churchOf(userId)
        return await DizimoOfertaModel.create(declareDTO(body, userId, churchId))
    },

    // cria a contribuição pendente e o checkout do Mercado Pago
    async checkout(body, userId) {
        const { user, churchId } = await churchOf(userId)
        const credentials = await PaymentSettingsService.credentialsFor(churchId)
        if (!credentials) {
            throw new AppError('Sua igreja ainda não ativou o pagamento pelo app', 400)
        }

        const contribution = await DizimoOfertaModel.create(checkoutDTO(body, userId, churchId))
        const items = [
            contribution.tithe && { title: 'Dízimo', amount: contribution.tithe },
            contribution.offering && { title: 'Oferta', amount: contribution.offering },
        ].filter(Boolean)

        try {
            const { preferenceId, initPoint } = await MercadoPagoService.createPreference(
                credentials.accessToken,
                { contributionId: contribution._id, churchId, items, payerEmail: user.email }
            )
            contribution.mpPreferenceId = preferenceId
            await contribution.save()
            return { contribution, initPoint }
        } catch (error) {
            await DizimoOfertaModel.deleteOne({ _id: contribution._id })
            throw error
        }
    },

    // o membro pode apagar só o que ele mesmo informou
    async removeMine(id, userId) {
        validId(id)
        const deleted = await DizimoOfertaModel.findOneAndDelete({ _id: id, userId, source: 'membro' })
        if (!deleted) throw new AppError('Contribution not found', 404)
        return null
    },

    // ---------- webhook do Mercado Pago ----------
    // Retorna o que aconteceu (para log). Nunca confia no corpo: sempre consulta
    // o pagamento na API do Mercado Pago com as chaves da igreja.
    async handleWebhook({ query, body, headers }) {
        const type = body?.type ?? query.type ?? query.topic
        const paymentId = body?.data?.id ?? query['data.id'] ?? query.id
        if (type !== 'payment' || !paymentId) return { ignored: 'not a payment' }

        const candidates = query.churchId
            ? [await PaymentSettingsService.credentialsFor(query.churchId)].filter(Boolean)
            : await PaymentSettingsService.allCredentials()

        let signatureChecked = false
        for (const credentials of candidates) {
            if (credentials.webhookSecret) {
                if (!MercadoPagoService.isValidSignature(credentials.webhookSecret, headers, query['data.id'] ?? paymentId)) {
                    continue
                }
                signatureChecked = true
            }

            const payment = await MercadoPagoService.getPayment(credentials.accessToken, paymentId)
            if (!payment) continue

            const contribution = await DizimoOfertaModel.findOne({
                _id: mongoose.isValidObjectId(payment.external_reference) ? payment.external_reference : null,
                churchId: credentials.churchId,
                source: 'app',
            })
            if (!contribution) return { ignored: 'contribution not found' }

            const expected = round((contribution.tithe ?? 0) + (contribution.offering ?? 0))
            const paid = round(payment.transaction_amount)
            let status = 'pendente'
            if (payment.status === 'approved') status = paid + 0.009 >= expected ? 'aprovado' : 'recusado'
            if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(payment.status)) status = 'recusado'

            contribution.status = status
            contribution.mpPaymentId = String(payment.id)
            contribution.paidAmount = paid
            contribution.method = MercadoPagoService.methodOf(payment)
            if (payment.date_approved) contribution.date = new Date(payment.date_approved)
            if (status === 'recusado' && payment.status === 'approved') {
                contribution.notes = `Valor pago (${paid}) diferente do esperado (${expected})`
            }
            await contribution.save()
            return { updated: String(contribution._id), status }
        }

        if (candidates.some(c => c.webhookSecret) && !signatureChecked) {
            throw new AppError('Invalid signature', 401)
        }
        return { ignored: 'payment not found for any church' }
    },

    // ---------- tesouraria ----------
    async createManual(body, authUser) {
        // super_admin sem igreja escolhida: registra na igreja dele
        const churchId = (await scopeChurch(authUser, body.churchId)) ?? (await findUser(authUser.id)).churchId
        if (!churchId) throw new AppError('Escolha a igreja', 400)
        if (body.userId) await findUser(validId(body.userId))
        const created = await DizimoOfertaModel.create(manualDTO(body, churchId, authUser.id))
        return await withUser(DizimoOfertaModel.findById(created._id))
    },

    async list({ period = 'month', date, churchId }, authUser) {
        const scope = await scopeChurch(authUser, churchId)
        const { start, end } = periodRange(period, date)
        const query = { date: { $gte: start, $lt: end }, status: { $ne: 'recusado' } }
        if (scope) query.churchId = scope
        return await withUser(DizimoOfertaModel.find(query).sort({ date: -1 }).limit(1000))
    },

    async remove(id, authUser) {
        validId(id)
        const scope = await scopeChurch(authUser)
        const query = { _id: id, source: { $ne: 'app' } } // pagamento real do app não se apaga
        if (scope) query.churchId = scope
        const deleted = await DizimoOfertaModel.findOneAndDelete(query)
        if (!deleted) throw new AppError('Contribution not found', 404)
        return null
    },

    // Totais do período: dízimo, oferta, por forma de pagamento, por origem e a
    // evolução (por dia no mês, por mês no ano). Só contribuições aprovadas.
    async report({ period = 'month', date, churchId }, authUser) {
        const scope = await scopeChurch(authUser, churchId)
        const { start, end, format } = periodRange(period, date)

        const match = { status: 'aprovado', date: { $gte: start, $lt: end } }
        if (scope) match.churchId = scope

        const value = { $add: [{ $ifNull: ['$tithe', 0] }, { $ifNull: ['$offering', 0] }] }
        const [result] = await DizimoOfertaModel.aggregate([
            { $match: match },
            {
                $facet: {
                    totals: [{
                        $group: {
                            _id: null,
                            tithe: { $sum: { $ifNull: ['$tithe', 0] } },
                            offering: { $sum: { $ifNull: ['$offering', 0] } },
                            count: { $sum: 1 },
                        },
                    }],
                    byMethod: [{ $group: { _id: '$method', total: { $sum: value } } }],
                    bySource: [{ $group: { _id: '$source', total: { $sum: value } } }],
                    series: [
                        {
                            $group: {
                                _id: { $dateToString: { format, date: '$date', timezone: TZ } },
                                tithe: { $sum: { $ifNull: ['$tithe', 0] } },
                                offering: { $sum: { $ifNull: ['$offering', 0] } },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ],
                },
            },
        ])

        const totals = result.totals[0] ?? { tithe: 0, offering: 0, count: 0 }
        const pick = (list, keys) => Object.fromEntries(
            keys.map(key => [key, round(list.find(i => i._id === key)?.total)])
        )

        return {
            period,
            start,
            end,
            totals: {
                tithe: round(totals.tithe),
                offering: round(totals.offering),
                total: round(totals.tithe + totals.offering),
                count: totals.count,
            },
            byMethod: pick(result.byMethod, ['pix', 'dinheiro', 'cartao']),
            bySource: pick(result.bySource, ['app', 'membro', 'tesouraria']),
            series: result.series.map(s => ({ key: s._id, tithe: round(s.tithe), offering: round(s.offering) })),
        }
    },
}
