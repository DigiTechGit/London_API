"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controllers/authController.ts
var authController_exports = {};
__export(authController_exports, {
  default: () => authController
});
module.exports = __toCommonJS(authController_exports);

// src/utils/auth/password.ts
var crypto = __toESM(require("crypto"));
var iterations = Number(process.env.PBKDF2_ITERATIONS ?? 12e4);
var keylen = Number(process.env.PBKDF2_KEYLEN ?? 32);
var digest = process.env.PBKDF2_DIGEST ?? "sha256";
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
  const hash = derived.toString("hex");
  return `${digest}:${iterations}:${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [dg, iterStr, salt, hash] = stored.split(":");
  const iter = Number(iterStr);
  const derived = crypto.pbkdf2Sync(password, salt, iter, hash.length / 2, dg);
  const calc = derived.toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(calc, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// src/utils/auth/jwt.ts
var crypto2 = __toESM(require("crypto"));
function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function sign(data, secret) {
  const hmac = crypto2.createHmac("sha256", secret);
  hmac.update(data);
  return base64url(hmac.digest());
}
function createJWT(payload, expiresInSec = 3600) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1e3);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const secret = process.env.JWT_SECRET || "";
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(body));
  const toSign = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(toSign, secret);
  return `${toSign}.${signature}`;
}
function verifyJWT(token) {
  try {
    const secret = process.env.JWT_SECRET || "";
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, error: "Formato inv\xE1lido" };
    const [h, p, s] = parts;
    const expected = sign(`${h}.${p}`, secret);
    const bs = Buffer.from(s);
    const be = Buffer.from(expected);
    if (bs.length !== be.length || !crypto2.timingSafeEqual(bs, be)) {
      return { valid: false, error: "Assinatura inv\xE1lida" };
    }
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp && now > payload.exp) return { valid: false, error: "Token expirado" };
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, error: e?.message || "Erro ao validar token" };
  }
}

// src/controllers/authController.ts
function authController(fastify, prisma) {
  const db = prisma;
  fastify.post("/auth/register", async (request, reply) => {
    try {
      const { nome, email, senha, cargos } = request.body;
      const exists = await db.usuario?.findUnique({ where: { email } });
      if (exists) {
        reply.code(409).send({ error: "E-mail j\xE1 cadastrado" });
        return;
      }
      const senhaHash = hashPassword(senha);
      const usuario = await db.usuario.create({ data: { nome, email, senhaHash } });
      if (cargos && cargos.length) {
        for (const nomeCargo of cargos) {
          const cargo = await db.cargo.upsert({ where: { nome: nomeCargo }, update: {}, create: { nome: nomeCargo } });
          await db.usuarioCargo.create({ data: { usuarioId: usuario.id, cargoId: cargo.id } });
        }
      }
      reply.code(201).send({ id: usuario.id });
    } catch (error) {
      reply.code(500).send({ error: error.message || "Erro ao registrar" });
    }
  });
  fastify.post("/auth/login", async (request, reply) => {
    try {
      const { email, senha } = request.body;
      const usuario = await db.usuario.findUnique({ where: { email }, include: { cargos: { include: { cargo: true } } } });
      if (!usuario) {
        reply.code(401).send({ error: "Credenciais inv\xE1lidas" });
        return;
      }
      const ok = verifyPassword(senha, usuario.senhaHash);
      if (!ok) {
        reply.code(401).send({ error: "Credenciais inv\xE1lidas" });
        return;
      }
      const roles = usuario.cargos.map((uc) => uc.cargo.nome);
      const token = createJWT({ sub: usuario.id, email: usuario.email, roles });
      reply.code(200).send({ token });
    } catch (error) {
      reply.code(500).send({ error: error.message || "Erro ao autenticar" });
    }
  });
  fastify.get("/auth/me", async (request, reply) => {
    try {
      const auth = request.headers.authorization;
      if (!auth) {
        reply.code(401).send({ error: "Token ausente" });
        return;
      }
      const token = auth.replace(/^Bearer\s+/i, "");
      const { valid, payload, error } = verifyJWT(token);
      if (!valid) {
        reply.code(401).send({ error: error || "Token inv\xE1lido" });
        return;
      }
      const usuario = await db.usuario.findUnique({ where: { id: payload.sub } });
      reply.code(200).send({ id: usuario?.id, email: usuario?.email, nome: usuario?.nome, roles: payload.roles });
    } catch (error) {
      reply.code(500).send({ error: error.message || "Erro ao validar" });
    }
  });
}
