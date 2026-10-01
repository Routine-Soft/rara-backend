// routes/cura.routes.js
import { CuraController } from '../controllers/cura.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

// quem gerencia o Kanban de cura
const managers = authorize(['super_admin', 'pastor_local', 'secretaria_cura'])

export async function curaRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        // lado do paciente
        fastify.post('/cura', CuraController.create)
        fastify.get('/cura/me', CuraController.getMine)
        fastify.patch('/cura/:id/cancel', CuraController.cancel) // só o dono do pedido

        // lado do gestor (pastor / admin / secretaria) — Kanban
        fastify.get('/cura', { preHandler: managers }, CuraController.getAll)               // lista tudo, filtra por status/type
        fastify.get('/cura/summary', { preHandler: managers }, CuraController.getSummary)    // contadores do dashboard
        fastify.get('/cura/:id', { preHandler: managers }, CuraController.getById)
        fastify.patch('/cura/:id', { preHandler: managers }, CuraController.update)          // editar dados (notas, tipo, responsável)
        fastify.patch('/cura/:id/status', { preHandler: managers }, CuraController.updateStatus) // drag-and-drop
        fastify.delete('/cura/:id', { preHandler: managers }, CuraController.remove)
    })
}
