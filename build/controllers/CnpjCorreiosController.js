"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controllers/CnpjCorreiosController.ts
var CnpjCorreiosController_exports = {};
__export(CnpjCorreiosController_exports, {
  default: () => CNPJRoutes
});
module.exports = __toCommonJS(CnpjCorreiosController_exports);
function CNPJRoutes(fastify, prisma) {
  fastify.post("/CNPJ", async (request, reply) => {
    try {
      const { CNPJ, idAtivo, desc } = request.body;
      const CNPJDATA = await prisma.cnpjTb.create({
        data: { CNPJ, idAtivo, desc }
      });
      reply.code(201).send(CNPJDATA);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/CNPJ", async (request, reply) => {
    try {
      const CNPJs = await prisma.cnpjTb.findMany();
      reply.send(CNPJs);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/CNPJ/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const CNPJ = await prisma.cnpjTb.findUnique({ where: { id } });
      if (CNPJ) {
        reply.send(CNPJ);
      } else {
        reply.code(404).send({ error: "CNPJ n\xE3o encontrada" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.put("/CNPJ/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { CNPJ, idAtivo, desc } = request.body;
      const _CNPJ = await prisma.cnpjTb.update({
        where: { id },
        data: { CNPJ, idAtivo, desc }
      });
      reply.send(_CNPJ);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.delete("/CNPJ/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma.cnpjTb.delete({ where: { id } });
      reply.code(204).send();
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
}
