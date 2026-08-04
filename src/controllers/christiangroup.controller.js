import { ChristianGroupService } from '../services/christiangroup.service.js'

export const ChristianGroupController = {
    async getAllChristianGroups(req, reply) {
        const christianGroups = await ChristianGroupService.findAll()
        return reply.send({ success: true, data: christianGroups, message: `Found ${christianGroups.length} christian groups` })
    },

    async getChristianGroupById(req, reply) {
        const { id } = req.params
        const christianGroup = await ChristianGroupService.findById(id)
        return reply.send({ success: true, data: christianGroup, message: 'Christian group retrieved successfully' })
    },

    async createChristianGroup(req, reply) {
        const christianGroup = await ChristianGroupService.createChristianGroup(req.body)
        return reply.code(201).send({ success: true, data: christianGroup, message: 'Christian group created successfully' })
    },

    async updateChristianGroup(req, reply) {
        const { id } = req.params
        const christianGroup = await ChristianGroupService.updateChristianGroup(id, req.body)
        return reply.send({ success: true, data: christianGroup, message: 'Christian group updated successfully' })
    },

    async deleteChristianGroup(req, reply) {
        const { id } = req.params
        await ChristianGroupService.deleteChristianGroup(id)
        return reply.send({ success: true, data: null, message: 'Christian group deleted successfully' })
    },
}
