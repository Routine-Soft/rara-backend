import mongoose from 'mongoose'

// Definindo o schema para a Igreja
const igrejaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // Nome é obrigatório
  },
  pastor1: {
    type: String, // Array de strings para armazenar os nomes dos pastores
    required: false
  },
  pastor2: {
    type: String, // Array de strings para armazenar os nomes dos pastores
    required: false
  },
  pais: {
    type: String,
    required: true // País é obrigatório
  },
  estado: {
    type: String,
    required: true // Estado é obrigatório
  },
  endereco: {
    type: String,
    required: true // Endereço é obrigatório
  },
  cep: {
    type: String,
    required: true
  },
  totalMembros: {
    type: Number,
    required: true, // Total de membros é obrigatório
    default: 0      // Valor padrão é 0
  }
});

// Criando o modelo a partir do schema
const Igreja = mongoose.model('Igreja', igrejaSchema);

export default Igreja;
