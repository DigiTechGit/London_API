import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { endpoints } from "../utils/API";

const fetch = require('node-fetch');

export default function userRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  fastify.post('/User', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password, CNPJ } = request.body as {
        username: string;
        password: string;
        CNPJ: string;
      };

      // Chamada à API da SSW para autenticação
      const authResponse = await fetch(endpoints.generateToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'RED',
          username,
          password,
          cnpj_edi: CNPJ,
        }),
      });

      if (!authResponse.ok) {
        reply.code(401).send({ error: 'Login failed' });
        return;
      }

      
      const authData = await authResponse.json();

      reply.code(201).send({authData }); 
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Erro desconhecido' });
      }
    }
  });
}
