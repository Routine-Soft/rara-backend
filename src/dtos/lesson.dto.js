function normalizeQuestions(questions) {
    if (!Array.isArray(questions)) {
        return []
    }

    return questions.map(question => ({
        statement: question.statement,
        options: Array.isArray(question.options) ? question.options : [],
        correctOptionIndex: question.correctOptionIndex,
    }))
}

export function createLessonDTO(body) {
    return {
        module: body.module,
        number: body.number,
        title: body.title,
        videoUrl: body.videoUrl ?? '',
        content: body.content,
        image: body.image ?? null,
        questions: normalizeQuestions(body.questions),
    }
}

export function updateLessonDTO(body) {
    const allowed = [
        'module',
        'number',
        'title',
        'videoUrl',
        'content',
        'image',
        'questions',
    ]

    const lessonDTO = Object.fromEntries(
        Object.entries(body).filter(([key]) => allowed.includes(key))
    )

    if (Object.prototype.hasOwnProperty.call(lessonDTO, 'questions')) {
        lessonDTO.questions = normalizeQuestions(lessonDTO.questions)
    }

    return lessonDTO
}

export function publicLessonDTO(lesson) {
    const obj = typeof lesson.toObject === 'function' ? lesson.toObject() : lesson

    obj.questions = obj.questions.map(q => ({
        statement: q.statement,
        options: q.options,
    }))

    return obj
}