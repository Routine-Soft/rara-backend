function normalizeAnswers(answers) {
    if (!Array.isArray(answers)) {
        return []
    }

    return answers.map(answer => ({
        questionIndex: answer.questionIndex,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect: answer.isCorrect,
    }))
}

export function submitLessonProgressDTO(body) {
    return {
        answers: normalizeAnswers(body.answers).map(answer => ({
            questionIndex: answer.questionIndex,
            selectedOptionIndex: answer.selectedOptionIndex,
        })),
    }
}

export function createLessonProgressDTO(body) {
    return {
        userId: body.userId,
        lessonId: body.lessonId,
        score: body.score ?? 0,
        totalQuestions: body.totalQuestions ?? 0,
        answers: normalizeAnswers(body.answers),
        completedAt: body.completedAt,
    }
}

export function updateLessonProgressDTO(body) {
    const allowed = [
        'score',
        'totalQuestions',
        'answers',
        'completedAt',
    ]

    const lessonProgressDTO = Object.fromEntries(
        Object.entries(body).filter(([key]) => allowed.includes(key))
    )

    if (Object.prototype.hasOwnProperty.call(lessonProgressDTO, 'answers')) {
        lessonProgressDTO.answers = normalizeAnswers(lessonProgressDTO.answers)
    }

    return lessonProgressDTO
}