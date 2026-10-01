import { ECCLESIASTICAL_ROLES } from '../models/user.model.js'

// Só cargos eclesiásticos válidos, sem repetir
function ecclesiasticalRoles(value) {
    return Array.isArray(value)
        ? [...new Set(value.filter((r) => ECCLESIASTICAL_ROLES.includes(r)))]
        : []
}

// Email sem espaços e minúsculo (o login compara exato)
function normalizeEmail(email) {
    return typeof email === 'string' ? email.replace(/\s/g, '').toLowerCase() : email
}

// DTO (Data Transfer Object) for creating a user
export function createUserDTO(body) {
    return {
        name: body.name,
        phone: body.phone,
        gender: body.gender,
        birthdate: body.birthdate,
        email: normalizeEmail(body.email),
        password: body.password,
        churchId: body.churchId,
        address: body.address ?? {},
        invitationofgrace: body.invitationofgrace ?? 'Não preencheu',
        status: body.status ?? 'Presente',
        baptized: body.baptized ?? false,
        // Virar membro é só pelo Avançai Liderança (PATCH /users/:id)
        member: false,
        facilitator: body.facilitator ?? 'Não possui',
        roles: [],
    }
}


// DTO for updating a user - except for the password, which should be handled separately
export function updateUserDTO(body) {
    const allowed = [
        'name',
        'phone',
        'gender',
        'birthdate',
        'email',
        'churchId',
        'address',
        'invitationofgrace',
        'status',
        'baptized',
        'member',
        'memberSince',
    ]
  const dto = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  )
  if ('email' in dto) dto.email = normalizeEmail(dto.email)
  return dto
}

export function updateUserRolesDTO(body) {
    const allowed = [
        'roles',
    ]
    return {
        roles: Array.isArray(body.roles) ? body.roles : [],
    }
}

// DTO for user login
export function loginUserDTO(body) {
    return {
        email: normalizeEmail(body.email),
        password: body.password,
    }
}

export function createFacilitatorUserDTO(body) {
    return {
        name: body.name,
        phone: body.phone,
        gender: body.gender,
        birthdate: body.birthdate,
        email: normalizeEmail(body.email),
        churchId: body.churchId,
        address: body.address ?? {},
        invitationofgrace: body.invitationofgrace,
        status: body.status,
        baptized: body.baptized,
        // Virar membro é só pelo Avançai Liderança (PATCH /users/:id)
        member: false,
        roles: [],
        facilitator: body.facilitator ?? 'Não possui',
        ecclesiasticalRoles: ecclesiasticalRoles(body.ecclesiasticalRoles),
    }
}

export function updateFacilitatorUserDTO(body) {
    const allowed = [
        'invitationofgrace',
        'status',
        'baptized',
        'facilitator',
        'ecclesiasticalRoles',
    ]
    const dto = Object.fromEntries(
        Object.entries(body).filter(([key]) => allowed.includes(key))
    )
    if ('ecclesiasticalRoles' in dto) dto.ecclesiasticalRoles = ecclesiasticalRoles(dto.ecclesiasticalRoles)
    return dto
}