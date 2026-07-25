import { ChristianGroupService } from '../services/christiangroup.service.js'

export const ChristianGroupController = {
    async getAllChristianGroups(req, reply) {
        const christianGroups = await ChristianGroupService.findAll()
        return reply.send(christianGroups)
    },

    async getChristianGroupById(req, reply) {
        const { id } = req.params
        const christianGroup = await ChristianGroupService.findById(id)
        return reply.send(christianGroup)
    },

    async createChristianGroup(req, reply) {
        const christianGroup = await ChristianGroupService.createChristianGroup(req.body)
        return reply.code(201).send(christianGroup)
    },

    async updateChristianGroup(req, reply) {
        const { id } = req.params
        const christianGroup = await ChristianGroupService.updateChristianGroup(id, req.body)
        return reply.send(christianGroup)
    },

    async deleteChristianGroup(req, reply) {
        const { id } = req.params
        const result = await ChristianGroupService.deleteChristianGroup(id)
        return reply.send(result)
    },
}
