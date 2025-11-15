import { FastifyInstance, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword } from '../utils/auth/password'
import { createJWT, verifyJWT } from '../utils/auth/jwt'

const FEATURE_SECRET = process.env.FEATURE_AUTH_SECRET || ''
let AUTH_RUNTIME_ENABLED = false

function isAuthEnabled(request: FastifyRequest): boolean {
  if (process.env.AUTH_ENABLED === 'true') return true
  if (AUTH_RUNTIME_ENABLED) return true
  const hdr = String(request.headers['x-auth-enabled'] || '')
  const sec = String(request.headers['x-feature-secret'] || '')
  if (hdr.toLowerCase() === 'true' && sec && sec === FEATURE_SECRET) return true
  return false
}

export default function authController(fastify: FastifyInstance, prisma: PrismaClient) {
  const db: any = prisma
  fastify.post('/auth/register', async (request, reply) => {
    try {
      if (!isAuthEnabled(request)) {
        reply.code(404).send({ error: 'Not found' })
        return
      }
      const { nome, email, senha, cargos } = request.body as { nome: string; email: string; senha: string; cargos?: string[] }
      const exists = await db.usuario?.findUnique({ where: { email } })
      if (exists) {
        reply.code(409).send({ error: 'E-mail já cadastrado' })
        return
      }
      const senhaHash = hashPassword(senha)
      const usuario = await db.usuario.create({ data: { nome, email, senhaHash } })
      if (cargos && cargos.length) {
        for (const nomeCargo of cargos) {
          const cargo = await db.cargo.upsert({ where: { nome: nomeCargo }, update: {}, create: { nome: nomeCargo } })
          await db.usuarioCargo.create({ data: { usuarioId: usuario.id, cargoId: cargo.id } })
        }
      }
      reply.code(201).send({ id: usuario.id })
    } catch (error: any) {
      reply.code(500).send({ error: error.message || 'Erro ao registrar' })
    }
  })

  fastify.post('/auth/login', async (request, reply) => {
    try {
      if (!isAuthEnabled(request)) {
        reply.code(404).send({ error: 'Not found' })
        return
      }
      const { email, senha } = request.body as { email: string; senha: string }
      const usuario = await db.usuario.findUnique({ where: { email }, include: { cargos: { include: { cargo: true } } } }) as any
      if (!usuario) {
        reply.code(401).send({ error: 'Credenciais inválidas' })
        return
      }
      const ok = verifyPassword(senha, usuario.senhaHash)
      if (!ok) {
        reply.code(401).send({ error: 'Credenciais inválidas' })
        return
      }
      const roles = (usuario.cargos as { cargo: { nome: string } }[]).map((uc) => uc.cargo.nome)
      const token = createJWT({ sub: usuario.id, email: usuario.email, roles })
      reply.code(200).send({ token })
    } catch (error: any) {
      reply.code(500).send({ error: error.message || 'Erro ao autenticar' })
    }
  })

  fastify.get('/auth/me', async (request, reply) => {
    try {
      if (!isAuthEnabled(request)) {
        reply.code(404).send({ error: 'Not found' })
        return
      }
      const auth = request.headers.authorization
      if (!auth) {
        reply.code(401).send({ error: 'Token ausente' })
        return
      }
      const token = auth.replace(/^Bearer\s+/i, '')
      const { valid, payload, error } = verifyJWT(token)
      if (!valid) {
        reply.code(401).send({ error: error || 'Token inválido' })
        return
      }
      const usuario = await db.usuario.findUnique({ where: { id: payload.sub } })
      reply.code(200).send({ id: usuario?.id, email: usuario?.email, nome: usuario?.nome, roles: payload.roles })
    } catch (error: any) {
      reply.code(500).send({ error: error.message || 'Erro ao validar' })
    }
  })

  fastify.post('/auth/isAuth', async (request, reply) => {
    try {
      if (!isAuthEnabled(request)) {
        reply.code(404).send({ isAuth: false, error: 'Not found' })
        return
      }
      const { token } = request.body as { token?: string }
      if (!token) {
        reply.code(400).send({ isAuth: false, error: 'Token ausente' })
        return
      }
      const res = verifyJWT(token)
      reply.code(res.valid ? 200 : 401).send({ isAuth: res.valid, payload: res.payload, error: res.error })
    } catch (error: any) {
      reply.code(500).send({ isAuth: false, error: error.message || 'Erro ao validar token' })
    }
  })

  fastify.post('/feature/auth/toggle', async (request, reply) => {
    try {
      const { enabled, secret } = request.body as { enabled?: boolean; secret?: string }
      if (!secret || secret !== FEATURE_SECRET) {
        reply.code(403).send({ ok: false, error: 'Forbidden' })
        return
      }
      AUTH_RUNTIME_ENABLED = !!enabled
      reply.code(200).send({ ok: true, enabled: AUTH_RUNTIME_ENABLED })
    } catch (error: any) {
      reply.code(500).send({ ok: false, error: error.message || 'Erro ao alternar feature' })
    }
  })
}