// services/paymentSettings.service.js
import PaymentSettingsModel from '../models/paymentSettings.model.js'
import mongoose from 'mongoose'
import Church from '../models/church.model.js'
import AppError from '../errors/AppError.js'
import { encrypt, decrypt, hint } from '../utils/crypto.js'

export const PaymentSettingsService = {
    // Todas as igrejas + se já têm as chaves (sem revelar os segredos)
    async list() {
        const [churches, settings] = await Promise.all([
            Church.find({}, 'name').sort({ name: 1 }),
            PaymentSettingsModel.find({}),
        ])
        const byChurch = new Map(settings.map(s => [String(s.churchId), s]))

        return churches.map(church => {
            const s = byChurch.get(String(church._id))
            return {
                churchId: church._id,
                churchName: church.name,
                configured: !!s,
                publicKey: s?.publicKey ?? null,
                accessTokenHint: s?.accessTokenHint ?? null,
                hasWebhookSecret: !!s?.webhookSecretEnc,
                updatedAt: s?.updatedAt ?? null,
            }
        })
    },

    // Cria ou atualiza. Campo secreto vazio = mantém o que já estava salvo.
    async save(churchId, body, authUser) {
        if (!mongoose.isValidObjectId(churchId)) throw new AppError('Invalid id', 400)
        const church = await Church.findById(churchId)
        if (!church) throw new AppError('Church not found', 404)

        const existing = await PaymentSettingsModel.findOne({ churchId })
        const accessToken = body.accessToken?.trim()
        const webhookSecret = body.webhookSecret?.trim()

        if (!existing && !accessToken) {
            throw new AppError('Access Token é obrigatório', 400)
        }

        const update = { updatedBy: authUser.id }
        if (body.publicKey !== undefined) update.publicKey = body.publicKey?.trim() || null
        if (accessToken) {
            update.accessTokenEnc = encrypt(accessToken)
            update.accessTokenHint = hint(accessToken)
        }
        if (webhookSecret) update.webhookSecretEnc = encrypt(webhookSecret)

        await PaymentSettingsModel.findOneAndUpdate(
            { churchId },
            { $set: update },
            { upsert: true, new: true, runValidators: true }
        )
        return (await this.list()).find(s => String(s.churchId) === String(churchId))
    },

    async remove(churchId) {
        if (!mongoose.isValidObjectId(churchId)) throw new AppError('Invalid id', 400)
        await PaymentSettingsModel.findOneAndDelete({ churchId })
        return null
    },

    // Uso interno (checkout e webhook): segredos já descriptografados
    async credentialsFor(churchId) {
        if (!mongoose.isValidObjectId(churchId)) return null
        const s = await PaymentSettingsModel.findOne({ churchId })
        if (!s) return null
        return {
            churchId: s.churchId,
            accessToken: decrypt(s.accessTokenEnc),
            webhookSecret: s.webhookSecretEnc ? decrypt(s.webhookSecretEnc) : null,
        }
    },

    async allCredentials() {
        const all = await PaymentSettingsModel.find({})
        return all.map(s => ({
            churchId: s.churchId,
            accessToken: decrypt(s.accessTokenEnc),
            webhookSecret: s.webhookSecretEnc ? decrypt(s.webhookSecretEnc) : null,
        }))
    },
}
