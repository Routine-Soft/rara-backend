import mongoose from 'mongoose';

const midiaLocalSchema = new mongoose.Schema({
  date: { type: Date, required: false },
  time: { type: String, required: false },
  title: { type: String, required: false },
  text: { type: String, required: false },
  churchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: false
  },
  image: { type: String, required: false },

}, { timestamps: true }); // Cria campos automáticos de createdAt e updatedAt

const MidiaLocalModel = mongoose.models.MidiaLocal || mongoose.model('MidiaLocal', midiaLocalSchema);

export default MidiaLocalModel;
