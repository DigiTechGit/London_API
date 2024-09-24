import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { endpoints } from "../utils/API";

const apiKey = 'AtLbZqdywTLWAz5zyATR';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);

export default function circuitController(fastify: FastifyInstance) {

  fastify.get('/getCircuitPlans', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/plans`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const circuitPlans = await response.json();

        // Salvar no Prisma
        // await prisma.circuitPlan.createMany({
        //   data: circuitPlans, // Assumindo que os dados estejam no formato correto
        //   skipDuplicates: true, // Evitar duplicatas
        // });

        reply.code(200).send(circuitPlans);
      } else {
        reply.code(400).send({ error: "Failed to get Circuit plans" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.post('/postCircuitPlans', async (request: FastifyRequest, reply: FastifyReply) => {
    const model = request.body;
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/plans`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(model),
      });
  
      if (response.ok) {
        const createdPlan = await response.json();
  
        reply.code(200).send(createdPlan);
      } else {
        reply.code(400).send({ error: "Failed to create a new plan" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/getDrivers', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/drivers`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const drivers = await response.json();

        reply.code(200).send(drivers);
      } else {
        reply.code(400).send({ error: "Failed to get drivers" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.put('/importStops', async (request: FastifyRequest, reply: FastifyReply) => {
    const model = request.body;
    const { planId } = request.query as { planId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}/stops:import`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(model),
      });
  
      if (response.ok) {
        const stops = await response.json();
  
        reply.code(200).send(true);
      } else {
        reply.code(400).send({ error: "Failed to import stops" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.put('/optimizePlan', async (request: FastifyRequest, reply: FastifyReply) => {
    const { planId } = request.query as { planId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}:optimize`, {
        method: "POST",
        headers: headers,
      });
  
      if (response.ok) {
        const operation = await response.json();
  
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to optimize plan" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.put('/distributePlan', async (request: FastifyRequest, reply: FastifyReply) => {
    const { planId } = request.query as { planId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}:distribute`, {
        method: "POST",
        headers: headers,
      });
  
      if (response.ok) {
        const operation = await response.json();
  
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to distribute plan" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/operationProgress', async (request: FastifyRequest, reply: FastifyReply) => {
    const { operationId } = request.query as { operationId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${operationId}`, {
        method: "GET",
        headers: headers,
      });
  
      if (response.ok) {
        const operation = await response.json();
  
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to get operation" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/operationProgress', async (request: FastifyRequest, reply: FastifyReply) => {
    const { operationId } = request.query as { operationId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${operationId}`, {
        method: "GET",
        headers: headers,
      });
  
      if (response.ok) {
        const operation = await response.json();
  
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to get operation" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/getDepots', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/depots`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const depots = await response.json();

        reply.code(200).send(depots);
      } else {
        reply.code(400).send({ error: "Failed to get depots" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });
}