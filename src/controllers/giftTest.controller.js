import { GiftTestService } from '../services/giftTest.service.js'

export const GiftTestController = {
    async list(req, reply) {
        return reply.send({ success: true, data: GiftTestService.list(), message: 'Gift tests' })
    },

    async submit(req, reply) {
        const user = await GiftTestService.submit(req.user.id, req.params.key, req.body)
        return reply.send({ success: true, data: user, message: 'Gift test submitted successfully' })
    },
}
