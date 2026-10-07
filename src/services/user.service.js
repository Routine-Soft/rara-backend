import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import UserModel from '../models/user.model.js'
import ChurchModel from '../models/church.model.js'
import DizimoOfertaModel from '../models/dizimoOferta.model.js'
import LessonProgressModel from '../models/lessonProgress.model.js'
import CuraModel from '../models/cura.model.js'
import { createUserDTO, updateUserDTO, loginUserDTO, createFacilitatorUserDTO, updateFacilitatorUserDTO, updateUserRolesDTO } from '../dtos/user.dto.js'
import { verify } from 'node:crypto'
import AppError from '../errors/AppError.js'
import { OAuth2Client } from 'google-auth-library'
import { TEAMS, expandRoles, canManageTeam } from '../utils/teams.js'

const googleClient = new OAuth2Client()

// Gera os tokens do app e guarda o refresh no usuário. `viaGoogle` fica nos
// tokens: quem entrou pelo Google pode redefinir a senha sem a atual.
async function issueSession(user, { viaGoogle = false } = {}) {
    const claims = viaGoogle ? { id: user._id, google: true } : { id: user._id }
    const accessToken = jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: '24h' })
    const refreshToken = jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: '7d' })
    user.tokenRefresh = refreshToken
    await user.save()
    return { accessToken, refreshToken, user: user.toJSON(), viaGoogle }
}

