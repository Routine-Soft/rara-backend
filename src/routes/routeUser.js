import express from 'express'
const router = express.Router()

router.use(express.json())
router.use(express.urlencoded({extended: true}))

import cors from 'cors'
router.use(cors())

import argon2 from 'argon2'

const UserModel = require('../models/userModel');

const authenticateToken = require('../routes/middleware/authMiddleware'); // Importe o middleware de autenticação


// GET - Tudo
router.get('/user/getall', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter usuários', error });
    }
});

// GET - Por Id
router.get('/user/get/:userid', async (req, res) => {
    try {
        const userId = req.params.id
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao obter usuário', error });
    }
});

// ==================== CADASTRAR USUÁRIO ====================
router.post('/user/post', async (req, res) => {
    try {
        const {
            name,
            whatsapp,
            email,
            password,
            gender,
            birthdate,
            endereco,
            igreja,
            status,
            batizado,
            admin
        } = req.body;

        // Verifique se o e-mail já existe
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        // Hash password with Argon2
        const hashedPassword = await argon2.hash(password)

        // Create user on MongoDB
        const newUser = new UserModel({
            name,
            whatsapp,
            email,
            password: hashedPassword,
            gender,
            birthdate,
            endereco,
            igreja,
            status,
            batizado,
            admin: admin || false // Define como falso se não for especificado
        });
        
        await newUser.save();

        return res.status(200).json({message: 'Usuário criado com sucesso', user: newUser})
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    }
});

// ==================== LOGIN ====================
router.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verify if user exist
        const existingUser = await UserModel.findOne({email})
        if (!existingUser) {
            return res.status(401).json({message: 'usuário não encontrado'})
        }

        // Verify password with Argon2
        const isPasswordValid = await argon2.verify(existingUser.password, password)
        if (!isPasswordValid) {
            return res.status(400).json({message: 'Senha incorreta'})
        }

        // Monta os dados do usuário para enviar ao frontend
        const userData = {
            _id: existingUser._id,
            name: existingUser.name,
            whatsapp: existingUser.whatsapp,
            email: existingUser.email,
            gender: existingUser.gender,
            birthdate: existingUser.birthdate,
            endereco: existingUser.endereco,
            igreja: existingUser.igreja,
            status: existingUser.status,
            batizado: existingUser.batizado,
            admin: existingUser.admin
        };

        // Create token with JWT
        const secretKey = 'chave1995'
        const token = jwt.sign({email, isPasswordValid}, secretKey, {expiresIn: '100h'})

        //Return response with token
        return res.json({auth: true, token, user: userData})
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro no servidor ao fazer login', error: error.message });
    }
});


// PATCH - Atualizar Por Id
router.patch('/user/editar/:id', authenticateToken, async (req, res) => {
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
});

// DELETE - Por Id
router.delete('/user/deletar/:id', authenticateToken, async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar usuário', error });
    }
});

module.exports = router;
