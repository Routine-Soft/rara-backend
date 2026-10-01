import { GiftTestController } from '../controllers/giftTest.controller.js'
import { authenticate } from './middleware/authMiddleware.js'

// Testes dos Dons (Avançai): qualquer pessoa logada faz o seu
export async function giftTestRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        fastify.get('/gift-tests', GiftTestController.list)
        fastify.post('/gift-tests/:key/submit', GiftTestController.submit)
    })
}
