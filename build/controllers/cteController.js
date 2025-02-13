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
  fastify.put("/cte/status", async (request, reply) => {
    const { status, chaveCTe, nroCTRC } = request.body;
    try {
      const existingCTe = await prisma.ctes.findFirst({
        where: {
          chaveCTe,
          nroCTRC
        }
      });
      if (existingCTe) {
        await prisma.ctes.update({
          where: { id: existingCTe.id },
          data: { statusId: status }
        });
      }
      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: "Failed to update CTe" });
    }
  });
  fastify.get("/quantidadeCtesTotalPorStatus", async (request, reply) => {
    try {
      const { unidade, status } = request.query;
      const ultimoLog = await prisma.log.findFirst({
        where: {
          tp: `AGENDADOR-${unidade.toUpperCase()}`
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      const motoristasSalvos = await prisma.motorista.findMany({
        select: {
          idCircuit: true,
          placa: true
        }
      });
      const statusFormatado = status ? parseInt(status) : 1;
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      if (ultimoLog && ultimoLog.createdAt) {
        const dtAlteracaoComMinutos = new Date(ultimoLog.createdAt);
        dtAlteracaoComMinutos.setMinutes(dtAlteracaoComMinutos.getMinutes());
      }
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas
          },
          statusId: statusFormatado,
          Unidade: unidade.toUpperCase(),
          listarCTE: true
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true
        }
      });
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ
            }
          });
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists
          };
        })
      );
      const motoristasComCtes = motoristasSalvos.map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa
        );
        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesDoMotorista.length > 0 ? {
          ...motoristaComNome,
          ctes: statusFormatado ? ctesDoMotorista.filter((cte) => cte.statusId === statusFormatado) : ctesDoMotorista,
          ctesEnviados: ctesEnviados.length,
          ctesNaoEnviados: ctesNaoEnviados.length
        } : null;
      }).filter(Boolean);
      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify.get("/ctesPorPlaca", async (request, reply) => {
    try {
      const { unidade, placa, statusId } = request.query;
      const motoristasSalvos = await prisma.motorista.findMany({
        where: {
          placa
        },
        select: {
          idCircuit: true,
          placa: true
        }
      });
      const statusFormatado = statusId ? parseInt(statusId) : 1;
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas
          },
          // statusId: statusIdFormatado,
          listarCTE: true
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true
        }
      });
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ
            }
          });
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists
          };
        })
      );
      const motoristasComCtes = motoristasSalvos.map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa
        );
        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesDoMotorista.length > 0 ? {
          ...motoristaComNome,
          ctes: statusFormatado ? ctesDoMotorista.filter((cte) => cte.statusId === statusFormatado) : ctesDoMotorista,
          ctesEnviados: ctesEnviados.length,
          ctesNaoEnviados: ctesNaoEnviados.length
        } : null;
      }).filter(Boolean);
      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify.get("/quantidadeCtesNaoEnviados", async (request, reply) => {
    try {
      const { unidade } = request.query;
      const motoristasSalvos = await prisma.motorista.findMany({
        select: {
          idCircuit: true,
          placa: true
        }
      });
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas
          },
          Unidade: unidade.toUpperCase(),
          listarCTE: true
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true
        }
      });
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ
            }
          });
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists
          };
        })
      );
      const motoristasComCtes = motoristasSalvos.map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa
        );
        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesNaoEnviados.length > 0 && ctesEnviados.length == 0 ? {
          ...motoristaComNome,
          ctes: ctesDoMotorista.filter((cte) => cte.statusId === 1),
          ctesEnviados: ctesEnviados.length,
          ctesNaoEnviados: ctesNaoEnviados.length
        } : null;
      }).filter(Boolean);
      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
}
