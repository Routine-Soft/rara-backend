import mongoose from 'mongoose';

const midiaLocalSchema = new mongoose.Schema({
  data: {
    type: String,
    required: false,
  },
  hora: {
    type: String,
    required: false,
  },
  titulo: {
    type: String,
    required: false,
  },
  texto: {
    type: String, // Texto formatável, ideal para ser usado com CKEditor
    required: false,
  },
  igreja: { type: String, required: false },
}, { timestamps: true }); // Cria campos automáticos de createdAt e updatedAt

const MidiaLocalModel = mongoose.model('MidiaLocal', midiaLocalSchema);

export default MidiaLocalModel;
