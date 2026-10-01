// routes/dizimoOferta.routes.js
import { DizimoOfertaController } from '../controllers/dizimoOferta.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

// quem vê o relatório e registra contribuições de outras pessoas
const treasury = authorize(['super_admin', 'pastor_local', 'tesouraria'])

export async function dizimoOfertaRoutes(fastify) {
    // webhook do Mercado Pago: público (a autenticidade é conferida consultando
    // o pagamento na API do MP e, se configurada, pela assinatura secreta)
    fastify.post('/dizimo-oferta/webhook', DizimoOfertaController.webhook)

    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        // membro
        fastify.get('/dizimo-oferta/me', DizimoOfertaController.getMine)
        fastify.post('/dizimo-oferta/me', DizimoOfertaController.declare)
        fastify.delete('/dizimo-oferta/me/:id', DizimoOfertaController.removeMine)
        fastify.post('/dizimo-oferta/checkout', DizimoOfertaController.checkout)

        // tesouraria
        fastify.get('/dizimo-oferta', { preHandler: treasury }, DizimoOfertaController.list)
        fastify.get('/dizimo-oferta/report', { preHandler: treasury }, DizimoOfertaController.report)
        fastify.post('/dizimo-oferta', { preHandler: treasury }, DizimoOfertaController.createManual)
        fastify.delete('/dizimo-oferta/:id', { preHandler: treasury }, DizimoOfertaController.remove)
    })
}
