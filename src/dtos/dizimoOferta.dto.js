// dtos/dizimoOferta.dto.js
import AppError from '../errors/AppError.js'

const METHODS = ['pix', 'dinheiro', 'cartao']

// "12,50" | 12.5 | "" -> 12.5 | null
function amount(value) {
    if (value === undefined || value === null || value === '') return null
    const n = Number(String(value).replace(',', '.'))
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) {
        throw new AppError('Valor inválido', 400)
    }
    return n === 0 ? null : Math.round(n * 100) / 100
}

// "2026-09-29" -> meio-dia em Brasília (evita cair no dia anterior por fuso)
function day(value) {
    if (!value) return new Date()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new AppError('Data inválida', 400)
    return new Date(`${value}T12:00:00-03:00`)
}

function amounts(body) {
    const tithe = amount(body.tithe)
    const offering = amount(body.offering)
    if (tithe === null && offering === null) {
        throw new AppError('Informe o valor do dízimo e/ou da oferta', 400)
    }
    return { tithe, offering }
}

function method(value) {
    if (!METHODS.includes(value)) throw new AppError('Forma de pagamento inválida', 400)
    return value
}

// a própria pessoa informa um dízimo/oferta dado fora do app
export function declareDTO(body, userId, churchId) {
    return {
        userId,
        churchId,
        ...amounts(body),
        method: method(body.method),
        date: day(body.date),
        source: 'membro',
        status: 'aprovado',
        notes: body.notes?.trim() || undefined,
    }
}

// pagamento pelo app: começa pendente até o Mercado Pago confirmar
export function checkoutDTO(body, userId, churchId) {
    return {
        userId,
        churchId,
        ...amounts(body),
        date: new Date(),
        source: 'app',
        status: 'pendente',
    }
}

// tesouraria registra a contribuição de alguém (com ou sem conta no app)
export function manualDTO(body, churchId, registeredBy) {
    if (!body.userId && !body.donorName?.trim()) {
        throw new AppError('Informe a pessoa ou o nome de quem contribuiu', 400)
    }
    return {
        userId: body.userId || undefined,
        donorName: body.donorName?.trim() || undefined,
        churchId,
        ...amounts(body),
        method: method(body.method),
        date: day(body.date),
        source: 'tesouraria',
        status: 'aprovado',
        notes: body.notes?.trim() || undefined,
        registeredBy,
    }
}
