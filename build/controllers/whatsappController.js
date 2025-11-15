"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controllers/whatsappController.ts
var whatsappController_exports = {};
__export(whatsappController_exports, {
  default: () => whatsappRoutes
});
module.exports = __toCommonJS(whatsappController_exports);

// src/utils/report.ts
var import_exceljs = __toESM(require("exceljs"));
async function convertToXlsxReturnBase64(enderecos) {
  const workbook = new import_exceljs.default.Workbook();
  const worksheet = workbook.addWorksheet("Endere\xE7os");
  worksheet.columns = [
    { header: "Nome", key: "nome", width: 30 },
    { header: "Endere\xE7o", key: "endereco", width: 30 },
    { header: "N\xFAmero", key: "numero", width: 10 },
    { header: "Bairro", key: "bairro", width: 20 },
    { header: "CEP", key: "cep", width: 15 },
    { header: "Cidade", key: "cidade", width: 20 },
    { header: "UF", key: "uf", width: 5 },
    { header: "Complemento", key: "complemento", width: 20 }
  ];
  enderecos.forEach((recebedor) => {
    worksheet.addRow(recebedor);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return base64;
}

// src/controllers/whatsappController.ts
var socketIo = require("socket.io");
var latestQrCode = null;
function whatsappRoutes(fastify, prisma) {
  const io = socketIo(fastify.server, { cors: {
    origin: ["https://envioprime.com.br", "*"]
  } });
  let isConnected = true;
  io.on("connection", (socket) => {
    console.log("Novo cliente conectado.");
    if (latestQrCode) {
      socket.emit("qr", latestQrCode);
      console.log("QR Code reenviado para um novo cliente.");
    }
    socket.on("qr", (qr) => {
      console.log("\x1B[33m%s\x1B[0m", "QR Code recebido do bot.");
      latestQrCode = qr;
      io.emit("qr", qr);
    });
    socket.on("ready", () => {
      console.log("WhatsApp conectado.");
      latestQrCode = null;
      isConnected = true;
      io.emit("ready");
    });
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
    return { success: true, message: "Solicita\xE7\xE3o de desconex\xE3o enviada." };
  });
  fastify.get("/whatsapp/qrcode", async (request, reply) => {
    if (latestQrCode) {
      return { success: true, qrCode: latestQrCode };
    } else {
      return { success: false, message: "QR Code n\xE3o dispon\xEDvel." };
    }
  });
  fastify.get("/whatsapp/test-message", async (request, reply) => {
    if (!isConnected) {
      return reply.status(400).send({ error: "Bot not connected" });
    }
    io.emit("sendTestMessage", {
      phone: "41997601739",
      // Number without +55
      message: "Teste de whatsapp!"
    });
    return { success: true, message: "Test message sent" };
  });
  fastify.post("/whatsapp/enviar-base64/:id", async (request, reply) => {
    const { id } = request.params;
    const { base64File, fileName, caption } = request.body;
    const motorista = await prisma.motorista_ssw.findFirst({
      where: {
        id: Number(id)
      }
    });
    if (!motorista) {
      return reply.status(404).send({ error: "Motorista n\xE3o encontrado" });
    }
    if (!motorista.telefone) {
      return reply.status(400).send({ error: "Telefone do motorista n\xE3o cadastrado" });
    }
    if (!isConnected) {
      return reply.status(400).send({ error: "Bot n\xE3o conectado" });
    }
    io.emit("sendFile", {
      phone: motorista.telefone,
      nome: motorista.nome,
      base64File,
      fileName: fileName || `arquivo_${motorista.nome}.xlsx`,
      caption: caption || "Segue o arquivo em anexo."
    });
    return { connected: isConnected, receivedId: id };
  });
  fastify.post("/whatsapp/enviar/:id", async (request, reply) => {
    const { id } = request.params;
    const { enderecos } = request.body;
    console.log(enderecos);
    const base64 = await convertToXlsxReturnBase64(enderecos);
    const motorista = await prisma.motorista_ssw.findFirst({
      where: {
        id: Number(id)
      }
    });
    if (!motorista) {
      return reply.status(404).send({ error: "Motorista n\xE3o encontrado" });
    }
    if (!motorista.telefone) {
      return reply.status(400).send({ error: "Telefone do motorista n\xE3o cadastrado" });
    }
    if (!isConnected) {
      return reply.status(400).send({ error: "Bot n\xE3o conectado" });
    }
    const nmArquivo = `enderecos_${motorista.nome}.xlsx`;
    io.emit("sendFile", {
      phone: motorista.telefone,
      nome: motorista.nome,
      base64File: base64,
      fileName: nmArquivo,
      caption: "Segue em anexo a planilha com os endere\xE7os dos destinat\xE1rios."
    });
    return { connected: isConnected, receivedId: id };
  });
  fastify.post("/whatsapp/enviar/:id/:empresaID", async (request, reply) => {
    const { id, empresaID } = request.params;
    const { enderecos } = request.body;
    console.log(enderecos);
    const empresa = await prisma.empresa.findUnique({
      where: {
        id: Number(empresaID)
      }
    });
    const base64 = await convertToXlsxReturnBase64(enderecos);
    const motorista = await prisma.motorista_ssw.findFirst({
      where: {
        id: Number(id)
      }
    });
    if (!motorista) {
      return reply.status(404).send({ error: "Motorista n\xE3o encontrado" });
    }
    if (!motorista.telefone) {
      return reply.status(400).send({ error: "Telefone do motorista n\xE3o cadastrado" });
    }
    if (!isConnected) {
      return reply.status(400).send({ error: "Bot n\xE3o conectado" });
    }
    const nmArquivo = `enderecos_${motorista.nome}.xlsx`;
    io.emit("sendFile", {
      phone: motorista.telefone,
      nome: motorista.nome,
      base64File: base64,
      fileName: nmArquivo,
      caption: "Segue em anexo a planilha com os endere\xE7os dos destinat\xE1rios."
    });
    return { connected: isConnected, receivedId: id };
  });
  fastify.get("/whatsapp/status", async (request, reply) => {
    return { connected: isConnected };
  });
}
