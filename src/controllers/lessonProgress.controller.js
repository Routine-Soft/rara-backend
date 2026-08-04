import { LessonProgressService } from '../services/lessonProgress.service.js'

export const LessonProgressController = {
    async getAllProgress(req, reply) {
        const progress = await LessonProgressService.findAll()
        return reply.send({ success: true, data: progress, message: `Found ${progress.length} progress records` })
    },

    async getProgressById(req, reply) {
        const { id } = req.params
        const progress = await LessonProgressService.findById(id)
        return reply.send({ success: true, data: progress, message: 'Progress retrieved successfully' })
    },

    async getMyProgress(req, reply) {
        const progress = await LessonProgressService.findMyProgress(req.user.id)
        return reply.send({ success: true, data: progress, message: 'Your progress retrieved successfully' })
    },

    async createProgress(req, reply) {
        const progress = await LessonProgressService.createLessonProgress(req.body)
        return reply.code(201).send({ success: true, data: progress, message: 'Progress created successfully' })
    },

    async submitLesson(req, reply) {
        const { lessonId } = req.params
        const progress = await LessonProgressService.submitLesson(req.user.id, lessonId, req.body)
        return reply.send({ success: true, data: progress, message: 'Lesson submitted successfully' })
    },

    async updateProgress(req, reply) {
        const { id } = req.params
        const progress = await LessonProgressService.updateLessonProgress(id, req.body)
        return reply.send({ success: true, data: progress, message: 'Progress updated successfully' })
    },

    async deleteProgress(req, reply) {
        const { id } = req.params
        await LessonProgressService.deleteLessonProgress(id)
        return reply.send({ success: true, data: null, message: 'Progress deleted successfully' })
    },
}