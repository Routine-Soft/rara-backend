import { LessonService } from '../services/lesson.service.js'
import UserModel from '../models/user.model.js'

// super_admin cria/edita lições, então precisa ver o gabarito
async function canSeeAnswers(authUser) {
    const user = await UserModel.findById(authUser.id)
    return Array.isArray(user?.roles) && user.roles.includes('super_admin')
}

export const LessonController = {
    async getAllLessons(req, reply) {
        const lessons = await LessonService.findAll({ withAnswers: await canSeeAnswers(req.user) })
        return reply.send({ success: true, data: lessons, message: `Found ${lessons.length} lessons` })
    },

    async getLessonById(req, reply) {
        const { id } = req.params
        const lesson = await LessonService.findById(id, { withAnswers: await canSeeAnswers(req.user) })
        return reply.send({ success: true, data: lesson, message: 'Lesson retrieved successfully' })
    },

    async createLesson(req, reply) {
        const lesson = await LessonService.createLesson(req.body)
        return reply.code(201).send({ success: true, data: lesson, message: 'Lesson created successfully' })
    },

    async updateLesson(req, reply) {
        const { id } = req.params
        const lesson = await LessonService.updateLesson(id, req.body)
        return reply.send({ success: true, data: lesson, message: 'Lesson updated successfully' })
    },

    async deleteLesson(req, reply) {
        const { id } = req.params
        await LessonService.deleteLesson(id)
        return reply.send({ success: true, data: null, message: 'Lesson deleted successfully' })
    },
}