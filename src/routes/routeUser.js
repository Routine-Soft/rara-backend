const express = require('express');
const routerUser = express();
const UserModel = require('../models/userModel');
const authenticateToken = require('../routes/middleware/authMiddleware'); // Importe o middleware de autenticação
const cors = require('cors')
routerUser.use(cors())
//importing bcrypt
const bcrypt = require('bcrypt')
//importing JWT
const jwt = require('jsonwebtoken')
//importing BodyParser
const bodyParser = require('body-parser')
//signaling that it will be receive JSON
const cookieParser = require("cookie-parser") 

routerUser.use(cors());
routerUser.use(bodyParser.json())
routerUser.use(cookieParser())


// GET - Tudo
routerUser.get('/user/buscar/', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter usuários', error });
    }
});

// GET - Por Id
routerUser.get('/user/buscar/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter usuário', error });
    }
});

// ==================== CADASTRAR USUÁRIO ====================
routerUser.post('/user/criar', async (req, res) => {
    const {
        name,
        whatsapp,
        email,
        password,
        gender,
        birthdate,
        endereco,
        igreja,
        cg,
        status,
        id,
        batizado,
        admin // Adiciona o campo admin
    } = req.body;

    try {
        // Verifique se o e-mail já existe
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email já existe' });
        }

        // Criptografe a senha do usuário
        //const hashedPassword = await bcrypt.hash(password, 10);

        // Trate valores vazios
        //const validMinisterio = ministerio ? ministerio : null;
        const validIgreja = igreja ? igreja : null;

        // Crie o novo usuário
        const newUser = new UserModel({
            name,
            whatsapp,
            email,
            password,
            gender,
            birthdate,
            endereco,
            cg,
            igreja: validIgreja,
            status,
            id,
            batizado,
            admin: admin || false // Define como falso se não for especificado
        });

        // Salve o usuário no banco de dados
        const savedUser = await newUser.save();

        // // Envie a resposta com sucesso
        // res.status(201).json({
        //     message: 'Usuário registrado com sucesso',
        //     user: {
        //         _id: savedUser._id,
        //         name,
        //         whatsapp,
        //         email,
        //         gender,
        //         birthdate,
        //         endereco,
        //         cg,
        //         igreja: savedUser.igreja,
        //         status,
        //         id,
        //         password,
        //         batizado,
        //         admin: savedUser.admin
        //     }
        // });

        // Envia evento de WebSocket para clientes conectados
        req.app.get('io').emit('new_user', {
            event: 'new_user',
            user: {
                _id: savedUser._id,
                name: savedUser.name,
                whatsapp: savedUser.whatsapp,
                email: savedUser.email,
                gender: savedUser.gender,
                birthdate: savedUser.birthdate,
                endereco: savedUser.endereco,
                igreja: savedUser.igreja,
                cg: savedUser.cg,
                status: savedUser.status,
                batizado: savedUser.batizado,
                admin: savedUser.admin,
                createdAt: savedUser.createdAt,
            },
        });

        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: savedUser,
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro ao criar usuário', error });
    }
});

// ==================== LOGIN ====================
routerUser.post('/user/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verifique se o e-mail e a senha foram fornecidos
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
        }

        // Encontre o usuário pelo e-mail
        const user = await UserModel.findOne({ email });
        
        // Verifique se o usuário foi encontrado
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // ATENÇÃO: A senha não está sendo salva com criptografia

        // // Verifique se a senha fornecida é correta
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.status(401).json({ message: 'Senha incorreta' });
        // }

        // Gere um token JWT
        const token = jwt.sign({ userId: user._id }, process.env.SECRETKEY_BCRYPT,);

        // Envie a resposta com o token
        res.status(200).json({
            message: 'Login feito com sucesso',
            token,
            user: {
                _id: user._id,
                name: user.name,
                whatsapp: user.whatsapp,
                email: user.email,
                gender: user.gender,
                birthdate: user.birthdate,
                endereco: user.endereco,
                cg: user.cg,
                igreja: user.igreja,
                status: user.status,
                id: user.id,
                batizado: user.batizado,
                admin: user.admin
            }
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro no servidor ao fazer login', error });
    }
});



// PATCH - Atualizar Por Id
routerUser.patch('/user/editar/:id', authenticateToken, async (req, res) => {
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
routerUser.delete('/user/deletar/:id', authenticateToken, async (req, res) => {
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

module.exports = routerUser;
