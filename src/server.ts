import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import motoristaRoutes from './controllers/motoristaController';
import cteRoutes from './controllers/cteController';
import userRoutes from './controllers/LoginController';
import RouteRomaneioStockfy from './controllers/sswController';

// Inicializar o servidor Fastify
const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Use a porta definida no ambiente (Render) ou 3000 como fallback
const port =  3000;

// Habilitar CORS para tratar requisições OPTIONS
fastify.register(fastifyCors, {
  origin: true, // Ou configure o domínio de origem específico
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Habilita métodos HTTP
});

// Rotas
motoristaRoutes(fastify, prisma);
cteRoutes(fastify, prisma);
userRoutes(fastify, prisma);
RouteRomaneioStockfy(fastify, prisma);

// Rota padrão para verificar se o servidor está rodando
fastify.get('/', async (request, reply) => {
  reply.send({ status: 'Servidor rodando corretamente' });
});

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
