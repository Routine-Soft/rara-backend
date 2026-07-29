// routes/cura.routes.js
import { CuraController } from '../controllers/cura.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

export async function curaRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        // lado do paciente
        fastify.post('/cura', CuraController.create)
        fastify.get('/cura/me', CuraController.getMine)

        // lado do gestor (pastor / admin) — Kanban
        fastify.register(async function (fastify) {
            fastify.addHook('preHandler', authorize(['pastor_local', 'super_admin']))

            fastify.get('/cura', CuraController.getAll)               // lista tudo, filtra por status/type
            fastify.get('/cura/summary', CuraController.getSummary)   // contadores do dashboard
            fastify.get('/cura/:id', CuraController.getById)
            fastify.patch('/cura/:id', CuraController.update)         // editar dados (notas, tipo, responsável)
            fastify.patch('/cura/:id/status', CuraController.updateStatus) // drag-and-drop
            fastify.delete('/cura/:id', CuraController.remove)
        })
    })
}