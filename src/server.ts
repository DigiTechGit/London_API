import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import motoristaRoutes from './controllers/motoristaController';
import cteRoutes from './controllers/cteController';
import userRoutes from './controllers/LoginController';
import RouteRomaneioStockfy from './controllers/sswController';
import statusRoutes from './controllers/statusController';
import circuitController from './controllers/circuitController';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { buscarEInserirCtesRecorrente } from './services/cteService';
import unidadeRoutes from './controllers/UnidadeController';
import dadosUsuariosRoutes from './controllers/DadosUsuarioController';
import fs from 'fs';

let jobRunning = false; 

dotenv.config();

const fastify = Fastify({ 
  logger: true,
  //https: {
    //key: fs.readFileSync("/etc/letsencrypt/live/api.envioprime.com.br/privkey.pem"),
    //cert: fs.readFileSync("/etc/letsencrypt/live/api.envioprime.com.br/cert.pem"),
   // ca: fs.readFileSync("/etc/letsencrypt/live/api.envioprime.com.br/chain.pem"),
  //},
});
const prisma = new PrismaClient();

fastify.addHook('onRequest', (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*'); 
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
  done();
});

const port =  3000;

statusRoutes(fastify);
motoristaRoutes(fastify, prisma);
cteRoutes(fastify, prisma);
userRoutes(fastify, prisma);
unidadeRoutes(fastify, prisma)
dadosUsuariosRoutes(fastify, prisma)
RouteRomaneioStockfy(fastify, prisma);
circuitController(fastify);

fastify.get('/', async (request, reply) => {
  reply.send({ status: new Date() + 'Servidor rodando corretamente versão 1.1' });
});

cron.schedule('*/1 4-23 * * *', async () => {
  if (jobRunning) {
    console.log(new Date() + 'O job já está em execução. Ignorando nova execução.');
    return;
  }

  try {
    const unidades = await prisma.unidade.findMany({
      where: {
        idAtivo: true, // Somente as unidades ativas
      },
    });
    jobRunning = true; 
    console.log('Iniciando job de busca de CTe...');

  const promessas = unidades.map(unidade => {
    console.log(`Iniciando processamento da unidade: ${unidade.Unidade}`);
    return buscarEInserirCtesRecorrente(unidade.Unidade);
  });

  // Executar todas as promessas em paralelo
  await Promise.all(promessas);
  console.log('Job de busca de CTe concluído.');

  } catch (error) {
    console.error('Erro ao executar o job:', error);
  } finally {
    jobRunning = false; 
    console.log('Job finalizado.');
  }
});

const start = async () => {
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log('\x1b[33m%s\x1b[0m', 'Running in Production Mode');
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
