import ChurchModel from '../models/church.model.js'
import { createChurchDTO, updateChurchDTO } from '../dtos/church.dto.js'
import AppError from '../errors/AppError.js'

export const ChurchService = {
    async findAll() {
        return await ChurchModel.find()
    },

    async findById(id) {
        const church = await ChurchModel.findById(id)
        if (!church) {
            throw new AppError('Church not found', 404)
        }
        return church
    },

    async createChurch(body) {
        const churchDTO = createChurchDTO(body)
        return await ChurchModel.create(churchDTO)
    },

    async updateChurch(id, body) {
        const churchDTO = updateChurchDTO(body)
        const church = await ChurchModel.findByIdAndUpdate(
            id,
            { $set: churchDTO },
            { new: true, runValidators: true }
        )
        if (!church) {
            throw new AppError('Church not found', 404)
        }
        return church
    },

    async deleteChurch(id) {
        const church = await ChurchModel.findByIdAndDelete(id)
        if (!church) {
            throw new AppError('Church not found', 404)
        }
        return { message: 'Church deleted successfully' }
    },
}