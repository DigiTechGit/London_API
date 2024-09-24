// import { PrismaClient } from '@prisma/client';
// import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

// const prisma = new PrismaClient();

// export default async function statusRoutes(fastify: FastifyInstance) {
//   // Criar um novo status
//   fastify.post('/status', async (request: FastifyRequest, reply: FastifyReply) => {
//     try {
//       const { status, descricao } = request.body as { status: string, descricao?: string };

//       const newStatus = await prisma.statusEnvio.create({
//         data: {
//           status,
//           descricao,
//         },
//       });

//       reply.code(201).send(newStatus);
//     } catch (error) {
//       reply.code(500).send({ error: 'Erro ao criar o status' });
//     }
//   });

//   // Obter todos os status
//   fastify.get('/status', async (request: FastifyRequest, reply: FastifyReply) => {
//     try {
//       const statusList = await prisma.statusEnvio.findMany();
//       reply.send(statusList);
//     } catch (error) {
//       reply.code(500).send({ error: 'Erro ao obter os status' });
//     }
//   });

//   // Obter um status por ID
//   fastify.get('/status/:id', async (request: FastifyRequest, reply: FastifyReply) => {
//     try {
//       const { id } = request.params as { id: string };
//       const status = await prisma.statusEnvio.findUnique({
//         where: {
//           id: Number(id),
//         },
//       });

//       if (!status) {
//         reply.code(404).send({ error: 'Status não encontrado' });
//       } else {
//         reply.send(status);
//       }
//     } catch (error) {
//       reply.code(500).send({ error: 'Erro ao obter o status' });
//     }
//   });

//   // Atualizar um status por ID
//   fastify.put('/status/:id', async (request: FastifyRequest, reply: FastifyReply) => {
//     try {
//       const { id } = request.params as { id: string };
//       const { status, descricao } = request.body as { status: string, descricao?: string };

//       const updatedStatus = await prisma.statusEnvio.update({
//         where: {
//           id: Number(id),
//         },
//         data: {
//           status,
//           descricao,
//         },
//       });

//       reply.send(updatedStatus);
//     } catch (error) {
//       reply.code(500).send({ error: 'Erro ao atualizar o status' });
//     }
//   });

//   // Deletar um status por ID
//   fastify.delete('/status/:id', async (request: FastifyRequest, reply: FastifyReply) => {
//     try {
//       const { id } = request.params as { id: string };

//       await prisma.statusEnvio.delete({
//         where: {
//           id: Number(id),
//         },
//       });

//       reply.code(204).send();
//     } catch (error) {
//       reply.code(500).send({ error: 'Erro ao deletar o status' });
//     }
//   });
// }
