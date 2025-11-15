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

// src/controllers/jadLogController.ts
var jadLogController_exports = {};
__export(jadLogController_exports, {
  default: () => JadLog
});
module.exports = __toCommonJS(jadLogController_exports);
var import_node_fetch = __toESM(require("node-fetch"));
async function JadLog(fastify) {
  fastify.get("/JadLog/produtos/produtos/buscar/:codigo", async (request, reply) => {
    const { codigo } = request.params;
    try {
      const response = await (0, import_node_fetch.default)(`http://localhost:3001/api/produtos/produtos/buscar/${codigo}`);
      const data = await response.json();
      if (response.ok) {
        return reply.send(data);
      } else {
        return reply.status(400).send({ error: "Produto n\xE3o encontrado" });
      }
    } catch (err) {
      console.error("Erro ao chamar a API externa:", err);
      return reply.status(500).send({ error: "Erro interno ao chamar a API externa" });
    }
  });
}
