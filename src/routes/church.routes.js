import { ChurchController } from '../controllers/church.controller.js'
import { authenticate } from './middleware/authMiddleware.js'

export async function churchRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        // protected routes
        fastify.get('/churchs', ChurchController.getAllChurchs)
        fastify.get('/churchs/:id', ChurchController.getChurchById)
        fastify.post('/churchs', ChurchController.createChurch)
        fastify.patch('/churchs/:id', ChurchController.updateChurch)
        fastify.delete('/churchs/:id', ChurchController.deleteChurch)
    })
}