import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

export default function cteRoutes(
  fastify: FastifyInstance,
  prisma: PrismaClient
) {
  fastify.get("/quantidadeCtesPorStatusEUnidade", async (request, reply) => {
    try {
      const { unidade } = request.query as { unidade: string };
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
          placa: true,
        },
      });
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);

      if (ultimoLog && ultimoLog.createdAt) {
        const dtAlteracaoComMinutos = new Date(ultimoLog.createdAt);
        dtAlteracaoComMinutos.setMinutes(dtAlteracaoComMinutos.getMinutes());
        // Adicionar o filtro de data baseado no último log
        filtroData = {
          dt_alteracao: {
            gte: dtAlteracaoComMinutos, // Filtra os registros que foram alterados a partir do último log
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
          Unidade: unidade.toUpperCase(),
          ...filtroData,
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
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


      reply.status(200).send(ctesEnriched);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });

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
      await prisma.ctes.deleteMany({where: {id: {not: 0}}});
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
}
