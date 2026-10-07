import jwt from 'jsonwebtoken'
import AppError from '../../errors/AppError.js'
import UserModel from '../../models/user.model.js'
import { expandRoles } from '../../utils/teams.js'

export async function authenticate(req, reply) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        throw new AppError('Token not provided', 401)
    }

    const token = authHeader.replace('Bearer ', '')

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // deixa os dados do usuário disponíveis
        req.user = decoded

    } catch (error) {
        throw new AppError('Invalid token', 401)
    }
}

export function authorize(allowedRoles = []) {
    return async function (req, reply) {
        if (!req.user?.id) {
            throw new AppError('Invalid token', 401)
        }

        const user = await UserModel.findById(req.user.id)
        if (!user) {
            throw new AppError('User not found', 404)
        }

        // Equipe do departamento vale como o líder (utils/teams.js)
        const roles = expandRoles(Array.isArray(user.roles) ? user.roles : [])
        // super_admin (Super Intendente Geral) acessa tudo
        const hasAccess = roles.includes('super_admin') ||
            roles.some(role => allowedRoles.includes(role))

        if (!hasAccess) {
            throw new AppError('Forbidden', 403)
        }
    }
}