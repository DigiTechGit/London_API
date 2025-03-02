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
import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
const socketIo = require("socket.io");

let latestQrCode: string | null = null; // Armazena o QR Code mais recente

export default function whatsappRoutes(fastify: FastifyInstance) {
  const io = socketIo(fastify.server, { cors: { origin: "*" } });

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
      io.emit("ready"); // Informa ao front-end que o bot está pronto
    });

    // Lidar com desconexão do cliente
    socket.on("disconnect", () => {
      console.log("Cliente desconectado.");
    });
  });

  // Endpoint para o front-end obter o QR Code
  fastify.get("/whatsapp/qrcode", async (request, reply) => {
    if (latestQrCode) {
      return { success: true, qrCode: latestQrCode };
    } else {
      return { success: false, message: "QR Code não disponível." };
    }
  });
}