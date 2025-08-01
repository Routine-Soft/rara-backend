import express from 'express'
import dotenv from "dotenv"
dotenv.config();
import sendEmail from '../routes/emailService.js';
import crypto from 'crypto'
import UserModel from '../models/userModel.js';

const router = express();
router.use(express.json());

// Endpoint para solicitar redefinição de senha
router.post('/request-reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({message: 'Usuário não encontrado.'});
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        const resetUrl = `https://comunhaorara.com/reset-password/${token}`;
        const emailBody = `
            <h1>Rara App</h1>
            <h3>Você solicitou a redefinição de senha da sua conta.</h3>
            <p>Clique no link abaixo ou cole no seu navegador para completar o processo:</p>
            <a href="${resetUrl}">Redefinir senha</a>
            <p>Se você não solicitou isso, ignore este email e sua senha permanecerá inalterada.</p>
        `;

        await sendEmail(email, 'Redefinição de Senha', emailBody);

        res.status(200).send({ message: 'Email de redefinição de senha enviado.' });
    } catch (error) {
        return res.status(500).json({ message: `Erro no servidor ao enviar email de redefinição de senha: ${error.message}` });
    }
});

// Endpoint para criar uma senha. 1º acesso do usuário 
router.post('/first-access', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({message: 'Usuário não encontrado.'});
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        const resetUrl = `https://comunhaorara.com/reset-password/${token}`;
        const emailBody = `
            <h3>Seja bem vindo ao Rara App</h3>
            <p>Clique no link abaixo ou cole no seu navegador para completar o processo:</p>
            <a href="${resetUrl}">Criar senha</a>
        `;

        await sendEmail(email, 'Criação de Senha', emailBody);

        res.status(200).send({ message: 'Email de criação de senha enviado.' });
    } catch (error) {
        return res.status(500).json({ message: `Erro no servidor ao enviar email de criação senha: ${error.message}` });
    }
});

// Endpoint para redefinir senha
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({message: 'Token inválido ou expirado.'});
        }

        user.password = password; // Certifique-se de hash a senha antes de salvar
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({message: 'Senha redefinida com sucesso.'});
    } catch (error) {
        return res.status(500).json({ message: `Erro no servidor ao redefinir senha: ${error.message}` });
    }
    
});

export default router