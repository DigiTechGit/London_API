import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export default function CNPJRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  
  fastify.post('/CNPJ', async (request, reply) => {
    try {
      const { CNPJ, idAtivo, desc } = request.body as { CNPJ: string, idAtivo: boolean, desc?: string };
      const CNPJDATA = await prisma.cNPJ.create({
        data: { CNPJ, idAtivo, desc },
      });
      reply.code(201).send(CNPJDATA);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Listar todas as CNPJs
  fastify.get('/CNPJ', async (request, reply) => {
    try {
      const CNPJs = await prisma.cNPJ.findMany();
      reply.send(CNPJs);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Obter uma CNPJ pelo ID
  fastify.get('/CNPJ/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const CNPJ = await prisma.cNPJ.findUnique({ where: { id } });
      if (CNPJ) {
        reply.send(CNPJ);
      } else {
        reply.code(404).send({ error: 'CNPJ não encontrada' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Atualizar uma CNPJ
  fastify.put('/CNPJ/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { CNPJ, idAtivo, desc } = request.body as { CNPJ: string, idAtivo: boolean, desc?: string };
      const _CNPJ = await prisma.cNPJ.update({
        where: { id },
        data: { CNPJ, idAtivo, desc },
      });
      reply.send(_CNPJ);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Deletar uma CNPJ
  fastify.delete('/CNPJ/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.cNPJ.delete({ where: { id } });
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
