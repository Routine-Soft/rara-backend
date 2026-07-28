// models/lessonProgress.model.js
import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
    questionIndex: { type: Number, required: true },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
}, { _id: false })

const lessonProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'lessons', required: true },
    score: { type: Number, required: true },        // nº de acertos
    totalQuestions: { type: Number, required: true },
    answers: { type: [answerSchema], default: [] },
    completedAt: { type: Date, default: Date.now },
}, { timestamps: true })

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true })

const LessonProgressModel = mongoose.models.lessonprogresses || mongoose.model('lessonprogresses', lessonProgressSchema)

export default LessonProgressModel