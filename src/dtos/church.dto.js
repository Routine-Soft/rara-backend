// DTO (Data Transfer Object) for creating a church
export function createChurchDTO(body) {
    return {
        name: body.name,
        pastor1: body.pastor1,
        pastor2: body.pastor2,
        address: body.address ?? {},
        cnpj: body.cnpj,
        logoUrl: body.logoUrl,
        totalMembers: body.totalMembers ?? 0,
    }
}

// DTO for updating a church
export function updateChurchDTO(body) {
    const allowed = [
        'name',
        'pastor1',
        'pastor2',
        'address',
        'cnpj',
        'logoUrl',
        'totalMembers',
    ]

    return Object.fromEntries(
        Object.entries(body).filter(([key]) => allowed.includes(key))
    )
}