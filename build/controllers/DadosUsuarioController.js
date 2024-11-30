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

// src/controllers/DadosUsuarioController.ts
var DadosUsuarioController_exports = {};
__export(DadosUsuarioController_exports, {
  default: () => dadosUsuariosRoutes
});
module.exports = __toCommonJS(DadosUsuarioController_exports);
function dadosUsuariosRoutes(fastify, prisma) {
  fastify.post("/DadosUsuario", async (request, reply) => {
    try {
      const { tpDados, vlDados } = request.body;
      const dadosUsuario = await prisma.dadosUsuario.create({
        data: { tpDados, vlDados }
      });
      reply.code(201).send(dadosUsuario);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/DadosUsuarios", async (request, reply) => {
    try {
      const dadosUsuarios = await prisma.dadosUsuario.findMany();
      reply.send(dadosUsuarios);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/DadosUsuario/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const dadosUsuario = await prisma.dadosUsuario.findUnique({ where: { id } });
      if (dadosUsuario) {
        reply.send(dadosUsuario);
      } else {
        reply.code(404).send({ error: "Dados do usu\xE1rio n\xE3o encontrados" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.post("/DadosUsuarioByTp", async (request, reply) => {
    try {
      const { tpDados } = request.body;
      const dadosUsuario = await prisma.dadosUsuario.findUnique({ where: { tpDados } });
      if (dadosUsuario) {
        reply.send(dadosUsuario);
      } else {
        reply.code(404).send({ error: "Dados do usu\xE1rio n\xE3o encontrados" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.put("/DadosUsuario/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { tpDados, vlDados } = request.body;
      const dadosUsuario = await prisma.dadosUsuario.update({
        where: { id },
        data: { tpDados, vlDados }
      });
      reply.send(dadosUsuario);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.delete("/DadosUsuario/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma.dadosUsuario.delete({ where: { id } });
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
