import mongoose from 'mongoose'

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
    birthdate: { type: Date, required: false },

    email: { type: String, required: false, unique: true },
    password: { type: String, default: null },

    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Church",
        required: false
    },

    address: { type: addressSchema, required: false },

    invitationofgrace: { type: String, required: false }, //Aceitou ou Reconciliou
    status: { type: String, required: false }, //presente, ausente, trocou de igreja
    baptized: { type: Boolean, default: false, required: false },

    member: { type: Boolean, default: false, required: false },
    roles: [{
        type: String,
        enum: [
        "facilitador",
        "christian_group_lider",
        "departamento_lider",
        "secretaria_cura",
        "avancai_lider",
        "midia_lider",
        "pastor_local",
        "super_admin",
        ]
    }],
    facilitator: { type: String, required: false },

    token: { type: String, required: false },
    tokenRefresh: { type: String, required: false },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
    
}, { timestamps: true });

// Nunca retornar a senha no JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.token
  delete obj.tokenRefresh
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  return obj
}

// Verifica se o modelo já foi definido
const UserModel = mongoose.models.usuarios || mongoose.model('users', userSchema);

export default UserModel;
