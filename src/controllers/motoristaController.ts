import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const apiKey = process.env.API_KEY;
import { endpoints } from "../utils/API";

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);

export default function motoristaRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Criar um motorista
  fastify.post('/Motorista', async (request, reply) => {
    try {
      console.log('Request body:', request.body); // Log para verificar o que está sendo enviado
      const { placa, idCircuit } = request.body as { placa: string, idCircuit: string };
      
      const Motorista = await prisma.motorista.create({
        data: { placa, idCircuit },
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
        const driverId = motorista.idCircuit; 
        console.log(driverId)
        const response = await fetch(`${endpoints.getCircuitBase}/${driverId}`, {
          method: "GET",
          headers: headers,
        });
  
        if (response.ok) {
          const driverData = await response.json();
          driversWithDetails.push({
            id: motorista.id,
            idCircuit: motorista.idCircuit,
            placa:  motorista.placa,
            name: driverData.name,
            email: driverData.email,
            active: driverData.active
          });
        } else {
          console.log(`Falha ao obter dados do driver ${driverId}`);
        }
      }
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
      const Motorista = await prisma.motorista.findUnique({ where: { id: Number(id) } });
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
        where: { id: Number(id) },
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
      await prisma.motorista.delete({ where: { id: Number(id) } });
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
