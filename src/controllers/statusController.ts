// import { PrismaClient } from '@prisma/client';
// import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

// const prisma = new PrismaClient();

// export default async function statusController(fastify: FastifyInstance) {
// 	// Create
// 	fastify.post('/routes', async (request: FastifyRequest, reply: FastifyReply) => {
// 		const { name, path } = request.body as { name: string; path: string };
// 		const newRoute = await prisma.route.create({
// 			data: {
// 				name,
// 				path,
// 			},
// 		});
// 		reply.send(newRoute);
// 	});

// 	// Read all
// 	fastify.get('/routes', async (request: FastifyRequest, reply: FastifyReply) => {
// 		const routes = await prisma.route.findMany();
// 		reply.send(routes);
// 	});

// 	// Read one
// 	fastify.get('/routes/:id', async (request: FastifyRequest, reply: FastifyReply) => {
// 		const { id } = request.params as { id: string };
// 		const route = await prisma.route.findUnique({
// 			where: { id: Number(id) },
// 		});
// 		reply.send(route);
// 	});

// 	// Update
// 	fastify.put('/routes/:id', async (request: FastifyRequest, reply: FastifyReply) => {
// 		const { id } = request.params as { id: string };
// 		const { name, path } = request.body as { name: string; path: string };
// 		const updatedRoute = await prisma.route.update({
// 			where: { id: Number(id) },
// 			data: {
// 				name,
// 				path,
// 			},
// 		});
// 		reply.send(updatedRoute);
// 	});

// 	// Delete
// 	fastify.delete('/routes/:id', async (request: FastifyRequest, reply: FastifyReply) => {
// 		const { id } = request.params as { id: string };
// 		await prisma.route.delete({
// 			where: { id: Number(id) },
// 		});
// 		reply.send({ message: 'Route deleted successfully' });
// 	});
// }