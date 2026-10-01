// controllers/paymentSettings.controller.js
import { PaymentSettingsService } from '../services/paymentSettings.service.js'

export const PaymentSettingsController = {
    async list(request, reply) {
        const data = await PaymentSettingsService.list()
        return reply.send({ success: true, data, message: 'Payment settings' })
    },

    async save(request, reply) {
        const data = await PaymentSettingsService.save(request.params.churchId, request.body ?? {}, request.user)
        return reply.send({ success: true, data, message: 'Payment settings saved' })
    },

    async remove(request, reply) {
        await PaymentSettingsService.remove(request.params.churchId)
        return reply.send({ success: true, data: null, message: 'Payment settings removed' })
    },
}
