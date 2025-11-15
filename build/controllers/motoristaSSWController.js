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

// src/controllers/motoristaSSWController.ts
var motoristaSSWController_exports = {};
__export(motoristaSSWController_exports, {
  default: () => motoristaSSWRoutes
});
module.exports = __toCommonJS(motoristaSSWController_exports);
var apiKey = process.env.API_KEY;
var headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", `Basic ${btoa(`${apiKey}:`)}`);
function motoristaSSWRoutes(fastify, prisma) {
  fastify.post("/MotoristasSSW", async (request, reply) => {
    try {
      console.log("Request body:", request.body);
      const { cpf, nome, telefone, whatsApp, empresaIds } = request.body;
      const motorista = await prisma.motorista_ssw.create({
        data: { cpf, nome, telefone, whatsApp }
      });
      for (const empresaId of empresaIds) {
        await prisma.motoristaEmpresa.create({
          data: { motoristaId: motorista.id, empresaId }
        });
      }
      reply.send(motorista);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/MotoristasSSW", async (request, reply) => {
    try {
      const motoristas = await prisma.motorista_ssw.findMany();
      const motoristasComEmpresa = await Promise.all(
        motoristas.map(async (motorista) => {
          const empresaRelacao = await prisma.motoristaEmpresa.findMany({
            where: { motoristaId: motorista.id }
          });
          return {
            ...motorista,
            empresa: empresaRelacao || null
          };
        })
      );
      reply.send(motoristasComEmpresa);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/Motoristas/delete/:cpf", async (request, reply) => {
    try {
      const { cpf } = request.params;
      const motorista = await prisma.motorista_ssw.findUnique({
        where: { cpf },
        select: { id: true }
      });
      if (!motorista) {
        return reply.code(404).send({ error: "Motorista n\xE3o encontrado" });
      }
      await prisma.$transaction([
        prisma.motoristaEmpresa.deleteMany({
          where: { motoristaId: motorista.id }
        }),
        prisma.motorista_ssw.delete({
          where: { id: motorista.id }
        })
      ]);
      reply.send({ message: "Motorista exclu\xEDdo com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/MotoristasSSW/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const MotoristaSSW = await prisma.motorista_ssw.findUnique({ where: { id: Number(id) } });
      if (MotoristaSSW) {
        reply.send(MotoristaSSW);
      } else {
        reply.code(404).send({ error: "MotoristaSSW n\xE3o encontrado" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.put("/MotoristasSSW/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { telefone, whatsApp, empresaIds } = request.body;
      const MotoristaSSW = await prisma.motorista_ssw.update({
        where: { id: Number(id) },
        data: { telefone, whatsApp }
      });
      await prisma.motoristaEmpresa.deleteMany({
        where: { motoristaId: Number(id) }
      });
      for (const empresaId of empresaIds) {
        await prisma.motoristaEmpresa.create({
          data: { motoristaId: Number(id), empresaId }
        });
      }
      reply.send(MotoristaSSW);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
}
