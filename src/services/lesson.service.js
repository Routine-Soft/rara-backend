import LessonModel from '../models/lesson.model.js'
import { createLessonDTO, updateLessonDTO, publicLessonDTO } from '../dtos/lesson.dto.js'
import AppError from '../errors/AppError.js'

export const LessonService = {
    async findAll() {
        const lessons = await LessonModel.find().sort({ module: 1, number: 1 })
        return lessons.map(publicLessonDTO)
    },

    async findById(id) {
        const lesson = await LessonModel.findById(id)

        if (!lesson) {
            throw new AppError('Lesson not found', 404)
        }

        return publicLessonDTO(lesson)
    },

    async createLesson(body) {
        const lessonDTO = createLessonDTO(body)
        return await LessonModel.create(lessonDTO)
    },

    async updateLesson(id, body) {
        const lessonDTO = updateLessonDTO(body)

        const lesson = await LessonModel.findByIdAndUpdate(
            id,
            { $set: lessonDTO },
            { new: true, runValidators: true }
        )

        if (!lesson) {
            throw new AppError('Lesson not found', 404)
        }

        return lesson
    },

    async deleteLesson(id) {
        const lesson = await LessonModel.findByIdAndDelete(id)

        if (!lesson) {
            throw new AppError('Lesson not found', 404)
        }

        return null
    },
}