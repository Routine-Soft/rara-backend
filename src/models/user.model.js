import mongoose from 'mongoose'
import argon2 from 'argon2'

const addressSchema = new mongoose.Schema(
    {
        address: { type: String, required: false },
        cep: { type: String, required: false },
        neighborhood: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        country: { type: String, required: false },
    },
    {
        _id: false,
    }
)

// Definindo o esquema do usuário
const userSchema = new mongoose.Schema({
    name: { type: String, required: false },
    phone: { type: String, required: false },
    gender: { type: String, required: false },
    birthdate: { type: String, required: false },

    email: { type: String, required: false, unique: true },
    password: { type: String, required: false },

    church: { type: String, required: false },

    address: { type: addressSchema, required: false },

    invitationofgrace: { type: String, required: false },
    status: { type: String, required: false },
    baptized: { type: String, required: false },

    token: { type: String, required: false },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },

    reset: {
        type: [String],
        default: []
    },
    start: {
        type: [String],
        default: []
    },
    cdv: {
        type: [String],
        default: []
    },

    admin: { type: Boolean, required: false },
    
}, { timestamps: true });

// Nunca retornar a senha no JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.token
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  return obj
}

// Verifica se o modelo já foi definido
const UserModel = mongoose.models.usuarios || mongoose.model('users', userSchema);

export default UserModel;
