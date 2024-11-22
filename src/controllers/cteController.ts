import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { CTeRequestBody } from "../interfaces/CTeRequestBody";

export default function cteRoutes(
  fastify: FastifyInstance,
  prisma: PrismaClient,
) {
  fastify.post<{ Body: CTeRequestBody }>("/ctes", async (request, reply) => {
    const {
      chaveCTe,
      valorFrete,
      nomeMotorista,
      cpfMotorista,
      placaVeiculo,
      previsaoEntrega,
      remetente,
      destinatario,
      recebedor,
    } = request.body;

    try {
      // Criar ou encontrar o motorista
      const motorista = await prisma.motorista_ssw.upsert({
        where: { cpf: cpfMotorista },
        update: {},
        create: {
          nome: nomeMotorista,
          cpf: cpfMotorista,
        },
      });

      // Criar ou encontrar o remetente
      const remetenteEntity = await prisma.remetente.upsert({
        where: { cnpjCPF: remetente.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: remetente.cnpjCPF,
          tipo: remetente.tipo,
          nome: remetente.nome,
        },
      });

      // Criar ou encontrar o destinatário
      const destinatarioEntity = await prisma.destinatario.upsert({
        where: { cnpjCPF: destinatario.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: destinatario.cnpjCPF,
          tipo: destinatario.tipo,
          nome: destinatario.nome,
        },
      });

      // Criar ou encontrar o recebedor
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
          foneContato: recebedor.foneContato,
        },
      });

      // Criar o CTe com o status
      const cte = await prisma.ctes.create({
        data: {
          chaveCTe,
          valorFrete,
          placaVeiculo,
          previsaoEntrega: previsaoEntrega,
          motoristaId: motorista.id,
          remetenteId: remetenteEntity.id,
          destinatarioId: destinatarioEntity.id,
          recebedorId: recebedorEntity.id,
          statusId: 1,
        },
      });

      reply.status(201).send(cte);
    } catch (error) {
      reply.status(500).send({ error: "Failed to create CTe" });
    }
  });

  fastify.get("/quantidadeCtesPorStatusEUnidade", async (request, reply) => {
    try {
      const { unidade } = request.query as { unidade: string }; // Alterado para query

      let filtroData = {};
      const ultimoLog = await prisma.log.findFirst({
        where: {
          tp: `AGENDADOR-${unidade.toUpperCase()}`,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

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
          Unidade: unidade.toUpperCase(),
          ...filtroData, // Incluir o filtro de data se o status for 1
        },
        include: {
          motorista: true, // Incluir dados do motorista
          remetente: true, // Incluir dados do remetente
          destinatario: true, // Incluir dados do destinatário
          recebedor: true, // Incluir dados do recebedor
          status: true, // Incluir dados do status
        },
      });

      reply.status(200).send(ctes);
    } catch (error) {
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
  fastify.put(
    "/cte/status",
    async (request, reply) => {
      const { status, chaveCTe, nroCTRC } = request.body as { status: number; chaveCTe: string, nroCTRC: number | null }

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
    },
  );
  
}
