// controllers/dizimoOferta.controller.js
import { DizimoOfertaService } from '../services/dizimoOferta.service.js'

export const DizimoOfertaController = {
    async getMine(request, reply) {
        const data = await DizimoOfertaService.findMine(request.user.id)
        return reply.send({ success: true, data, message: `Found ${data.length} contributions` })
    },

    async declare(request, reply) {
        const data = await DizimoOfertaService.declare(request.body ?? {}, request.user.id)
        return reply.status(201).send({ success: true, data, message: 'Contribution registered' })
    },

    async checkout(request, reply) {
        const data = await DizimoOfertaService.checkout(request.body ?? {}, request.user.id)
        return reply.status(201).send({ success: true, data, message: 'Checkout created' })
    },

    async removeMine(request, reply) {
        await DizimoOfertaService.removeMine(request.params.id, request.user.id)
        return reply.send({ success: true, data: null, message: 'Contribution deleted' })
    },

    // público: chamado pelo Mercado Pago
    async webhook(request, reply) {
        const result = await DizimoOfertaService.handleWebhook({
            query: request.query ?? {},
            body: request.body,
            headers: request.headers,
        })
        request.log.info({ mercadoPago: result }, 'Mercado Pago webhook')
        return reply.send({ success: true, data: result, message: 'ok' })
    },

    async list(request, reply) {
        const data = await DizimoOfertaService.list(request.query ?? {}, request.user)
        return reply.send({ success: true, data, message: `Found ${data.length} contributions` })
    },

    async report(request, reply) {
        const data = await DizimoOfertaService.report(request.query ?? {}, request.user)
        return reply.send({ success: true, data, message: 'Report generated' })
    },

    async createManual(request, reply) {
        const data = await DizimoOfertaService.createManual(request.body ?? {}, request.user)
        return reply.status(201).send({ success: true, data, message: 'Contribution registered' })
    },

    async remove(request, reply) {
        await DizimoOfertaService.remove(request.params.id, request.user)
        return reply.send({ success: true, data: null, message: 'Contribution deleted' })
    },
}
