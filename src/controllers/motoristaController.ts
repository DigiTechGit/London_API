import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export default function motoristaRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Criar um motorista
  fastify.post('/Motorista', async (request, reply) => {
    try {
      const { placa, id } = request.body as { placa: string, id: string };
      const Motorista = await prisma.motorista.create({
        data: { placa, id },
      });
      reply.code(201).send(Motorista);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Listar todos os motoristas
  fastify.get('/Motoristas', async (request, reply) => {
    try {
      const motoristas = await prisma.motorista.findMany();
      const driversWithDetails = [];
  
      for (const motorista of motoristas) {
        const driverId = motorista.id; 
  
        const response = await fetch(`https://api.getcircuit.com/public/v0.2b/drivers/${driverId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.CIRCUIT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (response.ok) {
          const driverData = await response.json();
          driversWithDetails.push({
            motorista,
            circuitData: driverData
          });
        } else {
          console.log(`Falha ao obter dados do driver ${driverId}`);
        }
      }
  
      // Enviar os motoristas junto com os detalhes obtidos da API do Circuit
      reply.send(driversWithDetails);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Obter um único motorista
  fastify.get('/Motorista/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const Motorista = await prisma.motorista.findUnique({ where: { id } });
      if (Motorista) {
        reply.send(Motorista);
      } else {
        reply.code(404).send({ error: 'Motorista não encontrado' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Atualizar um motorista
  fastify.put('/Motorista/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { placa } = request.body as { placa: string };
      const Motorista = await prisma.motorista.update({
        where: { id },
        data: { placa },
      });
      reply.send(Motorista);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });

  // Deletar um motorista
  fastify.delete('/Motorista/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.motorista.delete({ where: { id } });
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
