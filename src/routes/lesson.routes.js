import { LessonController } from '../controllers/lesson.controller.js'
import { authenticate } from './middleware/authMiddleware.js'

export async function lessonRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        fastify.get('/lessons', LessonController.getAllLessons)
        fastify.get('/lessons/:id', LessonController.getLessonById)
        fastify.post('/lessons', LessonController.createLesson)
        fastify.patch('/lessons/:id', LessonController.updateLesson)
        fastify.delete('/lessons/:id', LessonController.deleteLesson)
    })
}