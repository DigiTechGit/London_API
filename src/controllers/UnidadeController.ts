import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export default function unidadeRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  
  fastify.post('/Unidade', async (request, reply) => {
    try {
      const { Unidade, idAtivo, desc } = request.body as { Unidade: string, idAtivo: boolean, desc?: string };
      const unidade = await prisma.unidade.create({
        data: { Unidade, idAtivo, desc },
      });
      reply.code(201).send(unidade);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Listar todas as Unidades
  fastify.get('/Unidades', async (request, reply) => {
    try {
      const unidades = await prisma.unidade.findMany();
      reply.send(unidades);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Obter uma Unidade pelo ID
  fastify.get('/Unidade/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const unidade = await prisma.unidade.findUnique({ where: { id } });
      if (unidade) {
        reply.send(unidade);
      } else {
        reply.code(404).send({ error: 'Unidade não encontrada' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Atualizar uma Unidade
  fastify.put('/Unidade/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { Unidade, idAtivo, desc } = request.body as { Unidade: string, idAtivo: boolean, desc?: string };
      const unidade = await prisma.unidade.update({
        where: { id },
        data: { Unidade, idAtivo, desc },
      });
      reply.send(unidade);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Deletar uma Unidade
  fastify.delete('/Unidade/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.unidade.delete({ where: { id } });
      reply.code(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

}
