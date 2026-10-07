import mongoose from 'mongoose'
import MidiaLocalModel from '../models/midialocal.model.js'
import ChurchModel from '../models/church.model.js'
import UserModel from '../models/user.model.js'
import { createMidiaLocalDTO, updateMidiaLocalDTO } from '../dtos/midialocal.dto.js'
import AppError from '../errors/AppError.js'

// Igreja que a pessoa pode ver/mexer: null = todas (super_admin)
async function churchScope(authUser) {
    const user = await UserModel.findById(authUser?.id)
    if (!user) throw new AppError('User not found', 404)
    if ((user.roles ?? []).includes('super_admin')) return null
    return user.churchId ?? false // false = sem igreja: nenhuma mídia
}

// Mídia de outra igreja: só o super_admin mexe
async function assertCanTouch(authUser, midiaLocal) {
    const scope = await churchScope(authUser)
    if (scope === null) return
    const churchId = midiaLocal.churchId?._id ?? midiaLocal.churchId // pode vir populado
    if (!scope || String(churchId) !== String(scope)) {
        throw new AppError('Você só pode alterar as mídias da sua igreja', 403)
    }
}

export const MidiaLocalService = {
    // super_admin vê todas; os demais só as da própria igreja
    async findAll(authUser) {
        const scope = await churchScope(authUser)
        if (scope === false) return []
        const filter = scope ? { churchId: scope } : {}
        return await MidiaLocalModel.find(filter).sort({ order: 1, createdAt: 1 }).populate('churchId')
    },

    // Grava a nova ordem: ids na sequência em que devem aparecer
    async reorder(body, authUser) {
        const ids = body?.ids
        if (!Array.isArray(ids) || !ids.every((id) => mongoose.isValidObjectId(id))) {
            throw new AppError('Envie a lista de ids na nova ordem', 400)
        }
        const scope = await churchScope(authUser)
        if (scope !== null) {
            const others = await MidiaLocalModel.countDocuments({
                _id: { $in: ids },
                churchId: { $ne: scope || null },
            })
            if (!scope || others > 0) {
                throw new AppError('Você só pode ordenar as mídias da sua igreja', 403)
            }
        }
        await MidiaLocalModel.bulkWrite(ids.map((id, index) => ({
            updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
        })))
        return this.findAll(authUser)
    },

    async findById(id) {
        const midiaLocal = await MidiaLocalModel.findById(id).populate('churchId')
        if (!midiaLocal) {
            throw new AppError('MidiaLocal not found', 404)
        }
        return midiaLocal
    },

    async createMidiaLocal(body, authUser) {
        const midiaLocalDTO = createMidiaLocalDTO(body)

        // Quem não é super_admin cria sempre na própria igreja
        const scope = await churchScope(authUser)
        if (scope === false) throw new AppError('Seu usuário não tem igreja cadastrada', 400)
        if (scope) midiaLocalDTO.churchId = scope

        if (midiaLocalDTO.churchId) {
            const church = await ChurchModel.findById(midiaLocalDTO.churchId)
            if (!church) {
                throw new AppError('Church not found', 404)
            }
        }

        // Novo card entra no fim da lista
        const last = await MidiaLocalModel.findOne().sort({ order: -1 })
        midiaLocalDTO.order = (last?.order ?? -1) + 1
        return await MidiaLocalModel.create(midiaLocalDTO)
    },

    async updateMidiaLocal(id, body, authUser) {
        const midiaLocalDTO = updateMidiaLocalDTO(body)

        await assertCanTouch(authUser, await this.findById(id))
        const scope = await churchScope(authUser)
        if (scope) midiaLocalDTO.churchId = scope

        if (midiaLocalDTO.churchId) {
            const church = await ChurchModel.findById(midiaLocalDTO.churchId)
            if (!church) {
                throw new AppError('Church not found', 404)
            }
        }

        const midiaLocal = await MidiaLocalModel.findByIdAndUpdate(
            id,
            { $set: midiaLocalDTO },
            { new: true, runValidators: true }
        )

        if (!midiaLocal) {
            throw new AppError('MidiaLocal not found', 404)
        }

        return midiaLocal
    },

    async deleteMidiaLocal(id, authUser) {
        await assertCanTouch(authUser, await this.findById(id))
        const midiaLocal = await MidiaLocalModel.findByIdAndDelete(id)

        if (!midiaLocal) {
            throw new AppError('MidiaLocal not found', 404)
        }

        return null
    },
}