import { FastifyInstance } from "fastify";
import fetch from "node-fetch"; // ou 'axios'

export default async function JadLog(fastify: FastifyInstance) {

  fastify.get("/JadLog/produtos/produtos/buscar/:codigo", async (request, reply) => {
    const { codigo } = request.params as { codigo: string }; // Getting the code from URL
    
    try {
      // Fazendo a requisição para a API externa na porta 3001
      const response = await fetch(`http://localhost:3001/api/produtos/produtos/buscar/${codigo}`);
      const data = await response.json(); // Parse da resposta JSON

      if (response.ok) {
        // Se a requisição for bem-sucedida, retorna os dados da API externa
        return reply.send(data);
      } else {
        // Caso contrário, responde com erro
        return reply.status(400).send({ error: "Produto não encontrado" });
      }
    } catch (err) {
      console.error("Erro ao chamar a API externa:", err);
      return reply.status(500).send({ error: "Erro interno ao chamar a API externa" });
    }
  });

}
