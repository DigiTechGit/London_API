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

// src/utils/auth/jwt.ts
var jwt_exports = {};
__export(jwt_exports, {
  createJWT: () => createJWT,
  verifyJWT: () => verifyJWT
});
module.exports = __toCommonJS(jwt_exports);
var crypto = __toESM(require("crypto"));
function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function sign(data, secret) {
  const hmac = crypto.createHmac("sha256", secret);
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
    if (bs.length !== be.length || !crypto.timingSafeEqual(bs, be)) {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createJWT,
  verifyJWT
});