// Total de membros (não usuários) salvo em cada igreja: recontado sempre que
// alguém vira/deixa de ser membro, troca de igreja, entra ou é apagado.
export async function syncChurchMembers(...churchIds) {
    const ids = [...new Set(churchIds.filter(Boolean).map(String))]
    await Promise.all(ids.map(async (churchId) => {
        const total = await UserModel.countDocuments({ churchId, member: true })
        await ChurchModel.updateOne({ _id: churchId }, { $set: { totalMembers: total } })
    }))
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const PROVISIONAL_PASSWORD = '123'

// Cargos que valem para todas as igrejas. Os demais (pastor local,
// facilitador, líderes...) são da igreja onde foram dados.
export const GLOBAL_ROLES = ['super_admin', 'programador']

// Quem pode marcar/desmarcar membro e editar outros usuários da igreja
const MEMBER_MANAGERS = ['super_admin', 'pastor_local', 'secretaria_igreja', 'avancai_lider']

export const UserService = {
    // super_admin vê todas as igrejas (ou a escolhida); os demais só a própria
    async findAll(authUser, { churchId } = {}) {
        const logged = await UserModel.findById(authUser.id)
        if (!logged) throw new AppError('Authenticated user not found', 404)

        if ((logged.roles ?? []).includes('super_admin')) {
            if (!churchId) return await UserModel.find()
            if (!mongoose.isValidObjectId(churchId)) throw new AppError('Invalid churchId', 400)
            return await UserModel.find({ churchId })
        }
        if (!logged.churchId) return []
        return await UserModel.find({ churchId: logged.churchId })
    },

    async findById(id) {
        const user = await UserModel.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        return user
    },

    async createUser(body) {
        const userDTO = createUserDTO(body)
        if(userDTO.churchId) {
            const church = await ChurchModel.findById(userDTO.churchId)
            if (!church) {
                throw new AppError('Church not found', 404)
            }
        }

        userDTO.password = await argon2.hash(userDTO.password)
        return await UserModel.create(userDTO)
    },

    // O facilitador cadastra sempre na própria igreja (a do usuário logado)
    async createFacilitatorUser(body, authUser) {
        const userDTO = createFacilitatorUserDTO(body)

        const logged = await UserModel.findById(authUser.id)
        if (!logged) throw new AppError('Authenticated user not found', 404)
        if (!logged.churchId) {
            throw new AppError('Cadastre sua igreja em Minha Conta antes de cadastrar pessoas', 400)
        }
        userDTO.churchId = logged.churchId

        const userExists = await UserModel.findOne({
            email: userDTO.email
        })

        if (userExists) {
            throw new AppError('User already exists', 409)
        }

        // Senha provisória fácil de passar após o culto; no 1º login o app
        // obriga a trocar (ou a pessoa entra pelo Google)
        userDTO.password = await argon2.hash(PROVISIONAL_PASSWORD)
        userDTO.mustChangePassword = true

        return await UserModel.create(userDTO)
    },

    async updateUserRoles(id, body, authUser) {
        if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid user id', 400)
        const userDTO = updateUserRolesDTO(body)
        const loggedUser = await UserModel.findById(authUser.id)
        if (!loggedUser) {
            throw new AppError('Authenticated user not found', 404)
        }

        const targetUser = await UserModel.findById(id)
        if (!targetUser) {
            throw new AppError('User not found', 404)
        }

        const loggedRoles = Array.isArray(loggedUser.roles)
            ? loggedUser.roles
            : []

        const targetRoles = Array.isArray(targetUser.roles)
            ? targetUser.roles
            : []

        const loggedIsSuperAdmin = loggedRoles.includes('super_admin')
        const targetIsSuperAdmin = targetRoles.includes('super_admin')

        const valid = UserModel.schema.path('roles').caster.enumValues
        const invalid = userDTO.roles.filter((role) => !valid.includes(role))
        if (invalid.length) {
            throw new AppError(`Cargo inválido: ${invalid.join(', ')}`, 400)
        }
        userDTO.roles = [...new Set(userDTO.roles)]

        if (loggedIsSuperAdmin) {
            // Sem isso o sistema poderia ficar sem nenhum Super Intendente
            if (
                loggedUser.id.toString() === targetUser.id.toString() &&
                !userDTO.roles.includes('super_admin')
            ) {
                throw new AppError('Você não pode remover o seu próprio cargo de Super Intendente Geral', 403)
            }
        } else {
            // Pastor local: só pessoas da própria igreja, e nunca mexe em
            // Super Intendente (nem dá, nem tira, nem edita quem é)
            const sameChurch = loggedUser.churchId &&
                String(loggedUser.churchId) === String(targetUser.churchId)
            if (!sameChurch) {
                throw new AppError('Você só pode alterar cargos de pessoas da sua igreja', 403)
            }
            if (targetIsSuperAdmin) {
                throw new AppError('Só o Super Intendente Geral altera os cargos de outro Super Intendente', 403)
            }
            if (userDTO.roles.includes('super_admin')) {
                throw new AppError('Só o Super Intendente Geral pode dar esse cargo', 403)
            }
            // Programador mexe nas chaves do Mercado Pago de todas as igrejas
            if (userDTO.roles.includes('programador') !== targetRoles.includes('programador')) {
                throw new AppError('Só o Super Intendente Geral pode dar ou tirar o cargo de Programador', 403)
            }
        }

        targetUser.roles = userDTO.roles
        await targetUser.save()
        return targetUser
    },

    // "Tornar membro da equipe" (aba Minha Equipe): o líder do departamento
    // (ou pastor local / secretária da igreja / super_admin) põe ou tira a
    // pessoa da equipe. Só pessoas da mesma igreja.
    async setTeam(id, key, add, authUser) {
        if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid user id', 400)
        const team = TEAMS[key]
        if (!team) throw new AppError('Equipe não encontrada', 404)

        const [logged, target] = await Promise.all([
            UserModel.findById(authUser.id),
            UserModel.findById(id),
        ])
        if (!logged) throw new AppError('Authenticated user not found', 404)
        if (!target) throw new AppError('User not found', 404)

        const loggedRoles = logged.roles ?? []
        if (!canManageTeam(loggedRoles, key)) {
            throw new AppError('Só o líder do departamento monta a equipe', 403)
        }
        const sameChurch = logged.churchId && String(logged.churchId) === String(target.churchId)
        if (!loggedRoles.includes('super_admin') && !sameChurch) {
            throw new AppError('Você só pode montar a equipe com pessoas da sua igreja', 403)
        }

        const roles = (target.roles ?? []).filter((r) => r !== team.team)
        target.roles = add ? [...roles, team.team] : roles
        await target.save()
        return target
    },

    // Integração só de pessoas da própria igreja (super_admin: qualquer uma)
    async updateFacilitatorUser(id, body, authUser) {
        if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid user id', 400)
        const userDTO = updateFacilitatorUserDTO(body)

        const [logged, target] = await Promise.all([
            UserModel.findById(authUser.id),
            UserModel.findById(id),
        ])
        if (!logged) throw new AppError('Authenticated user not found', 404)
        if (!target) throw new AppError('User not found', 404)
        const sameChurch = logged.churchId && String(logged.churchId) === String(target.churchId)
        if (!(logged.roles ?? []).includes('super_admin') && !sameChurch) {
            throw new AppError('Você só pode editar pessoas da sua igreja', 403)
        }
        const user = await UserModel.findByIdAndUpdate(id, { $set: userDTO }, { new: true, runValidators: true })

        if (!user) {
            throw new AppError('User not found', 404)
        }

        return user
    },

    // Cada um edita o próprio perfil; a liderança edita os da sua igreja
    // (super_admin, de qualquer igreja). Mudar "membro" é só da liderança.
    async updateUser(id, body, authUser) {
        if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid user id', 400)
        const userDTO = updateUserDTO(body)

        const [logged, current] = await Promise.all([
            UserModel.findById(authUser.id),
            UserModel.findById(id),
        ])
        if (!logged) throw new AppError('Authenticated user not found', 404)
        if (!current) throw new AppError('User not found', 404)

        const loggedRoles = expandRoles(logged.roles ?? [])
        const isSuperAdmin = loggedRoles.includes('super_admin')
        const isLeader = MEMBER_MANAGERS.some(role => loggedRoles.includes(role))
        const isSelf = String(logged._id) === String(current._id)
        const sameChurch = logged.churchId && String(logged.churchId) === String(current.churchId)

        if (!isSelf && !(isSuperAdmin || (isLeader && sameChurch))) {
            throw new AppError('Você não pode editar este usuário', 403)
        }

        // A data só vale junto com "member". Reenviar o mesmo valor (ex.:
        // salvar "Minha Conta") não conta como mudança.
        if (userDTO.member === undefined) delete userDTO.memberSince
        const changesMember = userDTO.member !== undefined && userDTO.member !== current.member
        const changesDate = userDTO.memberSince !== undefined
        if ((changesMember || changesDate) && !isLeader) {
            throw new AppError('Só a liderança pode alterar quem é membro', 403)
        }

        if (userDTO.churchId) {
            const church = await ChurchModel.findById(userDTO.churchId)
            if (!church) {
                throw new AppError("Church not found", 404)
            }
        }

        // Liderança é por igreja: quem troca de igreja chega na nova como
        // usuário comum (só os cargos gerais continuam)
        const changesChurch = userDTO.churchId !== undefined &&
            String(userDTO.churchId ?? '') !== String(current.churchId ?? '')
        if (changesChurch) {
            userDTO.roles = (current.roles ?? []).filter((role) => GLOBAL_ROLES.includes(role))
        }

        // Data em que virou membro: a escolhida pela liderança (ex.: quem já
        // era membro há anos) ou hoje; limpa ao deixar de ser membro.
        const member = userDTO.member ?? current.member
        if (!member) {
            userDTO.memberSince = null
        } else if (changesDate) {
            const since = new Date(userDTO.memberSince)
            if (isNaN(since)) throw new AppError('Data de membro inválida', 400)
            if (since > new Date()) throw new AppError('A data de membro não pode ser no futuro', 400)
            userDTO.memberSince = since
        } else if (changesMember) {
            userDTO.memberSince = new Date()
        }

        const updated = await UserModel.findByIdAndUpdate(id, { $set: userDTO }, { new: true, runValidators: true })
        await syncChurchMembers(current.churchId, updated.churchId)
        return updated
    },

    // Excluir: super_admin qualquer um; pastor local e facilitador só pessoas
    // da própria igreja. Ninguém exclui a si mesmo, e só super_admin exclui
    // outro super_admin.
    async deleteUser(id, authUser) {
        if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid user id', 400)
        const [logged, user] = await Promise.all([
            UserModel.findById(authUser.id),
            UserModel.findById(id),
        ])
        if (!logged) throw new AppError('Authenticated user not found', 404)
        if (!user) throw new AppError('User not found', 404)

        const isSuperAdmin = (logged.roles ?? []).includes('super_admin')
        if (String(logged._id) === String(user._id)) {
            throw new AppError('Você não pode excluir a sua própria conta por aqui', 403)
        }
        if (!isSuperAdmin) {
            const sameChurch = logged.churchId && String(logged.churchId) === String(user.churchId)
            if (!sameChurch) throw new AppError('Você só pode excluir pessoas da sua igreja', 403)
            if ((user.roles ?? []).includes('super_admin')) {
                throw new AppError('Só o Super Intendente Geral exclui outro Super Intendente', 403)
            }
        }

        // Contribuições são registro financeiro: ficam, com o nome da pessoa.
        // Progresso das aulas e pedidos de Cura saem junto.
        await Promise.all([
            DizimoOfertaModel.updateMany(
                { userId: user._id, $or: [{ donorName: null }, { donorName: '' }] },
                { $set: { donorName: user.name } }
            ),
            LessonProgressModel.deleteMany({ userId: user._id }),
            CuraModel.deleteMany({ userId: user._id }),
        ])
        await UserModel.deleteOne({ _id: user._id })
        await syncChurchMembers(user.churchId)
        return null
    },

    async loginUser(body) {
        const userDTO = loginUserDTO(body)
        const {email, password} = userDTO
        const user = await UserModel.findOne({ email })
        if (!user) {
            throw new AppError('Email ou senha incorretos', 401)
        }
        if (!user.password) {
            throw new AppError('Esta conta não tem senha. Entre com "Continuar com Google".', 401)
        }
        const valid = await argon2.verify(user.password, password)
        if (!valid) {
            throw new AppError('Email ou senha incorretos', 401)
        }
        return issueSession(user)
    },

    // Confere o idToken do Google; acha o usuário pelo email ou cria um novo
    async googleLogin(body) {
        const idToken = body?.idToken
        if (!idToken) throw new AppError('idToken é obrigatório', 400)

        const audience = (process.env.GOOGLE_CLIENT_IDS ?? '')
            .split(',').map((id) => id.trim()).filter(Boolean)
        if (!audience.length) throw new AppError('Login com Google não configurado', 500)

        let payload
        try {
            const ticket = await googleClient.verifyIdToken({ idToken, audience })
            payload = ticket.getPayload()
        } catch {
            throw new AppError('Login com Google inválido', 401)
        }
        if (!payload?.email || !payload.email_verified) {
            throw new AppError('Email do Google não verificado', 401)
        }

        const email = payload.email.toLowerCase()
        let user = await UserModel.findOne({
            email: new RegExp(`^${escapeRegex(email)}$`, 'i')
        })
        const isNew = !user
        if (isNew) {
            user = await UserModel.create({ name: payload.name ?? email, email })
        }
        return { ...(await issueSession(user, { viaGoogle: true })), isNew }
    },

    async logoutUser(id) {
        const user = await UserModel.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        user.tokenRefresh = null
        await user.save()
        return null
    },

    async refresh(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

            console.log(decoded)

            const user = await UserModel.findById(decoded.id)

            console.log(user)

            if (!user) {
                throw new AppError("User not found", 404)
            }

            if (user.tokenRefresh !== refreshToken) {
                throw new AppError("Invalid refresh token", 401)
            }

            const newAccessToken = jwt.sign(
                decoded.google ? { id: user._id, google: true } : { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )

            return { accessToken: newAccessToken }

        } catch (error) {
            console.log(error) // <-- MUITO IMPORTANTE
            throw error
        }
    },

    // Só a própria pessoa troca a senha. Sem a atual quando: a conta ainda não
    // tem senha, a senha é a provisória, ou a pessoa entrou pelo Google
    // (é o "esqueci a senha").
    async updatePassword(id, body, authUser) {
        if (String(authUser.id) !== String(id)) {
            throw new AppError('Você só pode alterar a sua própria senha', 403)
        }
        const { currentPassword, newPassword } = body
        const user = await UserModel.findById(id)
        if (!user) {
            throw new AppError('User not found', 404)
        }
        if (user.password && !user.mustChangePassword && !authUser.google) {
            const valid = await argon2.verify(user.password, currentPassword ?? '')
            if (!valid) {
                throw new AppError('Invalid current password', 401)
            }
        }
        if (!newPassword || String(newPassword).length < 6) {
            throw new AppError('A nova senha precisa ter pelo menos 6 caracteres', 400)
        }
        user.password = await argon2.hash(newPassword)
        user.mustChangePassword = false
        await user.save()
        return null
    },
}