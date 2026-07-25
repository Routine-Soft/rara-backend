// DTO (Data Transfer Object) for creating local media
export function createMidiaLocalDTO(body) {
    return {
        date: body.date,
        time: body.time,
        title: body.title,
        text: body.text,
        churchId: body.churchId,
        image: body.image,
    }
}

// DTO for updating local media
export function updateMidiaLocalDTO(body) {
    const allowed = [
        'date',
        'time',
        'title',
        'text',
        'churchId',
        'image',
    ]

    return Object.fromEntries(
        Object.entries(body).filter(([key]) => allowed.includes(key))
    )
}