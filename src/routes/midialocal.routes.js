import { MidiaLocalController } from '../controllers/midialocal.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

export async function midiaLocalRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        // protected routes
        fastify.get('/midialocal', MidiaLocalController.getAllMidiaLocals)
        fastify.get('/midialocal/:id', MidiaLocalController.getMidiaLocalById)
        fastify.post('/midialocal', {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                    'midia_lider'
                ])
            }, MidiaLocalController.createMidiaLocal)
        fastify.patch('/midialocal/:id', {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                    'midia_lider'
                ])
            }, MidiaLocalController.updateMidiaLocal)
        fastify.delete('/midialocal/:id', {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                    'midia_lider'
                ])
            }, MidiaLocalController.deleteMidiaLocal)
    })
}