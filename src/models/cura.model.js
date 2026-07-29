// models/careRequest.model.js
import mongoose from 'mongoose'

const curaSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['cura_alma', 'reciclagem', 'gabinete_pastoral'],
    },
    status: {
        type: String,
        required: true,
        enum: ['fila_espera', 'andamento', 'concluido'],
        default: 'fila_espera',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: false, // qual pastor/atendente está cuidando do caso
    },
    notes: { type: String, required: false }, // anotações internas do pastor
    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Church",
        required: false
    },
    completedAt: { type: Date, required: false },
}, { timestamps: true })

const CuraModel = mongoose.models.Cura || mongoose.model('Cura', curaSchema)

export default CuraModel