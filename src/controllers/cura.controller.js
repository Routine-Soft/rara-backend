// controllers/cura.controller.js
import { CuraService } from '../services/cura.service.js'

export const CuraController = {
    async create(request, reply) {
        const careRequest = await CuraService.create(request.body, request.user.id)
        return reply.status(201).send(careRequest)
    },

    async getAll(request, reply) {
        const { status, type } = request.query
        const requests = await CuraService.findAll({ status, type }, request.user)
        return reply.send(requests)
    },

    async getMine(request, reply) {
        const requests = await CuraService.findByUser(request.user.id)
        return reply.send(requests)
    },

    async getById(request, reply) {
        const careRequest = await CuraService.findById(request.params.id, request.user)
        return reply.send(careRequest)
    },

    async update(request, reply) {
        const careRequest = await CuraService.update(request.params.id, request.body, request.user)
        return reply.send(careRequest)
    },

    async updateStatus(request, reply) {
        const careRequest = await CuraService.updateStatus(request.params.id, request.body, request.user)
        return reply.send(careRequest)
    },

    async remove(request, reply) {
        const result = await CuraService.delete(request.params.id, request.user)
        return reply.send(result)
    },

    async getSummary(request, reply) {
        const summary = await CuraService.summary(request.user)
        return reply.send(summary)
    },
}