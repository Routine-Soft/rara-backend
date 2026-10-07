import { LessonProgressController } from '../controllers/lessonProgress.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

export async function lessonProgressRoutes(fastify) {
    fastify.register(async function (fastify) {
        fastify.addHook('preHandler', authenticate)

        fastify.get('/lesson-progresses', {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                    'secretaria_igreja',
                    'avancai_lider',
                    'departamento_lider',
                    'christian_group_lider',
                    'facilitador',
                    'secretaria_cura'
                ])
            }, LessonProgressController.getAllProgress)
        fastify.get('/lesson-progresses/me', LessonProgressController.getMyProgress)
        fastify.get('/lesson-progresses/:id', LessonProgressController.getProgressById)
        fastify.post('/lesson-progresses', LessonProgressController.createProgress)
        fastify.post('/lessons/:lessonId/submit', LessonProgressController.submitLesson)
        fastify.patch('/lesson-progresses/:id', LessonProgressController.updateProgress)
        fastify.delete('/lesson-progresses/:id', LessonProgressController.deleteProgress)
    })
}