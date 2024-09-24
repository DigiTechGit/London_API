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
      const response = await fetch(`${endpoints.getCircuitPlans}`, {
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
      const response = await fetch(`${endpoints.getCircuitPlans}`, {
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
}

// export const distributeCircuitPlan = async (planId: string) => {
//   headers.delete('Content-Type');
//   try {
//     const response = await fetch(`${endpoints.getCircuitBase}/${planId}:distribute`, {
//       method: "POST",
//       headers: headers,
//     });

//     if (response.ok) {
//       return await response.json();
//     } else {
//       throw new Error("Failed to optimize plan");
//     }
//   } catch (error) {
//     throw new Error((error as Error).message);
//   }
// }

// export const operationProgress = async (operationId: string) => {
//   try {
//     const response = await fetch(`${endpoints.getCircuitBase}/${operationId}`, {
//       method: "GET",
//       headers: headers,
//     });

//     if (response.ok) {
//       return await response.json();
//     } else {
//       throw new Error("Failed to get operation");
//     }
//   } catch (error) {
//     throw new Error((error as Error).message);
//   }
// }

// export const getDrivers = async () => {
//   try {
//     const response = await fetch(`${endpoints.getCircuitDrivers}`, {
//       method: "GET",
//       headers: headers,
//     });

//     if (response.ok) {
//       return await response.json();
//     } else {
//       throw new Error("Failed to get drivers");
//     }
//   } catch (error) {
//     throw new Error((error as Error).message);
//   }
// }

// export const getDepots = async () => {
//   try {
//     const response = await fetch(`${endpoints.getCircuitDepots}`, {
//       method: "GET",
//       headers: headers,
//     });

//     if (response.ok) {
//       return await response.json();
//     } else {
//       throw new Error("Failed to get depots");
//     }
//   } catch (error) {
//     throw new Error((error as Error).message);
//   }
// }