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

// src/controllers/cteController.ts
var cteController_exports = {};
__export(cteController_exports, {
  default: () => cteRoutes
});
module.exports = __toCommonJS(cteController_exports);
function cteRoutes(fastify, prisma) {
  fastify.post("/ctes", async (request, reply) => {
    const {
      chaveCTe,
      valorFrete,
      nomeMotorista,
      cpfMotorista,
      placaVeiculo,
      previsaoEntrega,
      remetente,
      destinatario,
      recebedor
    } = request.body;
    try {
      const motorista = await prisma.motorista_ssw.upsert({
        where: { cpf: cpfMotorista },
        update: {},
        create: {
          nome: nomeMotorista,
          cpf: cpfMotorista
        }
      });
      const remetenteEntity = await prisma.remetente.upsert({
        where: { cnpjCPF: remetente.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: remetente.cnpjCPF,
          tipo: remetente.tipo,
          nome: remetente.nome
        }
      });
      const destinatarioEntity = await prisma.destinatario.upsert({
        where: { cnpjCPF: destinatario.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: destinatario.cnpjCPF,
          tipo: destinatario.tipo,
          nome: destinatario.nome
        }
      });
      const recebedorEntity = await prisma.recebedor.upsert({
        where: { cnpjCPF: recebedor.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: recebedor.cnpjCPF,
          tipo: recebedor.tipo,
          nome: recebedor.nome,
          endereco: recebedor.endereco,
          numero: recebedor.numero,
          bairro: recebedor.bairro,
          cep: recebedor.cep,
          cidade: recebedor.cidade,
          uf: recebedor.uf,
          foneContato: recebedor.foneContato
        }
      });
      const cte = await prisma.ctes.create({
        data: {
          chaveCTe,
          valorFrete,
          placaVeiculo,
          previsaoEntrega,
          motoristaId: motorista.id,
          remetenteId: remetenteEntity.id,
          destinatarioId: destinatarioEntity.id,
          recebedorId: recebedorEntity.id,
          statusId: 1
        }
      });
      reply.status(201).send(cte);
    } catch (error) {
      reply.status(500).send({ error: "Failed to create CTe" });
    }
  });
  fastify.get("/quantidadeCtesPorStatusEUnidade", async (request, reply) => {
    try {
      const { status, unidade } = request.query;
      const ctes = await prisma.ctes.findMany({
        where: {
          statusId: Number(status),
          Unidade: unidade.toUpperCase()
        },
        include: {
          motorista: true,
          // Incluir dados do motorista
          remetente: true,
          // Incluir dados do remetente
          destinatario: true,
          // Incluir dados do destinatário
          recebedor: true,
          // Incluir dados do recebedor
          status: true
          // Incluir dados do status
        }
      });
      reply.status(200).send(ctes);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify.put("/CTES", async (request, reply) => {
    try {
      const { status, id } = request.body;
      const ctes = await prisma.ctes.update({
        where: { id },
        data: { statusId: parseInt(status) }
      });
      reply.send(ctes);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify.get("/LOG", async (request, reply) => {
    try {
      const { tpLog } = request.query;
      const log = await prisma.log.findFirst({
        where: {
          tp: tpLog.toUpperCase()
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      reply.status(200).send(log);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify.delete("/CTES", async (request, reply) => {
    try {
      await prisma.ctes.deleteMany();
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
