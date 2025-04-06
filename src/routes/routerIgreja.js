import express from 'express'
const routerIgreja = express.Router();
import Igreja from '../models/igrejasModel.js'
import authenticateToken from '../routes/middleware/authMiddleware.js';

// GET - Tudo
routerIgreja.get('/igreja/getall', async (req, res) => {
    try {
        const igrejas = await Igreja.find();
        res.status(200).json(igrejas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter igrejas', error });
    }
});

// Rota para buscar uma igreja específica com seus ministérios e usuários pelo nome
routerIgreja.get('/igreja/get/:nome', async (req, res) => {
    try {
      const igreja = await Igreja.findOne({ nome: req.params.nome });
      if (!igreja) {
        return res.status(404).json({ message: 'Igreja não encontrada' });
      } 
  
      res.status(200).json({
        igreja: igreja.nome,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// GET - Por Id
routerIgreja.get('/igreja/get/:igrejaid', async (req, res) => {
    try {
        const igreja = await Igreja.findById(req.params.id);
        if (!igreja) {
            return res.status(404).json({ message: 'Igreja não encontrada' });
        }
        res.status(200).json(igreja);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter igreja', error });
    }
});

// POST - Criar Novo
routerIgreja.post('/igreja/post',  async (req, res) => {
    try {
        const {name, pastor1, pastor2, pais, estado, endereço, cep, totalMembros} = req.body;

        // Não é feito nenhuma verificação se a igreja já existe

        const newIgreja = new Igreja({
            name,
            pastor1,
            pastor2,
            pais,
            estado,
            endereço,
            cep,
            totalMembros,
        });
        
        await newIgreja.save();
        return res.status(200).json({message: 'Igreja cadastrada com sucesso', igreja: newIgreja});
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar igreja', error: error.message });
    }
});

// PATCH - Atualizar Por Id
routerIgreja.patch('/igreja/editar/:id', authenticateToken, async (req, res) => {
    try {
        const updatedIgreja = await Igreja.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedIgreja) {
            return res.status(404).json({ message: 'Igreja não encontrada' });
        }
        res.status(200).json(updatedIgreja);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar igreja', error });
    }
});

// DELETE - Por Id
routerIgreja.delete('/igreja/deletar/:id', authenticateToken, async (req, res) => {
    try {
        const deletedIgreja = await Igreja.findByIdAndDelete(req.params.id);
        if (!deletedIgreja) {
            return res.status(404).json({ message: 'Igreja não encontrada' });
        }
        res.status(200).json({ message: 'Igreja deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar igreja', error });
    }
});

export default routerIgreja;
