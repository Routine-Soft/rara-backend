import express from 'express';
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended: true}))
import cors from 'cors'
router.use(cors())

import ChristianGroup from '../models/ChristianGroup';
import authenticateToken from './middleware/authMiddleware';

// Rota POST - Cria um novo grupo cristão
router.post('/cg/post', authenticateToken, async (req, res) => {
  try {
    const { nome, endereco, lider, colider, anfitriao, contato, img, igreja} = req.body;

    const newGroup = new ChristianGroup({
      nome,
      endereco,
      lider,
      colider,
      anfitriao,
      contato,
      img,
      igreja
    });

    await newGroup.save();
    res.status(201).json({message: 'CG criado com sucesso', cg: newGroup});
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar CG', error: error.message });
  }
});

// Rota GET - Pega todos os grupos cristãos
router.get('/cg/get', authenticateToken, async (req, res) => {
  try {
    const igreja = req.user.igreja;
    const groups = await ChristianGroup.find({igreja}).sort({createdAt: -1});
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar mídia', error: error.message });
  }
});

// Rota PATCH - Atualiza um grupo cristão existente
router.patch('/cg/patch/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedGroup = await ChristianGroup.findByIdAndUpdate(id, updateData, { new: true, runValidators: true, });

    if (!updatedGroup) {
      return res.status(404).json({ message: 'CG não encontrado' });
    }

    res.status(200).json({message: 'CG atualizado com sucesso!', cg: updatedGroup});
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar CG', error: error.message });
  }
});

// Rota DELETE - Deleta um grupo cristão pelo ID
router.delete('/cg/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const group = await ChristianGroup.findByIdAndDelete(id);

    if (!group) {
      return res.status(404).json({ message: 'CG não encontrado' });
    }
    res.status(200).json({ message: 'CG deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar CG', error: error.message });
  }
});

export default router;
