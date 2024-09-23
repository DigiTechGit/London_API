import { PrismaClient } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
const fetch = require('node-fetch');

const endpoints = {
  roteirizaRomaneioStockfy: 'https://ssw.inf.br/api/roteirizaRomaneioStockfy', // Substitua pela URL real
};


export default function RouteRomaneioStockfy(fastify: FastifyInstance, prisma: PrismaClient) {
	fastify.options('*', (request, reply) => {
		reply.header('Access-Control-Allow-Origin', '*');
		reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		reply.send();
	});
	
	fastify.get('/RouteRomaneioStockfy', async (request: FastifyRequest, reply: FastifyReply) => {
	  try {
		// Extrai o token do cabeçalho de autorização
		const token = request.headers.authorization;
		const { unidade } = request.query as { unidade: string }; // Alterado para query
	
		if (!token) {
		  reply.code(401).send({ error: 'Authorization token is required' });
		  return;
		}
	
		const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${unidade}`;
	
		// Chamada da API externa usando fetch
		const response = await fetch(url, {
		  method: 'GET',
		  headers: {
			Authorization: token,
			'Content-Type': 'application/json',
		  },
		});
	
		// Envia os dados de sucesso de volta para o cliente
		reply.code(200).send(await response.json()); // Corrigido para usar .json()
	
	  } catch (error: any) {
		if (error.response && error.response.data) {
		  // Tratamento de erro da API externa
		  reply.code(400).send({ error: error.response.data.mensagem || 'Failed to route romaneio' });
		} else {
		  // Tratamento de erro genérico
		  reply.code(500).send({ error: 'Request failed' });
		}
	  }
	});
  }
  
