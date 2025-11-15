import * as crypto from 'crypto'

type Header = { alg: 'HS256', typ: 'JWT' }

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function sign(data: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(data)
  return base64url(hmac.digest())
}

export function createJWT(payload: Record<string, any>, expiresInSec = 3600): string {
  const header: Header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat: now, exp: now + expiresInSec }
  const secret = process.env.JWT_SECRET || ''
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(body))
  const toSign = `${encodedHeader}.${encodedPayload}`
  const signature = sign(toSign, secret)
  return `${toSign}.${signature}`
}

export function verifyJWT(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const secret = process.env.JWT_SECRET || ''
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, error: 'Formato inválido' }
    const [h, p, s] = parts
    const expected = sign(`${h}.${p}`, secret)
    const bs = Buffer.from(s)
    const be = Buffer.from(expected)
    if (bs.length !== be.length) {
      return { valid: false, error: 'Assinatura inválida' }
    }
    const vbs = new Uint8Array(bs.buffer, bs.byteOffset, bs.byteLength)
    const vbe = new Uint8Array(be.buffer, be.byteOffset, be.byteLength)
    if (!crypto.timingSafeEqual(vbs, vbe)) {
      return { valid: false, error: 'Assinatura inválida' }
    }
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && now > payload.exp) return { valid: false, error: 'Token expirado' }
    return { valid: true, payload }
  } catch (e: any) {
    return { valid: false, error: e?.message || 'Erro ao validar token' }
  }
}