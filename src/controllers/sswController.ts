import { PrismaClient } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { endpoints } from '../utils/API';
const fetch = require('node-fetch');

export default function RouteRomaneioStockfy(fastify: FastifyInstance, prisma: PrismaClient) {
	fastify.options('*', (request, reply) => {
		reply.header('Access-Control-Allow-Origin', '*');
		reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		reply.send();
	});

	fastify.get('/RouteRomaneioStockfy', async (request: FastifyRequest, reply: FastifyReply) => {
	  try {
		const token = request.headers.authorization;
		const { siglaEnt } = request.query as { siglaEnt: string }; 
	
		if (!token || siglaEnt === undefined) {
		  reply.code(401).send({ error: 'Authorization token is required' });
		  return;
		}
		
		const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${siglaEnt}`;

		const response = await fetch(url, {
		  method: 'GET',
		  headers: {
			'Authorization': token,
			'Content-Type': 'application/json',
		  },
		});

		reply.code(200).send(await response.json()); 
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
  
