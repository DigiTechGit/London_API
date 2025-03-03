// import { FastifyInstance } from "fastify";
// import { Socket } from "socket.io";

// const socketIo = require("socket.io");

// let latestQrCode: string | null = null; // Armazena o QR Code mais recente

// export default function whatsappRoutes(fastify: FastifyInstance) {
//   const io = socketIo(fastify.server, { cors: { origin: "*" } });

//   io.on("connection", (socket: Socket) => {
//     console.log("Novo cliente conectado.");

//     // Envia o QR Code salvo para novos clientes conectados
//     if (latestQrCode) {
//       socket.emit("qr", latestQrCode);
//       console.log("QR Code reenviado para um novo cliente.");
//     }

//     // Recebe QR Code do bot e armazena
//     socket.on("qr", (qr) => {
//       console.log("QR Code recebido do bot.");
//       latestQrCode = qr;
//       io.emit("qr", qr); // Reenvia para todos os clientes conectados
//     });

//     // Se o bot conectar, reseta o QR Code salvo
//     socket.on("ready", () => {
//       console.log("WhatsApp conectado.");
//       latestQrCode = null;
//       io.emit("ready"); // Informa ao front-end que o bot está pronto
//     });
//   });

//   // Endpoint para o front-end obter o QR Code
//   fastify.get("/whatsapp/qrcode", async (request, reply) => {
//     if (latestQrCode) {
//       return { success: true, qrCode: latestQrCode };
//     } else {
//       return { success: false, message: "QR Code não disponível." };
//     }
//   });
// }
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Socket } from "socket.io";
import { PrismaClient, Recebedor } from "@prisma/client";
import { convertToXlsxReturnBase64 } from "../utils/report";
const socketIo = require("socket.io");

let latestQrCode: string | null = null; // Armazena o QR Code mais recente

export default function whatsappRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  const io = socketIo(fastify.server, { cors: { origin: "*" } });
  let isConnected = false;

  io.on("connection", (socket: Socket) => {
    console.log("Novo cliente conectado.");

    // Envia o QR Code salvo para novos clientes conectados
    if (latestQrCode) {
      socket.emit("qr", latestQrCode);
      console.log("QR Code reenviado para um novo cliente.");
    }

    // Recebe QR Code do bot e armazena
    socket.on("qr", (qr: string) => {
      console.log("QR Code recebido do bot.");
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

  fastify.post("/whatsapp/enviar/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }; 
    const { enderecos } = request.body as { enderecos: Recebedor[] };

    const base64 = await convertToXlsxReturnBase64(enderecos);

    io.emit("sendFile", { 
        phone: '41997601739', 
        nome: 'cesar', 
        base64File: base64, 
        fileName: 'fileName', 
        caption: 'caption'
    });

    return { connected: isConnected, receivedId: id };
  });

  fastify.get("/whatsapp/status", async (request, reply) => {
    return { connected: isConnected };
  });

 
}
