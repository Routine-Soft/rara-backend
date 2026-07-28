import { LessonProgressController } from '../controllers/lessonProgress.controller.js'
import { authenticate } from './middleware/authMiddleware.js'

export async function lessonProgressRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        fastify.get('/lesson-progresses', LessonProgressController.getAllProgress)
        fastify.get('/lesson-progresses/me', LessonProgressController.getMyProgress)
        fastify.get('/lesson-progresses/:id', LessonProgressController.getProgressById)
        fastify.post('/lesson-progresses', LessonProgressController.createProgress)
        fastify.post('/lessons/:lessonId/submit', LessonProgressController.submitLesson)
        fastify.patch('/lesson-progresses/:id', LessonProgressController.updateProgress)
        fastify.delete('/lesson-progresses/:id', LessonProgressController.deleteProgress)
    })
}