import jwt from 'jsonwebtoken'
import AppError from '../../errors/AppError.js'

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