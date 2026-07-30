import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'
import ChurchModel from '../models/church.model.js'
import { createUserDTO, updateUserDTO, loginUserDTO, createFacilitatorUserDTO, updateFacilitatorUserDTO, updateUserRolesDTO } from '../dtos/user.dto.js'
import { verify } from 'node:crypto'
import AppError from '../errors/AppError.js'
import crypto from 'crypto'

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

    async createFacilitatorUser(body) {
        const userDTO = createFacilitatorUserDTO(body)

        if (userDTO.churchId) {
            const church = await ChurchModel.findById(userDTO.churchId)

            if (!church) {
                throw new AppError('Church not found', 404)
            }
        }

        const userExists = await UserModel.findOne({
            email: userDTO.email
        })

        if (userExists) {
            throw new AppError('User already exists', 409)
        }

        const password = crypto.randomBytes(6).toString('base64')

        userDTO.password = await argon2.hash(password)

        const user = await UserModel.create(userDTO)

        // TODO: Enviar senha pelo WhatsApp
        console.log({
            phone: user.phone,
            email: user.email,
            password
        })

        return user
    },

    async updateUserRoles(id, body, authUser) {
        const userDTO = updateUserRolesDTO(body)
        const loggedUser = await UserModel.findById(authUser.id)
        if (!loggedUser) {
            throw new AppError('Authenticated user not found', 404)
        }

        const targetUser = await UserModel.findById(id)
        if (!targetUser) {
            throw new AppError('User not found', 404)
        }

        const loggedRoles = Array.isArray(loggedUser.roles)
            ? loggedUser.roles
            : []

        const targetRoles = Array.isArray(targetUser.roles)
            ? targetUser.roles
            : []

        const loggedIsSuperAdmin = loggedRoles.includes('super_admin')
        const loggedIsPastor = loggedRoles.includes('pastor_local')
        const targetIsSuperAdmin = targetRoles.includes('super_admin')

        // Super Admin não pode remover o próprio cargo.
        if (
            loggedIsSuperAdmin &&
            loggedUser.id.toString() === targetUser.id.toString() &&
            !userDTO.roles.includes('super_admin')
        ) {
            throw new AppError(
                'You cannot remove your own super_admin role.',
                403
            )
        }

        // Pastor não pode editar um Super Admin.
        if (
            loggedIsPastor &&
            targetIsSuperAdmin
        ) {
            throw new AppError(
                'Pastor cannot edit a super admin.',
                403
            )
        }

        // Pastor não pode criar um novo Super Admin.
        if (
            loggedIsPastor &&
            userDTO.roles.includes('super_admin')
        ) {
            throw new AppError(
                'Pastor cannot assign the super_admin role.',
                403
            )
        }

        targetUser.roles = userDTO.roles
        await targetUser.save()
        return targetUser
    },

    async updateFacilitatorUser(id, body) {
        const userDTO = updateFacilitatorUserDTO(body)
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
        const accessToken = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '24h' })
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

    async refresh(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

            console.log(decoded)

            const user = await UserModel.findById(decoded.id)

            console.log(user)

            if (!user) {
                throw new AppError("User not found", 404)
            }

            if (user.tokenRefresh !== refreshToken) {
                throw new AppError("Invalid refresh token", 401)
            }

            const newAccessToken = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )

            return { accessToken: newAccessToken }

        } catch (error) {
            console.log(error) // <-- MUITO IMPORTANTE
            throw error
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
    },
}