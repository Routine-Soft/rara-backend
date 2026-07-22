import { UserService } from '../services/user.service.js'
import jwt from 'jsonwebtoken'

export const UserController = {
    async getAllUsers(req, reply) {
        const users = await UserService.findAll()
        return reply.send(users)
    },

    async getUserById(req, reply) {
        const { id } = req.params
        const user = await UserService.findById(id)
        return reply.send(user)
    },

    async createUser(req, reply) {
        const user = await UserService.createUser(req.body)
        return reply.code(201).send(user)
    },

    async updateUser(req, reply) {
        const { id } = req.params
        const user = await UserService.updateUser(id, req.body)
        return reply.send(user)
    },

    async deleteUser(req, reply) {
        const { id } = req.params
        const result = await UserService.deleteUser(id)
        return reply.send(result)
    },
    
    async loginUser(req, reply) {
        const result = await UserService.loginUser(req.body)
        return reply.send(result)
    },

    async logoutUser(req, reply) {
        const result = await UserService.logoutUser(req.user.id)
        return reply.send(result)
    },

    async refreshToken(req, reply) {
        const { refreshToken } = req.body
        const result = await UserService.refresh(refreshToken)
        return reply.send(result)
    },

    async updatePassword(req, reply) {
        const { id } = req.params
        const result = await UserService.updatePassword(id, req.body);
        return reply.send(result)
    },

    async createFacilitatorUser(req, reply) {
        const user = await UserService.createFacilitatorUser(req.body)
        return reply.code(201).send(user)
    },

    async updateFacilitatorUser(req, reply) {
        const { id } = req.params
        const user = await UserService.updateFacilitatorUser(id, req.body)
        return reply.send(user)
    },
}