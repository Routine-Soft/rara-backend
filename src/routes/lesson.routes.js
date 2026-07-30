import { LessonController } from '../controllers/lesson.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

export async function lessonRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        fastify.get('/lessons', LessonController.getAllLessons)
        fastify.get('/lessons/:id', LessonController.getLessonById)
        fastify.post('/lessons', {
                preHandler: authorize([
                    'super_admin',
                ])
            }, LessonController.createLesson)
        fastify.patch('/lessons/:id', {
                preHandler: authorize([
                    'super_admin',
                ])
            }, LessonController.updateLesson)
        fastify.delete('/lessons/:id', {
                preHandler: authorize([
                    'super_admin',
                ])
            }, LessonController.deleteLesson)
    })
}