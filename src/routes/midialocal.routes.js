import { MidiaLocalController } from '../controllers/midialocal.controller.js'
import { authenticate } from './middleware/authMiddleware.js'

export async function midiaLocalRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        // protected routes
        fastify.get('/midialocal', MidiaLocalController.getAllMidiaLocals)
        fastify.get('/midialocal/:id', MidiaLocalController.getMidiaLocalById)
        fastify.post('/midialocal', MidiaLocalController.createMidiaLocal)
        fastify.patch('/midialocal/:id', MidiaLocalController.updateMidiaLocal)
        fastify.delete('/midialocal/:id', MidiaLocalController.deleteMidiaLocal)
    })
}