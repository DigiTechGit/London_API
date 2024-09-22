import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { CTeRequestBody } from '../interfaces/CTeRequestBody';

export default function cteRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  fastify.post<{ Body: CTeRequestBody }>('/ctes', async (request, reply) => {
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
      const motorista = await prisma.motorista_ssw.create({
        data: {
          nome: nomeMotorista,
          cpf: cpfMotorista
        }
      });

      // Criar ou encontrar o remetente
      const remetenteEntity = await prisma.remetente.upsert({
        where: { cnpjCPF: remetente.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: remetente.cnpjCPF,
          tipo: remetente.tipo,
          nome: remetente.nome
        }
      });

      // Criar ou encontrar o destinatário
      const destinatarioEntity = await prisma.destinatario.upsert({
        where: { cnpjCPF: destinatario.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: destinatario.cnpjCPF,
          tipo: destinatario.tipo,
          nome: destinatario.nome
        }
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
          foneContato: recebedor.foneContato
        }
      });

      // Criar o CTe com o status
      const cte = await prisma.ctes.create({
        data: {
          chaveCTe,
          valorFrete,
          placaVeiculo,
          previsaoEntrega: new Date(previsaoEntrega),
          motoristaId: motorista.id,
          remetenteId: remetenteEntity.id,
          destinatarioId: destinatarioEntity.id,
          recebedorId: recebedorEntity.id,
          statusId: 1 
        }
      });

      reply.status(201).send(cte);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create CTe' });
    }
  });
}
