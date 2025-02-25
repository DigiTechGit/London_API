import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";

export default function recebedorRoutes(
  fastify: FastifyInstance,
  prisma: PrismaClient,
) {
  // Criar um novo recebedor
  fastify.post("/recebedor", async (request, reply) => {
    try {
      const {
        cnpjCPF,
        tipo,
        nome,
        endereco,
        numero,
        bairro,
        cep,
        cidade,
        uf,
        foneContato,
        complemento,
      } = request.body as any;
      const newRecebedor = await prisma.recebedor.create({
        data: {
          cnpjCPF,
          tipo,
          nome,
          endereco,
          numero,
          bairro,
          cep,
          cidade,
          uf,
          foneContato,
          complemento,
        },
      });

      reply.code(201).send(newRecebedor);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: "Erro ao criar o recebedor" });
    }
  });

  // Obter todos os recebedores
  fastify.get("/recebedor", async (request, reply) => {
    try {
      const recebedorList = await prisma.recebedor.findMany();
      reply.send(recebedorList);
    } catch (error) {
      reply.code(500).send({ error: "Erro ao obter os recebedores" });
    }
  });

  // Obter um recebedor por ID
  fastify.get("/recebedor/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const recebedor = await prisma.recebedor.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!recebedor) {
        reply.code(404).send({ error: "Recebedor não encontrado" });
      } else {
        reply.send(recebedor);
      }
    } catch (error) {
      reply.code(500).send({ error: "Erro ao obter o recebedor" });
    }
  });

  // Atualizar um recebedor por ID
  fastify.put("/recebedor/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        cnpjCPF,
        tipo,
        nome,
        endereco,
        numero,
        bairro,
        cep,
        cidade,
        uf,
        foneContato,
        complemento,
      } = request.body as any;
      const updatedRecebedor = await prisma.recebedor.update({
        where: {
          id: Number(id),
        },
        data: {
          cnpjCPF,
          tipo,
          nome,
          endereco,
          numero,
          bairro,
          cep,
          cidade,
          uf,
          foneContato,
          complemento,
        },
      });

      reply.send(updatedRecebedor);
    } catch (error) {
      reply.code(500).send({ error: "Erro ao atualizar o recebedor" });
    }
  });
}
