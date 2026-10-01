// routes/paymentSettings.routes.js
import { PaymentSettingsController } from '../controllers/paymentSettings.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

// chaves do Mercado Pago: programador (e o super_admin, que acessa tudo)
const programmer = authorize(['programador'])

export async function paymentSettingsRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)
        fastify.addHook('preHandler', programmer)

        fastify.get('/payment-settings', PaymentSettingsController.list)
        fastify.put('/payment-settings/:churchId', PaymentSettingsController.save)
        fastify.delete('/payment-settings/:churchId', PaymentSettingsController.remove)
    })
}
