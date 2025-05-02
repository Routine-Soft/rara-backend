import express from 'express';
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended: true}))
import cors from 'cors'
router.use(cors())

import MidiaLocalModel from '../models/midiaLocalModel.js';
import authenticateToken from './middleware/authMiddleware.js';



// ==================== CREATE ====================
router.post('/midiaLocal/post', authenticateToken, async (req, res) => {
  try {
    const { data, hora, titulo, texto, igreja } = req.body;

    const newMidia = new MidiaLocalModel({
      data,
      hora,
      titulo,
      texto,
      igreja,
    });

    await newMidia.save();

    res.status(201).json({ message: 'Mídia criada com sucesso', midia: newMidia });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar mídia', error: error.message });
  }
});

// ==================== READ ====================
router.get('/midiaLocal/get', authenticateToken, async (req, res) => {
  try {
    const igreja = req.user.igreja;
    const midias = await MidiaLocalModel.find({igreja}).sort({ createdAt: -1 }); // Lista mais recentes primeiro
    res.status(200).json(midias);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar mídias', error: error.message });
  }
});

// ==================== PATCH ====================
router.patch('/midiaLocal/patch/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedMidia = await MidiaLocalModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMidia) {
      return res.status(404).json({ message: 'Mídia não encontrada' });
    }

    res.status(200).json({ message: 'Mídia atualizada com sucesso', midia: updatedMidia });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar mídia', error: error.message });
  }
});

// ==================== DELETE ====================
router.delete('/midiaLocal/delete/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMidia = await MidiaLocalModel.findByIdAndDelete(id);

    if (!deletedMidia) {
      return res.status(404).json({ message: 'Mídia não encontrada' });
    }

    res.status(200).json({ message: 'Mídia deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar mídia', error: error.message });
  }
});

export default router;
