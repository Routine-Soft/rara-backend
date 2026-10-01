// models/dizimoOferta.model.js
// Uma contribuição (dízimo e/ou oferta). O histórico mês a mês da pessoa e os
// relatórios da tesouraria são montados somando estes registros.
import mongoose from 'mongoose'

const dizimoOfertaSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: false, // a tesouraria pode registrar quem não tem conta no app
    },
    donorName: { type: String, required: false }, // nome de quem deu, quando não é usuário do app
    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church',
        required: true,
    },
    // valores em reais; ambos opcionais (nem todo mês a pessoa dizima e oferta)
    tithe: { type: Number, required: false, min: 0 },
    offering: { type: Number, required: false, min: 0 },
    method: {
        type: String,
        enum: ['pix', 'dinheiro', 'cartao'],
        required: false, // no pagamento pelo app só se sabe depois que o Mercado Pago confirma
    },
    date: { type: Date, required: true, default: Date.now }, // dia da contribuição
    source: {
        type: String,
        enum: ['app', 'membro', 'tesouraria'],
        required: true,
        // app = pago pelo Mercado Pago | membro = a pessoa informou | tesouraria = registrado pelo adm
    },
    status: {
        type: String,
        enum: ['pendente', 'aprovado', 'recusado'],
        required: true,
        default: 'aprovado',
    },
    notes: { type: String, required: false },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: false, // quem cadastrou (tesouraria)
    },
    // Mercado Pago
    mpPreferenceId: { type: String, required: false },
    mpPaymentId: { type: String, required: false },
    paidAmount: { type: Number, required: false },
}, { timestamps: true })

dizimoOfertaSchema.index({ churchId: 1, date: -1 })
dizimoOfertaSchema.index({ userId: 1, date: -1 })

const DizimoOfertaModel = mongoose.models.DizimoOferta || mongoose.model('DizimoOferta', dizimoOfertaSchema)

export default DizimoOfertaModel
