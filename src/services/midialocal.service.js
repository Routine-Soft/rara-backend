import MidiaLocalModel from '../models/midialocal.model.js'
import ChurchModel from '../models/church.model.js'
import { createMidiaLocalDTO, updateMidiaLocalDTO } from '../dtos/midialocal.dto.js'
import AppError from '../errors/AppError.js'

export const MidiaLocalService = {
    async findAll() {
        return await MidiaLocalModel.find().populate('churchId')
    },

    async findById(id) {
        const midiaLocal = await MidiaLocalModel.findById(id).populate('churchId')
        if (!midiaLocal) {
            throw new AppError('MidiaLocal not found', 404)
        }
        return midiaLocal
    },

    async createMidiaLocal(body) {
        const midiaLocalDTO = createMidiaLocalDTO(body)

        if (midiaLocalDTO.churchId) {
            const church = await ChurchModel.findById(midiaLocalDTO.churchId)
            if (!church) {
                throw new AppError('Church not found', 404)
            }
        }

        return await MidiaLocalModel.create(midiaLocalDTO)
    },

    async updateMidiaLocal(id, body) {
        const midiaLocalDTO = updateMidiaLocalDTO(body)

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

    async deleteMidiaLocal(id) {
        const midiaLocal = await MidiaLocalModel.findByIdAndDelete(id)

        if (!midiaLocal) {
            throw new AppError('MidiaLocal not found', 404)
        }

        return { message: 'MidiaLocal deleted successfully' }
    },
}