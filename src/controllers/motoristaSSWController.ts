import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';

const apiKey = process.env.API_KEY;

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);

export default function motoristaSSWRoutes(fastify: FastifyInstance, prisma: PrismaClient) {

  fastify.post('/MotoristasSSW', async (request, reply) => {
    try {
      console.log('Request body:', request.body); // Log para verificar o que está sendo enviado
      const { cpf, nome, telefone, whatsApp, empresaIds } = request.body as { cpf: string, nome: string, telefone: string, whatsApp: boolean, empresaIds: number[] };

      const motorista = await prisma.motorista_ssw.create({
        data: { cpf, nome, telefone, whatsApp },
      });

      // Criar as relações com as empresas
      for (const empresaId of empresaIds) {
        await prisma.motoristaEmpresa.create({
          data: { motoristaId: motorista.id, empresaId },
        });
      }

      reply.send(motorista);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });
  // Listar todos os motoristaSSWs
  fastify.get('/MotoristasSSW', async (request, reply) => {
    try {
      const motoristas = await prisma.motorista_ssw.findMany();

      const motoristasComEmpresa = await Promise.all(
        motoristas.map(async (motorista) => {
          const empresaRelacao = await prisma.motoristaEmpresa.findMany({
            where: { motoristaId: motorista.id },
          });
      
          return {
            ...motorista,
            empresa: empresaRelacao || null,
          };
        })
      );
      
      reply.send(motoristasComEmpresa);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  fastify.get('/Motoristas/delete/:cpf', async (request, reply) => {
    try {
      const { cpf } = request.params as { cpf: string };

      const motorista = await prisma.motorista_ssw.findUnique({
        where: { cpf },
        select: { id: true },
      });
  
      if (!motorista) {
        return reply.code(404).send({ error: 'Motorista não encontrado' });
      }
  
      await prisma.$transaction([
        prisma.motoristaEmpresa.deleteMany({
          where: { motoristaId: motorista.id },
        }),
        prisma.motorista_ssw.delete({
          where: { id: motorista.id },
        }),
      ]);
  
      reply.send({ message: 'Motorista excluído com sucesso' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Obter um único motoristaSSW
  fastify.get('/MotoristasSSW/:id', async (request, reply) => {
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
  fastify.put('/MotoristasSSW/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { telefone, whatsApp, empresaIds } = request.body as { telefone: string, whatsApp: boolean, empresaIds: number[] };
      const MotoristaSSW = await prisma.motorista_ssw.update({
        where: { id: Number(id) },
        data: { telefone , whatsApp},
      });
      // Atualizar as empresas relacionadas
      await prisma.motoristaEmpresa.deleteMany({
        where: { motoristaId: Number(id) },
      });
      for (const empresaId of empresaIds) {
        await prisma.motoristaEmpresa.create({
          data: { motoristaId: Number(id), empresaId },
        });
      }
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
