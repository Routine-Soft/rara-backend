// DTO (Data Transfer Object) for creating a user
export function createUserDTO(body) {
    return {
        name: body.name,
        phone: body.phone,
        gender: body.gender,
        birthdate: body.birthdate,
        email: body.email,
        password: body.password,
        churchId: body.churchId,
        address: body.address ?? {},
        invitationofgrace: body.invitationofgrace,
        status: body.status,
        baptized: body.baptized,
        member: body.member ?? false,
        facilitador: body.facilitador ?? '',
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
    ]
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  )
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
        email: body.email,
        password: body.password,
    }
}

export function createFacilitatorUserDTO(body) {
    return {
        name: body.name,
        phone: body.phone,
        gender: body.gender,
        birthdate: body.birthdate,
        email: body.email,
        churchId: body.churchId,
        address: body.address ?? {},
        invitationofgrace: body.invitationofgrace,
        status: body.status,
        baptized: body.baptized,
        member: body.member ?? false,
        roles: [],
        facilitator: body.facilitador ?? body.facilitator,
    }
}

export function updateFacilitatorUserDTO(body) {
    const allowed = [
        'facilitator',
    ]
      return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  )
}