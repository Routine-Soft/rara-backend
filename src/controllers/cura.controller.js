// controllers/cura.controller.js
import { CuraService } from '../services/cura.service.js'

export const CuraController = {
    async create(request, reply) {
        const careRequest = await CuraService.create(request.body, request.user.id)
        return reply.status(201).send({ success: true, data: careRequest, message: 'Care request created successfully' })
    },

    async getAll(request, reply) {
        const { status, type } = request.query
        const requests = await CuraService.findAll({ status, type }, request.user)
        return reply.send({ success: true, data: requests, message: `Found ${requests.length} care requests` })
    },

    async getMine(request, reply) {
        const requests = await CuraService.findByUser(request.user.id)
        return reply.send({ success: true, data: requests, message: `Found ${requests.length} of your care requests` })
    },

    async getById(request, reply) {
        const careRequest = await CuraService.findById(request.params.id, request.user)
        return reply.send({ success: true, data: careRequest, message: 'Care request retrieved successfully' })
    },

    async update(request, reply) {
        const careRequest = await CuraService.update(request.params.id, request.body, request.user)
        return reply.send({ success: true, data: careRequest, message: 'Care request updated successfully' })
    },

    async updateStatus(request, reply) {
        const careRequest = await CuraService.updateStatus(request.params.id, request.body, request.user)
        return reply.send({ success: true, data: careRequest, message: 'Care request status updated successfully' })
    },

    async remove(request, reply) {
        await CuraService.delete(request.params.id, request.user)
        return reply.send({ success: true, data: null, message: 'Care request deleted successfully' })
    },

    async getSummary(request, reply) {
        const summary = await CuraService.summary(request.user)
        return reply.send({ success: true, data: summary, message: 'Summary retrieved successfully' })
    },
}