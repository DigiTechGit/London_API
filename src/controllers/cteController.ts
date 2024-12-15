import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { CTeRequestBody } from "../interfaces/CTeRequestBody";

export default function cteRoutes(
  fastify: FastifyInstance,
  prisma: PrismaClient
) {
  fastify.put("/CTES", async (request, reply) => {
    try {
      const { status, id } = request.body as { status: string; id: number };
      const ctes = await prisma.ctes.update({
        where: { id },
        data: { statusId: parseInt(status) },
      });
      reply.send(ctes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });

  fastify.get("/LOG", async (request, reply) => {
    try {
      const { tpLog } = request.query as { tpLog: string }; // Alterado para query

      const log = await prisma.log.findFirst({
        where: {
          tp: tpLog.toUpperCase(),
        },
        orderBy: {
          createdAt: "desc",
        },
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });

  // rota para atualizar status dos cte's
  fastify.put("/cte/status", async (request, reply) => {
    const { status, chaveCTe, nroCTRC } = request.body as {
      status: number;
      chaveCTe: string;
      nroCTRC: number | null;
    };

    try {
      const existingCTe = await prisma.ctes.findFirst({
        where: {
          chaveCTe: chaveCTe,
          nroCTRC: nroCTRC,
        },
      });

      if (existingCTe) {
        await prisma.ctes.update({
          where: { id: existingCTe.id },
          data: { statusId: status },
        });
      }

      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: "Failed to update CTe" });
    }
  });

  fastify.get("/quantidadeCtesTotalPorStatus", async (request, reply) => {
    try {
      const { unidade, status } = request.query as { unidade: string, status: string };
      let filtroData = {};

      const ultimoLog = await prisma.log.findFirst({
        where: {
          tp: `AGENDADOR-${unidade.toUpperCase()}`,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const motoristasSalvos = await prisma.motorista.findMany({
        select: {
          idCircuit: true,
          placa: true,
        }
      });
      const statusFormatado = status ? parseInt(status) : 1;
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      
      if (ultimoLog && ultimoLog.createdAt) {
        const dtAlteracaoComMinutos = new Date(ultimoLog.createdAt);
        dtAlteracaoComMinutos.setMinutes(dtAlteracaoComMinutos.getMinutes());
        filtroData = {
          dt_alteracao: {
            gte: dtAlteracaoComMinutos,
          },
        };
      }
      
      // Buscar os CTe's com base nos filtros
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas,
          },
          statusId: statusFormatado,
          Unidade: unidade.toUpperCase(),
          ...filtroData,
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true,
        },
      });
      
      // Enriquecer os CTe's com informação de cnpjCorreios
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ,
            },
          });
      
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists,
          };
        })
      );

      const motoristasComCtes = motoristasSalvos
      .map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa 
        );

        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null, 
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesDoMotorista.length > 0
          ? {
              ...motoristaComNome,
              ctes: statusFormatado ? ctesDoMotorista.filter((cte) => cte.statusId === statusFormatado) : ctesDoMotorista,
              ctesEnviados: ctesEnviados.length,
              ctesNaoEnviados: ctesNaoEnviados.length,
            } : null;
      })
      .filter(Boolean); // Remove itens nulos
        

      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });

  fastify.get("/ctesPorPlaca", async (request, reply) => {
    try {
      const { unidade, placa, statusId } = request.query as { unidade: string, placa: string, statusId: string };


      const motoristasSalvos = await prisma.motorista.findMany({
        where: {
          placa: placa,
        },
        select: {
          idCircuit: true,
          placa: true,
        }
      });

      const statusFormatado = statusId ? parseInt(statusId) : 1;
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      
      // Buscar os CTe's com base nos filtros
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas,
          },
          // statusId: statusIdFormatado,
          listarCTE: true,
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true,
        },
      });

      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ,
            },
          });
      
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists,
          };
        })
      );

      const motoristasComCtes = motoristasSalvos
      .map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa
        );

        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null, 
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesDoMotorista.length > 0
          ? {
              ...motoristaComNome,
              ctes: statusFormatado ? ctesDoMotorista.filter((cte) => cte.statusId === statusFormatado) : ctesDoMotorista,
              ctesEnviados: ctesEnviados.length,
              ctesNaoEnviados: ctesNaoEnviados.length,
            }
          : null;
      })
      .filter(Boolean); // Remove itens nulos

      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });

  fastify.get("/quantidadeCtesNaoEnviados", async (request, reply) => {
    try {
      const { unidade } = request.query as { unidade: string };

      const motoristasSalvos = await prisma.motorista.findMany({
        select: {
          idCircuit: true,
          placa: true,
        }
      });

      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      
      // Buscar os CTe's com base nos filtros
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas,
          },
          Unidade: unidade.toUpperCase(),
          listarCTE: true,
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true,
        },
      });
      
      // Enriquecer os CTe's com informação de cnpjCorreios
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ,
            },
          });
      
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists,
          };
        })
      );

      const motoristasComCtes = motoristasSalvos
      .map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa 
        );

        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null, 
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesNaoEnviados.length > 0 && ctesEnviados.length == 0
          ? {
              ...motoristaComNome,
              ctes: ctesDoMotorista.filter((cte) => cte.statusId === 1),
              ctesEnviados: ctesEnviados.length,
              ctesNaoEnviados: ctesNaoEnviados.length,
            } : null;
      })
      .filter(Boolean); // Remove itens nulos
        

      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });  
}
