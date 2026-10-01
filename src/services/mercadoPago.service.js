// services/mercadoPago.service.js
// Chamadas à API REST do Mercado Pago (sem SDK).
import crypto from 'crypto'
import AppError from '../errors/AppError.js'

const API = 'https://api.mercadopago.com'

async function mpFetch(accessToken, path, options = {}) {
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })
    const body = await response.json().catch(() => null)
    return { ok: response.ok, status: response.status, body }
}

export const MercadoPagoService = {
    // Checkout Pro: a pessoa paga na página do Mercado Pago (Pix ou cartão)
    async createPreference(accessToken, { contributionId, churchId, items, payerEmail }) {
        const publicUrl = process.env.PUBLIC_API_URL
        const preference = {
            items: items.map(item => ({
                title: item.title,
                quantity: 1,
                unit_price: item.amount,
                currency_id: 'BRL',
            })),
            external_reference: String(contributionId),
            metadata: { contribution_id: String(contributionId), church_id: String(churchId) },
            payer: payerEmail ? { email: payerEmail } : undefined,
            statement_descriptor: 'DIZIMO OFERTA',
            // só Pix e cartão (sem boleto/lotérica)
            payment_methods: {
                excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }],
            },
            // se o endereço público estiver configurado, o MP avisa direto aqui
            // (senão vale o webhook cadastrado no painel do Mercado Pago)
            ...(publicUrl && {
                notification_url: `${publicUrl}/api/dizimo-oferta/webhook?churchId=${churchId}`,
            }),
        }

        const { ok, status, body } = await mpFetch(accessToken, '/checkout/preferences', {
            method: 'POST',
            body: JSON.stringify(preference),
        })
        if (!ok) {
            const message = status === 401
                ? 'Chaves do Mercado Pago inválidas para esta igreja'
                : `Mercado Pago recusou o pagamento (${status})`
            throw new AppError(message, 502)
        }
        return { preferenceId: body.id, initPoint: body.init_point }
    },

    async getPayment(accessToken, paymentId) {
        const { ok, body } = await mpFetch(accessToken, `/v1/payments/${encodeURIComponent(paymentId)}`)
        return ok ? body : null
    },

    // Valida o header x-signature do webhook
    // https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
    isValidSignature(secret, headers, dataId) {
        const signature = headers['x-signature']
        const requestId = headers['x-request-id']
        if (!signature || !dataId) return false

        const parts = Object.fromEntries(
            signature.split(',').map(part => part.trim().split('=').map(s => s.trim()))
        )
        if (!parts.ts || !parts.v1) return false

        const id = /^[a-z0-9]+$/i.test(dataId) ? String(dataId).toLowerCase() : dataId
        let manifest = `id:${id};`
        if (requestId) manifest += `request-id:${requestId};`
        manifest += `ts:${parts.ts};`

        const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
        const a = Buffer.from(expected)
        const b = Buffer.from(parts.v1)
        return a.length === b.length && crypto.timingSafeEqual(a, b)
    },

    // Forma de pagamento do MP -> forma do app
    methodOf(payment) {
        if (payment.payment_method_id === 'pix') return 'pix'
        if (['credit_card', 'debit_card', 'prepaid_card'].includes(payment.payment_type_id)) return 'cartao'
        return 'pix' // saldo em conta / transferência: pagamento eletrônico
    },
}
