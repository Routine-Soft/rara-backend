const express = require('express');
const routerIgreja = express.Router();
const Igreja = require('../models/igrejasModel'); // Importa o modelo de Igreja
const authenticateToken = require('../routes/middleware/authMiddleware'); // Importa o middleware de autenticação

// GET - Tudo
routerIgreja.get('/igreja/buscar', async (req, res) => {
    try {
        const igrejas = await Igreja.find();
        res.status(200).json(igrejas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter igrejas', error });
    }
});

// Rota para buscar uma igreja específica com seus ministérios e usuários
routerIgreja.get('/igreja/:nome', async (req, res) => {
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
routerIgreja.get('/igreja/buscar/:id', async (req, res) => {
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
routerIgreja.post('/igreja/criar',  async (req, res) => {
    try {
        const newIgreja = new Igreja(req.body);
        const savedIgreja = await newIgreja.save();
        res.status(201).json(savedIgreja);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar igreja', error });
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

module.exports = routerIgreja;
