// DTO (Data Transfer Object) for creating a church
export function createChurchDTO(body) {
    return {
        name: body.name,
        pastor1: body.pastor1,
        pastor2: body.pastor2,
        address: body.address ?? {},
        cnpj: body.cnpj,
        logoUrl: body.logoUrl,
        // totalMembers é calculado (syncChurchMembers), não vem do formulário
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
    ]

    return Object.fromEntries(
        Object.entries(body).filter(([key]) => allowed.includes(key))
    )
}