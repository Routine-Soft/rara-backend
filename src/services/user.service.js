import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'
import ChurchModel from '../models/church.model.js'
import { createUserDTO, updateUserDTO, loginUserDTO } from '../dtos/user.dto.js' 
import { verify } from 'node:crypto'
import AppError from '../errors/AppError.js'


export const UserService = {
    async findAll() {
        return await UserModel.find().populate('churchId')
    },

    async findById(id) {
        const user = await UserModel.findById(id).populate('churchId')
        if (!user) {
            throw new AppError('User not found', 404)
        }
        return user
    },

    async createUser(body) {
        const userDTO = createUserDTO(body)
        if(userDTO.churchId) {
            const church = await ChurchModel.findById(userDTO.churchId)
            if (!church) {
                throw new AppError('Church not found', 404)
            }
        }

        userDTO.password = await argon2.hash(userDTO.password)
        return await UserModel.create(userDTO)
    },

    async updateUser(id, body) {
        const userDTO = updateUserDTO(body)
        if (userDTO.churchId) {

            const church = await ChurchModel.findById(userDTO.churchId)
            if (!church) {
                throw new AppError("Church not found", 404)
            }
        }
        const user = await UserModel.findByIdAndUpdate(id, { $set: userDTO }, { new: true, runValidators: true })
        if (!user) {
            throw new AppError('User not found', 404)
        }
        return user
    },

    async deleteUser(id) {
        const user = await UserModel.findByIdAndDelete(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        return { message: 'User deleted successfully'}
    },

    async loginUser(body) {
        const userDTO = loginUserDTO(body)
        const {email, password} = userDTO
        const user = await UserModel.findOne({ email }).populate('churchId')
        if (!user) {
            throw new AppError('User not found', 404)
        }
        const valid = await argon2.verify(user.password, password)
        if (!valid) {
            throw new AppError('Invalid password', 401)
        }
        const accessToken = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' })
        const refreshToken = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' })
        user.tokenRefresh = refreshToken
        await user.save()
        return { accessToken, refreshToken, user: user.toJSON()}
    },

    async logoutUser(id) {
        const user = await UserModel.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        user.tokenRefresh = null
        await user.save()
        return { message: 'User logged out successfully' }
    },

    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            return decoded
        } catch (error) {
            throw new AppError('Invalid token', 401)
        }
    },

    async refresh(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
            const user = await UserModel.findById(decoded.id)
            if (!user || user.tokenRefresh !== refreshToken) throw new AppError('User not found', 404)
            const newAccessToken = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' })
            return { accessToken: newAccessToken }
        } catch (error) {
            throw new AppError('Invalid refresh token', 401)
        }
    },

    async updatePassword(id, body) {
        const { currentPassword, newPassword } = body
        const user = await UserModel.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        const valid = await argon2.verify(user.password, currentPassword)
        if (!valid) {
            throw new AppError('Invalid current password', 401) 
        }
        user.password = await argon2.hash(newPassword)
        await user.save()
        return { message: 'Password updated successfully' }
    }
}