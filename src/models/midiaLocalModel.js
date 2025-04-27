import mongoose from 'mongoose';

const midiaLocalSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true,
  },
  hora: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  texto: {
    type: String, // Texto formatável, ideal para ser usado com CKEditor
    required: true,
  },
  igreja: { type: String, required: false },
}, { timestamps: true }); // Cria campos automáticos de createdAt e updatedAt

const MidiaLocalModel = mongoose.model('MidiaLocal', midiaLocalSchema);

export default MidiaLocalModel;
