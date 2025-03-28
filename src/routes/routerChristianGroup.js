const express = require('express');
const routerCG = express.Router();
const ChristianGroup = require('../models/ChristianGroup');

// Rota GET - Pega todos os grupos cristãos
routerCG.get('/cd/buscar', async (req, res) => {
  try {
    const groups = await ChristianGroup.find();
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota GET - Pega um grupo cristão específico pelo ID
routerCG.get('/cg/buscar:id', async (req, res) => {
  try {
    const group = await ChristianGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota POST - Cria um novo grupo cristão
routerCG.post('/cg/criar', async (req, res) => {
  const { nome, endereco, lider, colider, anfitriao} = req.body;

  const newGroup = new ChristianGroup({
    nome,
    endereco,
    lider,
    colider,
    anfitriao,
  });

  try {
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota PATCH - Atualiza um grupo cristão existente
routerCG.patch('/cg/editar/:id', async (req, res) => {
  try {
    const updatedGroup = await ChristianGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGroup) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }
    res.status(200).json(updatedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota DELETE - Deleta um grupo cristão pelo ID
routerCG.delete('/cg/deletar/:id', async (req, res) => {
  try {
    const group = await ChristianGroup.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }
    res.status(200).json({ message: 'Grupo deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = routerCG;
