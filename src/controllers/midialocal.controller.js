import { MidiaLocalService } from '../services/midialocal.service.js'

export const MidiaLocalController = {
    async getAllMidiaLocals(req, reply) {
        const midiaLocals = await MidiaLocalService.findAll()
        return reply.send(midiaLocals)
    },

    async getMidiaLocalById(req, reply) {
        const { id } = req.params
        const midiaLocal = await MidiaLocalService.findById(id)
        return reply.send(midiaLocal)
    },

    async createMidiaLocal(req, reply) {
        const midiaLocal = await MidiaLocalService.createMidiaLocal(req.body)
        return reply.code(201).send(midiaLocal)
    },

    async updateMidiaLocal(req, reply) {
        const { id } = req.params
        const midiaLocal = await MidiaLocalService.updateMidiaLocal(id, req.body)
        return reply.send(midiaLocal)
    },

    async deleteMidiaLocal(req, reply) {
        const { id } = req.params
        const result = await MidiaLocalService.deleteMidiaLocal(id)
        return reply.send(result)
    },
}