import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import motoristaRoutes from './controllers/motoristaController';
import cteRoutes from './controllers/cteController';
import userRoutes from './controllers/LoginController';
import RouteRomaneioStockfy from './controllers/sswController';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Use a porta definida no ambiente (Render) ou 3000 como fallback
const port = 3000;

// Rotas
motoristaRoutes(fastify, prisma);
cteRoutes(fastify, prisma);
userRoutes(fastify, prisma);
RouteRomaneioStockfy(fastify, prisma);

// Iniciar o servidor
const start = async () => {
  try {
    // Certifique-se de que o servidor escute em '0.0.0.0'
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor rodando na porta ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
