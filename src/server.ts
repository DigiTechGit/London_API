import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import motoristaRoutes from './controllers/motoristaController';
import cteRoutes from './controllers/cteController';
import userRoutes from './controllers/LoginController';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Rotas
motoristaRoutes(fastify, prisma);
cteRoutes(fastify, prisma);

// Iniciar o servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Servidor rodando na porta 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
