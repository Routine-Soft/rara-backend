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

// Definindo o schema para a Igreja
const churchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pastor1: { type: String, required: false },
  pastor2: { type: String, required: false },
  address: { type: addressSchema, required: false },
  cnpj: { type: String, required: false },
  logoUrl: { type: String, required: false },
  totalMembers: { type: Number, required: false, default: 0 }, // save members, not users
});

// Criando o modelo a partir do schema
const Church = mongoose.models.Church || mongoose.model('Church', churchSchema);

export default Church;
