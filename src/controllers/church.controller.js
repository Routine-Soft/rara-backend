import { ChurchService } from '../services/church.service.js'

export const ChurchController = {
    async getAllChurchs(req, reply) {
        const churches = await ChurchService.findAll()
        return reply.send(churches)
    },

    async getChurchById(req, reply) {
        const { id } = req.params
        const church = await ChurchService.findById(id)
        return reply.send(church)
    },

    async createChurch(req, reply) {
        const church = await ChurchService.createChurch(req.body)
        return reply.code(201).send(church)
    },

    async updateChurch(req, reply) {
        const { id } = req.params
        const church = await ChurchService.updateChurch(id, req.body)
        return reply.send(church)
    },

    async deleteChurch(req, reply) {
        const { id } = req.params
        const result = await ChurchService.deleteChurch(id)
        return reply.send(result)
    },
}