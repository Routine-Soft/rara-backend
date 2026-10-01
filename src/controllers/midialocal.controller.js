import { MidiaLocalService } from '../services/midialocal.service.js'

export const MidiaLocalController = {
    async getAllMidiaLocals(req, reply) {
        const midiaLocals = await MidiaLocalService.findAll()
        return reply.send({ success: true, data: midiaLocals, message: `Found ${midiaLocals.length} midia locals` })
    },

    async getMidiaLocalById(req, reply) {
        const { id } = req.params
        const midiaLocal = await MidiaLocalService.findById(id)
        return reply.send({ success: true, data: midiaLocal, message: 'Midia local retrieved successfully' })
    },

    async createMidiaLocal(req, reply) {
        const midiaLocal = await MidiaLocalService.createMidiaLocal(req.body)
        return reply.code(201).send({ success: true, data: midiaLocal, message: 'Midia local created successfully' })
    },

    async updateMidiaLocal(req, reply) {
        const { id } = req.params
        const midiaLocal = await MidiaLocalService.updateMidiaLocal(id, req.body)
        return reply.send({ success: true, data: midiaLocal, message: 'Midia local updated successfully' })
    },

    async deleteMidiaLocal(req, reply) {
        const { id } = req.params
        await MidiaLocalService.deleteMidiaLocal(id)
        return reply.send({ success: true, data: null, message: 'Midia local deleted successfully' })
    },

    async reorder(req, reply) {
        const midiaLocals = await MidiaLocalService.reorder(req.body)
        return reply.send({ success: true, data: midiaLocals, message: 'Order updated successfully' })
    },
}
