import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';

const apiKey = process.env.API_KEY;

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);

export default function motoristaSSWRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Listar todos os motoristaSSWs
  fastify.get('/MotoristaSSWs', async (request, reply) => {
    try {
      const MotoristaSSW = await prisma.motorista_ssw.findMany();

      reply.send(MotoristaSSW);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Obter um único motoristaSSW
  fastify.get('/MotoristaSSW/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const MotoristaSSW = await prisma.motorista_ssw.findUnique({ where: { id: Number(id) } });
      if (MotoristaSSW) {
        reply.send(MotoristaSSW);
      } else {
        reply.code(404).send({ error: 'MotoristaSSW não encontrado' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Atualizar um motoristaSSW
  fastify.put('/MotoristaSSW/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { telefone } = request.body as { telefone: string };
      const MotoristaSSW = await prisma.motorista_ssw.update({
        where: { id: Number(id) },
        data: { telefone },
      });
      reply.send(MotoristaSSW);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });
}
