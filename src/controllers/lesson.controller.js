import { LessonService } from '../services/lesson.service.js'

export const LessonController = {
    async getAllLessons(req, reply) {
        const lessons = await LessonService.findAll()
        return reply.send(lessons)
    },

    async getLessonById(req, reply) {
        const { id } = req.params
        const lesson = await LessonService.findById(id)
        return reply.send(lesson)
    },

    async createLesson(req, reply) {
        const lesson = await LessonService.createLesson(req.body)
        return reply.code(201).send(lesson)
    },

    async updateLesson(req, reply) {
        const { id } = req.params
        const lesson = await LessonService.updateLesson(id, req.body)
        return reply.send(lesson)
    },

    async deleteLesson(req, reply) {
        const { id } = req.params
        const result = await LessonService.deleteLesson(id)
        return reply.send(result)
    },
}