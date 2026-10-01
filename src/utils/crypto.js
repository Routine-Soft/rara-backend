// utils/crypto.js
// Criptografa segredos guardados no banco (ex.: Access Token do Mercado Pago)
// com AES-256-GCM. A chave vem de SETTINGS_ENCRYPTION_KEY (64 caracteres hex).
import crypto from 'crypto'
import AppError from '../errors/AppError.js'

function getKey() {
    const hex = process.env.SETTINGS_ENCRYPTION_KEY
    if (!hex || hex.length !== 64) {
        throw new AppError('SETTINGS_ENCRYPTION_KEY não configurada no servidor', 500)
    }
    return Buffer.from(hex, 'hex')
}

// "iv:tag:conteúdo", tudo em base64
export function encrypt(plain) {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)
    const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return [iv, tag, data].map(b => b.toString('base64')).join(':')
}

export function decrypt(payload) {
    const [iv, tag, data] = payload.split(':').map(p => Buffer.from(p, 'base64'))
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}

// "APP_USR-...-1234" -> "••••1234" (para mostrar sem revelar)
export function hint(secret) {
    return secret ? `••••${secret.slice(-4)}` : null
}
