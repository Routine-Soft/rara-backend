import express from 'express'
const router = express.Router()

router.use(express.json())
router.use(express.urlencoded({extended: true}))

import cors from 'cors'
router.use(cors())

import argon2 from 'argon2'

import UserModel from '../models/userModel.js'

import authenticateToken from '../routes/middleware/authMiddleware.js'

import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
// import AWS from 'aws-sdk'
import {  SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

import dotenv from 'dotenv'
dotenv.config()

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// const ses = new AWS.SES({ region: process.env.AWS_REGION });

// GET - Tudo
router.get('/user/getall', authenticateToken, async (req, res) => {
    try {
        const igreja = req.user.igreja;
        const users = await UserModel.find({igreja});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter usuários', error });
    }
});

// GET - Por Id
router.get('/user/get/:userid', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userid; // corrigido aqui
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
        console.log('resultado: ', req.body)

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
            password,
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
            admin: existingUser.admin, 
        };

        // Create token with JWT
        const secretKey = process.env.SECRET_KEY
        const token = jwt.sign({email: existingUser.email, igreja: existingUser.igreja, _id: existingUser._id, isPasswordValid}, secretKey, {expiresIn: '1h'})

        //Return response with token
        return res.json({auth: true, token, user: userData})
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro no servidor ao fazer login', error: error.message });
    }
});

// PATCH - Atualizar usuário por ID
router.patch('/user/patch/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.params.id;
      const updateData = { ...req.body };
  
      // Verificação básica se há dados para atualizar
      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Dados de atualização não fornecidos' });
      }

        // Se a senha estiver sendo atualizada, criptografa com argon2
        if (updateData.password) {
            updateData.password = await argon2.hash(updateData.password);
        }
  
      // Atualiza o usuário e retorna o novo documento com { new: true }
      const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true, // Garante que validações do schema sejam aplicadas
      });
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      res.status(200).json({
        message: 'Usuário atualizado com sucesso',
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erro ao atualizar usuário',
        error: error.message,
      });
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

// PATCH - Adiciona um item ao array (Reset, Start ou CDV)
router.patch('/user/addToArray/:id', authenticateToken, async (req, res) => {
    try {
        const { field, value } = req.body; // exemplo: { field: "reset", value: "novoValor" }

        // Validação básica
        const validFields = ['reset', 'start', 'cdv'];
        if (!validFields.includes(field)) {
            return res.status(400).json({ message: 'Campo inválido' });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { [field]: value } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json({ message: `${field} atualizado com sucesso`, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar array', error: error.message });
    }
});

router.post('/user/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log('email: ', email)
    try {
      console.log('email: ', email)
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  
      const rawToken = uuidv4();
      const hashedToken = await argon2.hash(rawToken);
      const expires = Date.now() + 1000 * 60 * 60; // 1h
  
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = expires;
      await user.save();
  
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${encodeURIComponent(rawToken)}`;
  
      const command = new SendEmailCommand({
        Source: process.env.EMAIL_FROM,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: 'Redefinição de Senha' },
          Body: {
            Html: {
              Data: `
                <p>Olá,</p>
                <p>Clique no link abaixo para redefinir sua senha:</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p>O link expira em 1 hora.</p>
              `
            }
          }
        }
      });
  
      await sesClient.send(command);
      res.json({ message: 'E-mail enviado com sucesso!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao enviar e-mail' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
  
    try {
      const user = await UserModel.findOne({
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      if (!user || !user.resetPasswordToken)
        return res.status(400).json({ message: 'Token inválido ou expirado' });
  
      const tokenIsValid = await argon2.verify(user.resetPasswordToken, token);
      if (!tokenIsValid)
        return res.status(400).json({ message: 'Token inválido ou expirado' });
  
      user.password = password; // será hasheado no model com argon2
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res.json({ message: 'Senha redefinida com sucesso!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao redefinir a senha' });
    }
});
  

export default router;
