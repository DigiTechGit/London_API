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

// src/utils/auth/password.ts
var password_exports = {};
__export(password_exports, {
  hashPassword: () => hashPassword,
  verifyPassword: () => verifyPassword
});
module.exports = __toCommonJS(password_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hashPassword,
  verifyPassword
});
