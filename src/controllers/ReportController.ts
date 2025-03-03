import { FastifyInstance } from "fastify";
import { PrismaClient, Recebedor } from "@prisma/client";
import ExcelJS from "exceljs";
import { FastifyReply, FastifyRequest } from "fastify";
import { Socket } from "socket.io";

const socketIo = require("socket.io");

export default function EnderecoReportRouter(
  fastify: FastifyInstance,
  prisma: PrismaClient,
) {
  const io = socketIo(fastify.server, { cors: { origin: "*" } });

  fastify.post(
    "/report/exportar-enderecos",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { enderecos } = request.body as { enderecos: Array<Recebedor> };

        if (!enderecos || enderecos.length === 0) {
          return reply.status(400).send({ error: "Nenhum endereço fornecido" });
        }

        const base64 = convertToXlsxReturnBase64(enderecos);

        reply.header('Content-Type', 'application/json');

        return reply.send({ file: base64 });
      } catch (error) {
        console.error("Erro ao gerar Excel:", error);
        return reply
          .status(500)
          .send({ error: "Erro ao gerar o arquivo Excel" });
      }
    },
  );

  async function convertToXlsxReturnBase64(enderecos: Array<Recebedor>) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Endereços");

    worksheet.columns = [
      { header: "Nome", key: "nome", width: 30 },
      { header: "Endereço", key: "endereco", width: 30 },
      { header: "Número", key: "numero", width: 10 },
      { header: "Bairro", key: "bairro", width: 20 },
      { header: "CEP", key: "cep", width: 15 },
      { header: "Cidade", key: "cidade", width: 20 },
      { header: "UF", key: "uf", width: 5 },
      { header: "Complemento", key: "complemento", width: 20 },
    ];

    enderecos.forEach((recebedor: Recebedor) => {
      worksheet.addRow(recebedor);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // (OPCIONAL) Salvar um arquivo temporário para testar manualmente
    // fs.writeFileSync('enderecos.xlsx', Buffer.from(buffer));

    const base64 = Buffer.from(buffer).toString("base64");
    return base64;
  }
}
