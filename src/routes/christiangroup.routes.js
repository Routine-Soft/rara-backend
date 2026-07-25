import { ChristianGroupController } from '../controllers/christiangroup.controller.js'
import { authenticate } from './middleware/authMiddleware.js'

export async function christianGroupRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        // protected routes
        fastify.get('/christiangroup', ChristianGroupController.getAllChristianGroups)
        fastify.get('/christiangroup/:id', ChristianGroupController.getChristianGroupById)
        fastify.post('/christiangroup', ChristianGroupController.createChristianGroup)
        fastify.patch('/christiangroup/:id', ChristianGroupController.updateChristianGroup)
        fastify.delete('/christiangroup/:id', ChristianGroupController.deleteChristianGroup)
    })
}
