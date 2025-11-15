import * as crypto from 'crypto'

const iterations = Number(process.env.PBKDF2_ITERATIONS ?? 120000)
const keylen = Number(process.env.PBKDF2_KEYLEN ?? 32)
const digest = process.env.PBKDF2_DIGEST ?? 'sha256'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest)
  const hash = derived.toString('hex')
  return `${digest}:${iterations}:${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [dg, iterStr, salt, hash] = stored.split(':')
  const iter = Number(iterStr)
  const derived = crypto.pbkdf2Sync(password, salt, iter, hash.length / 2, dg)
  const calc = derived.toString('hex')
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(calc, 'hex')
  if (a.length !== b.length) return false
  const va = new Uint8Array(a.buffer, a.byteOffset, a.byteLength)
  const vb = new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
  return crypto.timingSafeEqual(va, vb)
}