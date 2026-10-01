import UserModel from '../models/user.model.js'
import AppError from '../errors/AppError.js'
import { GIFT_ANSWERS, GIFT_TESTS } from '../data/giftTests.js'

export const GiftTestService = {
    list() {
        return { answers: GIFT_ANSWERS, tests: GIFT_TESTS }
    },

    // Calcula a pontuação de cada dom e salva no usuário (refazer substitui)
    async submit(userId, key, body) {
        const test = GIFT_TESTS.find((t) => t.key === key)
        if (!test) throw new AppError('Teste não encontrado', 404)

        const answers = body?.answers
        const max = GIFT_ANSWERS.length - 1
        if (
            !Array.isArray(answers) ||
            answers.length !== test.questions.length ||
            !answers.every((a) => Number.isInteger(a) && a >= 0 && a <= max)
        ) {
            throw new AppError(`Responda as ${test.questions.length} perguntas com valores de 0 a ${max}`, 400)
        }

        const totals = test.gifts.map(() => 0)
        answers.forEach((value, i) => { totals[i % test.gifts.length] += value })
        const result = {
            test: key,
            answers,
            scores: test.gifts.map((gift, i) => ({ gift, score: totals[i] })),
            completedAt: new Date(),
        }

        const user = await UserModel.findById(userId)
        if (!user) throw new AppError('User not found', 404)
        user.giftTests = [...user.giftTests.filter((r) => r.test !== key), result]
        await user.save()
        return user
    },
}
