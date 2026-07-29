// dtos/cura.dto.js
export function createCuraDTO(body, userId, churchId) {
    return {
        userId,
        type: body.type ?? null,
        churchId: churchId ?? null,
    }
}

// edição de dados administrativos (não mexe em status aqui)
export function updateCuraDTO(body) {
    const allowed = ['type', 'notes', 'assignedTo']
    return Object.fromEntries(
        Object.entries(body).filter(([key]) => allowed.includes(key))
    )
}

// exclusivo pro drag-and-drop do kanban
export function updateStatusDTO(body) {
    return { status: body.status }
}