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

// src/controllers/recebedorController.ts
var recebedorController_exports = {};
__export(recebedorController_exports, {
  default: () => recebedorRoutes
});
module.exports = __toCommonJS(recebedorController_exports);
function recebedorRoutes(fastify, prisma) {
  fastify.post("/recebedor", async (request, reply) => {
    try {
      const {
        cnpjCPF,
        tipo,
        nome,
        endereco,
        numero,
        bairro,
        cep,
        cidade,
        uf,
        foneContato,
        complemento
      } = request.body;
      const newRecebedor = await prisma.recebedor.create({
        data: {
          cnpjCPF,
          tipo,
          nome,
          endereco,
          numero,
          bairro,
          cep,
          cidade,
          uf,
          foneContato,
          complemento
        }
      });
      reply.code(201).send(newRecebedor);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: "Erro ao criar o recebedor" });
    }
  });
  fastify.get("/recebedor", async (request, reply) => {
    try {
      const recebedorList = await prisma.recebedor.findMany();
      reply.send(recebedorList);
    } catch (error) {
      reply.code(500).send({ error: "Erro ao obter os recebedores" });
    }
  });
  fastify.get("/recebedor/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const recebedor = await prisma.recebedor.findUnique({
        where: {
          id: Number(id)
        }
      });
      if (!recebedor) {
        reply.code(404).send({ error: "Recebedor n\xE3o encontrado" });
      } else {
        reply.send(recebedor);
      }
    } catch (error) {
      reply.code(500).send({ error: "Erro ao obter o recebedor" });
    }
  });
  fastify.put("/recebedor/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const {
        cnpjCPF,
        tipo,
        nome,
        endereco,
        numero,
        bairro,
        cep,
        cidade,
        uf,
        foneContato,
        complemento
      } = request.body;
      const updatedRecebedor = await prisma.recebedor.update({
        where: {
          id: Number(id)
        },
        data: {
          cnpjCPF,
          tipo,
          nome,
          endereco,
          numero,
          bairro,
          cep,
          cidade,
          uf,
          foneContato,
          complemento
        }
      });
      reply.send(updatedRecebedor);
    } catch (error) {
      reply.code(500).send({ error: "Erro ao atualizar o recebedor" });
    }
  });
}
