import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import motoristaRoutes from './controllers/motoristaController';
import cteRoutes from './controllers/cteController';
import userRoutes from './controllers/LoginController';
import RouteRomaneioStockfy from './controllers/sswController';
import statusRoutes from './controllers/statusController';
import circuitController from './controllers/circuitController';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

fastify.addHook('onRequest', (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*'); 
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
  done();
});

const port =  3000;

fastify.register(fastifyFormbody);

statusRoutes(fastify);
motoristaRoutes(fastify, prisma);
cteRoutes(fastify, prisma);
userRoutes(fastify, prisma);
RouteRomaneioStockfy(fastify, prisma);
circuitController(fastify);

fastify.get('/', async (request, reply) => {
  reply.send({ status: 'Servidor rodando corretamente' });
});

const start = async () => {
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor rodando na porta ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
function fastifyFormbody(instance: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProvider>, opts: FastifyPluginOptions, done: (err?: Error | undefined) => void): void {
  throw new Error('Function not implemented.');
}

