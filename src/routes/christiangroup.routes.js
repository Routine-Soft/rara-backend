import { ChristianGroupController } from '../controllers/christiangroup.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

export async function christianGroupRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        // protected routes
        fastify.get('/christiangroup', ChristianGroupController.getAllChristianGroups)
        fastify.get('/christiangroup/:id', ChristianGroupController.getChristianGroupById)
        fastify.post('/christiangroup', {
                        preHandler: authorize([
                            'super_admin',
                            'pastor_local',
                            'christian_group_lider'
                        ])
                    }, ChristianGroupController.createChristianGroup)
        fastify.patch('/christiangroup/:id', {
                        preHandler: authorize([
                            'super_admin',
                            'pastor_local',
                            'christian_group_lider'
                        ])
                    }, ChristianGroupController.updateChristianGroup)
        fastify.delete('/christiangroup/:id', {
                        preHandler: authorize([
                            'super_admin',
                            'pastor_local',
                            'christian_group_lider'
                        ])
                    }, ChristianGroupController.deleteChristianGroup)
    })
}
