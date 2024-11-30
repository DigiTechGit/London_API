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

// src/controllers/UnidadeController.ts
var UnidadeController_exports = {};
__export(UnidadeController_exports, {
  default: () => unidadeRoutes
});
module.exports = __toCommonJS(UnidadeController_exports);
function unidadeRoutes(fastify, prisma) {
  fastify.post("/Unidade", async (request, reply) => {
    try {
      const { Unidade, idAtivo, desc } = request.body;
      const unidade = await prisma.unidade.create({
        data: { Unidade, idAtivo, desc }
      });
      reply.code(201).send(unidade);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/Unidades", async (request, reply) => {
    try {
      const unidades = await prisma.unidade.findMany();
      reply.send(unidades);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/Unidade/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const unidade = await prisma.unidade.findUnique({ where: { id } });
      if (unidade) {
        reply.send(unidade);
      } else {
        reply.code(404).send({ error: "Unidade n\xE3o encontrada" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.put("/Unidade/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { Unidade, idAtivo, desc } = request.body;
      const unidade = await prisma.unidade.update({
        where: { id },
        data: { Unidade, idAtivo, desc }
      });
      reply.send(unidade);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.delete("/Unidade/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma.unidade.delete({ where: { id } });
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
