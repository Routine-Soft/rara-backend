import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
    {
        address: { type: String, required: false },
        cep: { type: String, required: false },
        neighborhood: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        country: { type: String, required: false },
    },
    {
        _id: false,
    }
)

// Definindo o esquema para o ChristianGroup
const christianGroupSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Nome é obrigatório
    address: { type: addressSchema, required: false },
    leader: { type: String, required: false },
    coleader: { type: String, required: false },
    host: { type: String, required: false },
    contact: { type: [String], default: [], required: false },
    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Church",
        required: false
    },
}, { timestamps: true });

// Criando o modelo a partir do esquema
const ChristianGroup = mongoose.model('ChristianGroup', christianGroupSchema);

export default ChristianGroup;
