import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
    {
        address: { type: String, required: false },
        number: { type: String, required: false },
        complement: { type: String, required: false },
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

// Cargos eclesiásticos (a pessoa pode ter vários)
export const ECCLESIASTICAL_ROLES = ['pastor', 'presbitero', 'apostolo', 'diacono', 'obreiro', 'evangelista']

// Resultado de um Teste dos Dons (guarda o último de cada teste)
const giftTestResultSchema = new mongoose.Schema(
    {
        test: { type: String, required: true }, // 'dons1' | 'dons2'
        answers: [{ type: Number, min: 0, max: 5 }],
        scores: [{
            _id: false,
            gift: { type: String, required: true },
            score: { type: Number, required: true },
        }],
        completedAt: { type: Date, default: Date.now },
    },
    { _id: false }
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

    invitationofgrace: {
        type: String,
        enum: [
            "Aceitou Jesus",
            "Reconciliou",
            "Troca de Igreja",
            "Recebeu Oração",
            "Não preencheu"
        ],
        required: false
    },
    status: {
        type: String,
        enum: [
            "Presente",
            "Ausente",
            "Se desligou do ministério"
        ],
        required: false
    },
    baptized: { type: Boolean, default: false, required: false },

    member: { type: Boolean, default: false, required: false },
    // Quando virou membro (preenchido/limpo sozinho ao mudar `member`)
    memberSince: { type: Date, required: false, default: null },
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
        "tesouraria",
        "secretaria_igreja",
        "super_admin",
        "programador",
        // equipes dos departamentos (mesmos poderes do líder)
        "avancai_equipe",
        "christian_group_equipe",
        "midia_equipe",
        "cura_equipe",
        "tesouraria_equipe",
        "facilitadores_equipe",
        ]
    }],
    facilitator: { type: String, required: false },
    // Senha provisória ("123", do cadastro pelo facilitador): o app pede a troca
    mustChangePassword: { type: Boolean, default: false },
    giftTests: { type: [giftTestResultSchema], default: [] },
    ecclesiasticalRoles: [{ type: String, enum: ECCLESIASTICAL_ROLES }],

    token: { type: String, required: false },
    tokenRefresh: { type: String, required: false },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
    
}, { timestamps: true });

// Nunca retornar a senha no JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  // Conta criada pelo Google começa sem senha (o app mostra "Criar senha")
  obj.hasPassword = !!obj.password
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
