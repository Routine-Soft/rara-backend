import { ChurchController } from '../controllers/church.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

export async function churchRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        fastify.get('/churchs', ChurchController.getAllChurchs)

        // protected routes
        
        fastify.get('/churchs/:id', ChurchController.getChurchById)
        fastify.post('/churchs', {
                        preHandler: authorize([
                            'super_admin',
                        ])
                    }, ChurchController.createChurch)
        fastify.patch('/churchs/:id', {
                        preHandler: authorize([
                            'super_admin',
                        ])
                    }, ChurchController.updateChurch)
        fastify.delete('/churchs/:id', {
                        preHandler: authorize([
                            'super_admin',
                        ])
                    }, ChurchController.deleteChurch)
    })
}