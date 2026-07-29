// services/cura.service.js
import CuraModel from '../models/cura.model.js'
import UserModel from '../models/user.model.js'
import AppError from '../errors/AppError.js'
import { createCuraDTO, updateCuraDTO, updateStatusDTO } from '../dtos/cura.dto.js'

const VALID_STATUSES = ['fila_espera', 'andamento', 'concluido']

export const CuraService = {
    async create(body, userId) {
        const user = await UserModel.findById(userId)
        if (!user) throw new AppError('User not found', 404)

        const activeRequest = await CuraModel.findOne({
            userId,
            status: { $ne: 'concluido' },
        })

        if (activeRequest) {
            throw new AppError('You already have an active care request', 409)
        }

        const dto = createCuraDTO(body, userId, user.churchId)
        return await CuraModel.create(dto)
    },

    async getUserScope(userId) {
        const user = await UserModel.findById(userId)
        if (!user) throw new AppError('User not found', 404)

        const roles = Array.isArray(user.roles) ? user.roles : []
        const isSuperAdmin = roles.includes('super_admin')

        return {
            isSuperAdmin,
            churchId: user.churchId ?? null,
        }
    },

    // manager view: list all with optional filters and church scope
    async findAll(filters = {}, authUser) {
        const scope = await this.getUserScope(authUser.id)
        const query = {}
        if (filters.status) query.status = filters.status
        if (filters.type) query.type = filters.type
        if (!scope.isSuperAdmin) query.churchId = scope.churchId

        return await CuraModel.find(query)
            .populate('userId', 'name phone email')
            .populate('assignedTo', 'name')
            .sort({ createdAt: 1 })
    },

    // visão do paciente: só os pedidos dele
    async findByUser(userId) {
        return await CuraModel.find({ userId }).sort({ createdAt: -1 })
    },

    async findById(id, authUser) {
        const scope = await this.getUserScope(authUser.id)
        const query = { _id: id }
        if (!scope.isSuperAdmin) query.churchId = scope.churchId

        const careRequest = await CuraModel.findOne(query)
            .populate('userId', 'name phone email')
            .populate('assignedTo', 'name')
        if (!careRequest) throw new AppError('Care request not found', 404)
        return careRequest
    },

    async update(id, body, authUser) {
        const scope = await this.getUserScope(authUser.id)
        const dto = updateCuraDTO(body)

        if (dto.assignedTo) {
            const assignedUser = await UserModel.findById(dto.assignedTo)
            if (!assignedUser) throw new AppError('Assigned user not found', 404)
        }

        const query = { _id: id }
        if (!scope.isSuperAdmin) query.churchId = scope.churchId

        const careRequest = await CuraModel.findOneAndUpdate(query, { $set: dto }, { new: true, runValidators: true })
        if (!careRequest) throw new AppError('Care request not found', 404)
        return careRequest
    },

    // used by kanban drag-and-drop
    async updateStatus(id, body, authUser) {
        const scope = await this.getUserScope(authUser.id)
        const dto = updateStatusDTO(body)
        if (!VALID_STATUSES.includes(dto.status)) {
            throw new AppError('Invalid status', 400)
        }

        if (dto.status === 'concluido') {
            dto.completedAt = new Date()
        } else {
            dto.completedAt = null
        }

        const query = { _id: id }
        if (!scope.isSuperAdmin) query.churchId = scope.churchId

        const careRequest = await CuraModel.findOneAndUpdate(query, { $set: dto }, { new: true, runValidators: true })
        if (!careRequest) throw new AppError('Care request not found', 404)
        return careRequest
    },

    async delete(id, authUser) {
        const scope = await this.getUserScope(authUser.id)
        const query = { _id: id }
        if (!scope.isSuperAdmin) query.churchId = scope.churchId

        const careRequest = await CuraModel.findOneAndDelete(query)
        if (!careRequest) throw new AppError('Care request not found', 404)
        return { message: 'Care request deleted successfully' }
    },

    // dashboard counters
    async summary(authUser) {
        const scope = await this.getUserScope(authUser.id)
        const matchStage = !scope.isSuperAdmin ? [{ $match: { churchId: scope.churchId } }] : []

        const result = await CuraModel.aggregate([
            ...matchStage,
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ])

        const summary = { fila_espera: 0, andamento: 0, concluido: 0 }
        result.forEach(r => { summary[r._id] = r.count })
        return summary
    },
}