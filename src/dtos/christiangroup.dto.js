// DTO (Data Transfer Object) for creating a christian group
export function createChristianGroupDTO(body) {
    return {
        name: body.name,
        address: body.address ?? {},
        leader: body.leader,
        coleader: body.coleader,
        host: body.host,
        contact: body.contact,
        churchId: body.churchId,
    }
}

// DTO for updating a christian group
export function updateChristianGroupDTO(body) {
    const allowed = [
        'name',
        'address',
        'leader',
        'coleader',
        'host',
        'contact',
        'churchId',
    ]

    return Object.fromEntries(
        Object.entries(body).filter(([key]) => allowed.includes(key))
    )
}
