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

// src/controllers/statusController.ts
var statusController_exports = {};
__export(statusController_exports, {
  default: () => statusRoutes
});
module.exports = __toCommonJS(statusController_exports);
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();
async function statusRoutes(fastify) {
  fastify.post("/status", async (request, reply) => {
    try {
      const { status, descricao } = request.body;
      console.log(request.body);
      const newStatus = await prisma.statusEnvio.create({
        data: {
          status,
          descricao
        }
      });
      reply.code(201).send(newStatus);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: "Erro ao criar o status" });
    }
  });
  fastify.get("/status", async (request, reply) => {
    try {
      const statusList = await prisma.statusEnvio.findMany();
      reply.send(statusList);
    } catch (error) {
      reply.code(500).send({ error: "Erro ao obter os status" });
    }
  });
  fastify.get("/status/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const status = await prisma.statusEnvio.findUnique({
        where: {
          id: Number(id)
        }
      });
      if (!status) {
        reply.code(404).send({ error: "Status n\xE3o encontrado" });
      } else {
        reply.send(status);
      }
    } catch (error) {
      reply.code(500).send({ error: "Erro ao obter o status" });
    }
  });
  fastify.put("/status/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { status, descricao } = request.body;
      const updatedStatus = await prisma.statusEnvio.update({
        where: {
          id: Number(id)
        },
        data: {
          status,
          descricao
        }
      });
      reply.send(updatedStatus);
    } catch (error) {
      reply.code(500).send({ error: "Erro ao atualizar o status" });
    }
  });
  fastify.delete("/status/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma.statusEnvio.delete({
        where: {
          id: Number(id)
        }
      });
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: "Erro ao deletar o status" });
    }
  });
}
