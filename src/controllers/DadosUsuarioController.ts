import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export default function dadosUsuariosRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  
  fastify.post('/DadosUsuario', async (request, reply) => {
    try {
      const { tpDados, vlDados } = request.body as { tpDados: string, vlDados: string };
      const dadosUsuario = await prisma.dadosUsuario.create({
        data: { tpDados, vlDados },
      });
      reply.code(201).send(dadosUsuario);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Listar todos os Dados do Usuário
  fastify.get('/DadosUsuarios', async (request, reply) => {
    try {
      const dadosUsuarios = await prisma.dadosUsuario.findMany();
      reply.send(dadosUsuarios);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Obter um Dado do Usuário pelo ID
  fastify.get('/DadosUsuario/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const dadosUsuario = await prisma.dadosUsuario.findUnique({ where: { id } });
      if (dadosUsuario) {
        reply.send(dadosUsuario);
      } else {
        reply.code(404).send({ error: 'Dados do usuário não encontrados' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Atualizar um Dado do Usuário
  fastify.put('/DadosUsuario/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { tpDados, vlDados } = request.body as { tpDados: string, vlDados: string };
      const dadosUsuario = await prisma.dadosUsuario.update({
        where: { id },
        data: { tpDados, vlDados },
      });
      reply.send(dadosUsuario);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Deletar um Dado do Usuário
  fastify.delete('/DadosUsuario/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.dadosUsuario.delete({ where: { id } });
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