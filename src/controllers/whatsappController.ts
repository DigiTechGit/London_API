import { PrismaClient, Recebedor } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Socket } from "socket.io";
import { convertToXlsxReturnBase64 } from "../utils/report";
const socketIo = require("socket.io");

let latestQrCode: string | null = null; // Armazena o QR Code mais recente

export default function whatsappRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  const io = socketIo(fastify.server, { cors: {
    origin: ["https://envioprime.com.br", '*']
  } });
  let isConnected = true;

  io.on("connection", (socket: Socket) => {
    console.log("Novo cliente conectado.");

    // Envia o QR Code salvo para novos clientes conectados
    if (latestQrCode) {
      socket.emit("qr", latestQrCode);
      console.log("QR Code reenviado para um novo cliente.");
    }

    // Recebe QR Code do bot e armazena
    socket.on("qr", (qr: string) => {
console.log("\x1b[33m%s\x1b[0m", "QR Code recebido do bot.");
      latestQrCode = qr;
      io.emit("qr", qr); // Reenvia para todos os clientes conectados
    });

    // Se o bot conectar, reseta o QR Code salvo
    socket.on("ready", () => {
      console.log("WhatsApp conectado.");
      latestQrCode = null;
      isConnected = true;
      io.emit("ready"); // Informa ao front-end que o bot está pronto
    });

    // Lidar com desconexão do cliente
    socket.on("disconnect", () => {
      console.log("Cliente desconectado.");
      isConnected = false;
    });

    socket.on("status", (state) => {
            console.log("state.", state);

      isConnected = state === "CONNECTED";
    });
  });

  fastify.get("/whatsapp/desconectar", async (request, reply) => {
    io.emit("disconnectBot");
    return { success: true, message: "Solicitação de desconexão enviada." };
  });

  // Endpoint para o fr ont-end obter o QR Code
  fastify.get("/whatsapp/qrcode", async (request, reply) => {
    if (latestQrCode) {
      return { success: true, qrCode: latestQrCode };
    } else {
      return { success: false, message: "QR Code não disponível." };
    }
  });

fastify.get("/whatsapp/test-message", async (request, reply) => {
  if (!isConnected) {
    return reply.status(400).send({ error: "Bot not connected" });
  }

  io.emit("sendTestMessage", {
    phone: "41997601739", // Number without +55
    message: "Teste de whatsapp!"
  });

  return { success: true, message: "Test message sent" };
});
  fastify.post("/whatsapp/enviar-base64/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { base64File, fileName, caption } = request.body as {
      base64File: string;
      fileName?: string;
      caption?: string;
    };
  
    const motorista = await prisma.motorista_ssw.findFirst({
      where: {
        id: Number(id),
      },
    });
  
    if (!motorista) {
      return reply.status(404).send({ error: "Motorista não encontrado" });
    }
  
    if (!motorista.telefone) {
      return reply.status(400).send({ error: "Telefone do motorista não cadastrado" });
    }
  
    if (!isConnected) {
      return reply.status(400).send({ error: "Bot não conectado" });
    }
  
    io.emit("sendFile", {
      phone: motorista.telefone,
      nome: motorista.nome,
      base64File,
      fileName: fileName || `arquivo_${motorista.nome}.xlsx`,
      caption: caption || "Segue o arquivo em anexo.",
    });
  
    return { connected: isConnected, receivedId: id };
  });
  
  fastify.post("/whatsapp/enviar/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { enderecos } = request.body as { enderecos: Recebedor[] };
    console.log(enderecos)

    const base64 = await convertToXlsxReturnBase64(enderecos);

    const motorista = await prisma.motorista_ssw.findFirst({
      where: {
        id: Number(id),
      },
    });
    
    if (!motorista) {
      return reply.status(404).send({ error: "Motorista não encontrado" });
    }

    if(!motorista.telefone) {
      return reply.status(400).send({ error: "Telefone do motorista não cadastrado" });
    }

    if(!isConnected) {
      return reply.status(400).send({ error: "Bot não conectado" });
    }
    
    const nmArquivo = `enderecos_${motorista.nome}.xlsx`;
    
    io.emit("sendFile", { 
      phone: motorista.telefone, 
      nome: motorista.nome, 
      base64File: base64, 
      fileName: nmArquivo, 
      caption: "Segue em anexo a planilha com os endereços dos destinatários."
    });    

    return { connected: isConnected, receivedId: id };
  });



  fastify.post("/whatsapp/enviar/:id/:empresaID", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, empresaID } = request.params as { id: string; empresaID: string };
    const { enderecos } = request.body as { enderecos: Recebedor[] };
    console.log(enderecos)

    const empresa = await prisma.empresa.findUnique({
      where: {
        id: Number(empresaID),
      },
    })

//     enderecos.map(async (endereco)=>{
//       await prisma.produtosEnviados.create({
//         data:{
// idEntrega: endereco.id,
// motorista: id,
// status: "PENDENTE",
// empresa: empresa

//         }
//       })
//     })

    const base64 = await convertToXlsxReturnBase64(enderecos);

    const motorista = await prisma.motorista_ssw.findFirst({
      where: {
        id: Number(id),
      },
    });
    
    if (!motorista) {
      return reply.status(404).send({ error: "Motorista não encontrado" });
    }

    if(!motorista.telefone) {
      return reply.status(400).send({ error: "Telefone do motorista não cadastrado" });
    }

    if(!isConnected) {
      return reply.status(400).send({ error: "Bot não conectado" });
    }
    
    const nmArquivo = `enderecos_${motorista.nome}.xlsx`;
    
    io.emit("sendFile", { 
      phone: motorista.telefone, 
      nome: motorista.nome, 
      base64File: base64, 
      fileName: nmArquivo, 
      caption: "Segue em anexo a planilha com os endereços dos destinatários."
    });    

    return { connected: isConnected, receivedId: id };
  });

  fastify.get("/whatsapp/status", async (request, reply) => {
    return { connected: isConnected };
  });
}