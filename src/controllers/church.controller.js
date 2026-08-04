import { ChurchService } from '../services/church.service.js'

export const ChurchController = {
    async getAllChurchs(req, reply) {
        const churches = await ChurchService.findAll()
        return reply.send({
            success: true,
            data: churches,
            message: `Found ${churches.length} churches`,
        })
    },

    async getChurchById(req, reply) {
        const { id } = req.params
        const church = await ChurchService.findById(id)
        return reply.send({
            success: true,
            data: church,
            message: 'Church retrieved successfully',
        })
    },

    async createChurch(req, reply) {
        const church = await ChurchService.createChurch(req.body)
        return reply.code(201).send({
            success: true,
            data: church,
            message: 'Church created successfully',
        })
    },

    async updateChurch(req, reply) {
        const { id } = req.params
        const church = await ChurchService.updateChurch(id, req.body)
        return reply.send({
            success: true,
            data: church,
            message: 'Church updated successfully',
        })
    },

    async deleteChurch(req, reply) {
        const { id } = req.params
        await ChurchService.deleteChurch(id)
        return reply.send({
            success: true,
            data: null,
            message: 'Church deleted successfully',
        })
    },
}