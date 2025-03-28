const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definindo o esquema do usuário
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    whatsapp: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false,
        unique: true // Tornar o email único
    },
    password: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    birthdate: {
        type: String, // Armazena a data de nascimento
        required: false
    },
    igreja: {
        type: String, // Referência à igreja
        required: false,
    },
    endereco: {
        type: String, // Armazena o endereço do usuário
        required: false
    },
    cg: {
        type: String, // Referência à igreja
        required: false,
    },
    status: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: false
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    },
    id: {
        type: Number,
        required: false,
        unique: false
    },
    batizado: {
        type: String,
        riquired: false,
    },
    admin: {
        type: String, 
        riquired: false,
    }
}, { timestamps: true });

// // Middleware de hashing de senha antes de salvar
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// Verifica se o modelo já foi definido
const UserModel = mongoose.models.usuarios || mongoose.model('usuarios', userSchema);

module.exports = UserModel;
