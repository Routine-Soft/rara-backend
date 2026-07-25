import ChristianGroupModel from '../models/christiangroup.model.js'
import ChurchModel from '../models/church.model.js'
import { createChristianGroupDTO, updateChristianGroupDTO } from '../dtos/christiangroup.dto.js'
import AppError from '../errors/AppError.js'

export const ChristianGroupService = {
    async findAll() {
        return await ChristianGroupModel.find().populate('churchId')
    },

    async findById(id) {
        const christianGroup = await ChristianGroupModel.findById(id).populate('churchId')
        if (!christianGroup) {
            throw new AppError('ChristianGroup not found', 404)
        }
        return christianGroup
    },

    async createChristianGroup(body) {
        const christianGroupDTO = createChristianGroupDTO(body)

        if (christianGroupDTO.churchId) {
            const church = await ChurchModel.findById(christianGroupDTO.churchId)
            if (!church) {
                throw new AppError('Church not found', 404)
            }
        }

        return await ChristianGroupModel.create(christianGroupDTO)
    },

    async updateChristianGroup(id, body) {
        const christianGroupDTO = updateChristianGroupDTO(body)

        if (christianGroupDTO.churchId) {
            const church = await ChurchModel.findById(christianGroupDTO.churchId)
            if (!church) {
                throw new AppError('Church not found', 404)
            }
        }

        const christianGroup = await ChristianGroupModel.findByIdAndUpdate(
            id,
            { $set: christianGroupDTO },
            { new: true, runValidators: true }
        )

        if (!christianGroup) {
            throw new AppError('ChristianGroup not found', 404)
        }

        return christianGroup
    },

    async deleteChristianGroup(id) {
        const christianGroup = await ChristianGroupModel.findByIdAndDelete(id)

        if (!christianGroup) {
            throw new AppError('ChristianGroup not found', 404)
        }

        return { message: 'ChristianGroup deleted successfully' }
    },
}
