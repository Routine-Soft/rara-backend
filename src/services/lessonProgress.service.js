import LessonModel from '../models/lesson.model.js'
import LessonProgressModel from '../models/lessonProgress.model.js'
import UserModel from '../models/user.model.js'
import {
    submitLessonProgressDTO,
    createLessonProgressDTO,
    updateLessonProgressDTO,
} from '../dtos/lessonProgress.dto.js'
import AppError from '../errors/AppError.js'

export const LessonProgressService = {
    async findAll() {
        return await LessonProgressModel.find().populate('userId').populate('lessonId')
    },

    async findById(id) {
        const progress = await LessonProgressModel.findById(id).populate('userId').populate('lessonId')

        if (!progress) {
            throw new AppError('Lesson progress not found', 404)
        }

        return progress
    },

    async findMyProgress(userId) {
        return await LessonProgressModel.find({ userId }).populate('lessonId')
    },

    async createLessonProgress(body) {
        const lessonProgressDTO = createLessonProgressDTO(body)

        const user = await UserModel.findById(lessonProgressDTO.userId)
        if (!user) {
            throw new AppError('User not found', 404)
        }

        const lesson = await LessonModel.findById(lessonProgressDTO.lessonId)
        if (!lesson) {
            throw new AppError('Lesson not found', 404)
        }

        // Recalcular isCorrect baseado na lição
        let score = 0
        const gradedAnswers = lessonProgressDTO.answers.map(answer => {
            const question = lesson.questions[answer.questionIndex]

            if (!question) {
                throw new AppError('Invalid question index', 400)
            }

            const isCorrect = question.correctOptionIndex === answer.selectedOptionIndex

            if (isCorrect) {
                score++
            }

            return {
                questionIndex: answer.questionIndex,
                selectedOptionIndex: answer.selectedOptionIndex,
                isCorrect,
            }
        })

        lessonProgressDTO.answers = gradedAnswers
        lessonProgressDTO.score = score

        return await LessonProgressModel.create(lessonProgressDTO)
    },

    async submitLesson(userId, lessonId, body) {
        const lessonProgressDTO = submitLessonProgressDTO(body)
        const lesson = await LessonModel.findById(lessonId)

        if (!lesson) {
            throw new AppError('Lesson not found', 404)
        }

        if (!Array.isArray(lessonProgressDTO.answers)) {
            throw new AppError('Answers are required', 400)
        }

        let score = 0

        const gradedAnswers = lessonProgressDTO.answers.map(answer => {
            const question = lesson.questions[answer.questionIndex]

            if (!question) {
                throw new AppError('Invalid question index', 400)
            }

            const isCorrect = question.correctOptionIndex === answer.selectedOptionIndex

            if (isCorrect) {
                score++
            }

            return { ...answer, isCorrect }
        })

        const progress = await LessonProgressModel.findOneAndUpdate(
            { userId, lessonId },
            {
                score,
                totalQuestions: lesson.questions.length,
                answers: gradedAnswers,
                completedAt: new Date(),
            },
            { upsert: true, new: true, runValidators: true }
        )

        return {
            score,
            total: lesson.questions.length,
            answers: gradedAnswers,
            progress,
        }
    },

    async updateLessonProgress(id, body) {
        const progress = await LessonProgressModel.findById(id)

        if (!progress) {
            throw new AppError('Lesson progress not found', 404)
        }

        const lessonProgressDTO = updateLessonProgressDTO(body)

        // Se há respostas (answers), recalcular score e isCorrect baseado na lição
        if (Array.isArray(lessonProgressDTO.answers) && lessonProgressDTO.answers.length > 0) {
            const lesson = await LessonModel.findById(progress.lessonId)

            if (!lesson) {
                throw new AppError('Lesson not found', 404)
            }

            let score = 0
            const gradedAnswers = lessonProgressDTO.answers.map(answer => {
                const question = lesson.questions[answer.questionIndex]

                if (!question) {
                    throw new AppError('Invalid question index', 400)
                }

                const isCorrect = question.correctOptionIndex === answer.selectedOptionIndex

                if (isCorrect) {
                    score++
                }

                return {
                    questionIndex: answer.questionIndex,
                    selectedOptionIndex: answer.selectedOptionIndex,
                    isCorrect,
                }
            })

            lessonProgressDTO.answers = gradedAnswers
            lessonProgressDTO.score = score
        }

        const updatedProgress = await LessonProgressModel.findByIdAndUpdate(
            id,
            { $set: lessonProgressDTO },
            { new: true, runValidators: true }
        )

        return updatedProgress
    },

    async deleteLessonProgress(id) {
        const progress = await LessonProgressModel.findByIdAndDelete(id)

        if (!progress) {
            throw new AppError('Lesson progress not found', 404)
        }

        return null
    },
}