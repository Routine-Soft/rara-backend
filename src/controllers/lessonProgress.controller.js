import { LessonProgressService } from '../services/lessonProgress.service.js'

export const LessonProgressController = {
    async getAllProgress(req, reply) {
        const progress = await LessonProgressService.findAll()
        return reply.send(progress)
    },

    async getProgressById(req, reply) {
        const { id } = req.params
        const progress = await LessonProgressService.findById(id)
        return reply.send(progress)
    },

    async getMyProgress(req, reply) {
        const progress = await LessonProgressService.findMyProgress(req.user.id)
        return reply.send(progress)
    },

    async createProgress(req, reply) {
        const progress = await LessonProgressService.createLessonProgress(req.body)
        return reply.code(201).send(progress)
    },

    async submitLesson(req, reply) {
        const { lessonId } = req.params
        const progress = await LessonProgressService.submitLesson(req.user.id, lessonId, req.body)
        return reply.send(progress)
    },

    async updateProgress(req, reply) {
        const { id } = req.params
        const progress = await LessonProgressService.updateLessonProgress(id, req.body)
        return reply.send(progress)
    },

    async deleteProgress(req, reply) {
        const { id } = req.params
        const result = await LessonProgressService.deleteLessonProgress(id)
        return reply.send(result)
    },
}