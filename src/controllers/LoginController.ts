import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fetch from 'node-fetch';

// Defina a URL do seu endpoint de autenticação da SSW
const AUTH_ENDPOINT = 'https://ssw.inf.br/api/generateToken';

export default function userRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  fastify.post('/User', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password, CNPJ } = request.body as {
        username: string;
        password: string;
        CNPJ: string;
      };

      // Chamada à API da SSW para autenticação
      const authResponse = await fetch(AUTH_ENDPOINT, {
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
