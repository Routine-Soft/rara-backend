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
        admin: body.admin ?? false,
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
        'admin'
    ]
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  )
}

// DTO for user login
export function loginUserDTO(body) {
    return {
        email: body.email,
        password: body.password,
    }
}