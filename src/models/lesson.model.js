// models/lesson.model.js
import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    statement: { type: String, required: true },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true },
}, { _id: false })

const lessonSchema = new mongoose.Schema({
    module: {
        type: String,
        required: true,
        enum: ['reset', 'start', 'cdv'],
    },
    number: { type: Number, required: true }, // ordem dentro do módulo (1, 2, 3...)
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    content: { type: String, required: true }, // o texto que hoje está no .tsx
    image: { type: String, required: false }, // agora é URL (S3/Cloudinary), não require() local
    questions: { type: [questionSchema], default: [] },
}, { timestamps: true })

lessonSchema.index({ module: 1, number: 1 }, { unique: true })

const LessonModel = mongoose.models.lessons || mongoose.model('lessons', lessonSchema)

export default LessonModel