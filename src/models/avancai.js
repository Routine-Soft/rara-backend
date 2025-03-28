const mongoose = require('mongoose');

// Definindo o esquema para o ChristianGroup
const avancaiSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: false // Nome é obrigatório
  },
  url: {
    type: String,
    required: false // Endereço é obrigatório
  },
  pergunta: {
    type: String,
    riquired: false,
  },
}, { timestamps: true });

// Criando o modelo a partir do esquema
const Avancai = mongoose.model('avancai', avancaiSchema);

module.exports = Avancai;
