import { hashPassword, verifyPassword } from '../src/utils/auth/password'
import { createJWT, verifyJWT } from '../src/utils/auth/jwt'

process.env.JWT_SECRET = 'test-secret'

const senha = 'Teste123!'
const hash = hashPassword(senha)
const ok = verifyPassword(senha, hash)
const token = createJWT({ sub: 'user-123', email: 'user@test.com', roles: ['admin'] }, 60)
const res = verifyJWT(token)

console.log(JSON.stringify({ hashOk: ok, tokenValid: res.valid, payload: res.payload }))