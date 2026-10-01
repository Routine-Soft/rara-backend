// models/paymentSettings.model.js
// Chaves do Mercado Pago de cada igreja (o dinheiro cai na conta da igreja).
// Os segredos ficam criptografados (ver utils/crypto.js).
import mongoose from 'mongoose'

const paymentSettingsSchema = new mongoose.Schema({
    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church',
        required: true,
        unique: true,
    },
    publicKey: { type: String, required: false },
    accessTokenEnc: { type: String, required: true },
    webhookSecretEnc: { type: String, required: false }, // "assinatura secreta" do webhook no painel do MP
    accessTokenHint: { type: String, required: false },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: false,
    },
}, { timestamps: true })

const PaymentSettingsModel = mongoose.models.PaymentSettings || mongoose.model('PaymentSettings', paymentSettingsSchema)

export default PaymentSettingsModel
