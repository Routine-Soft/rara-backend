import mongoose from 'mongoose'

// Definindo o esquema para o ChristianGroup
const christianGroupSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true // Nome é obrigatório
  },
  endereco: {
    type: String,
    required: true // Endereço é obrigatório
  },
  lider: {
    type: String,
    required: true // Nome do líder é obrigatório
  },
  colider: {
    type: String,
    required: false // Nome do co-líder é opcional
  },
  anfitriao: {
    type: String,
    required: false // Nome do anfitrião é obrigatório
  },
  contato: {
    type: String,
    required: false
  },
  img: {
    type: String,
    required: false
  },
  igreja: {
    type: String,
    required: false
  }
}, { timestamps: true });

// Criando o modelo a partir do esquema
const ChristianGroup = mongoose.model('ChristianGroup', christianGroupSchema);

export default ChristianGroup;
