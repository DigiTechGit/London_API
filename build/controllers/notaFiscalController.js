"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controllers/notaFiscalController.ts
var notaFiscalController_exports = {};
__export(notaFiscalController_exports, {
  default: () => notaFiscalController
});
module.exports = __toCommonJS(notaFiscalController_exports);

// src/utils/cep.ts
var buscarCep = async (cep) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error("Erro ao buscar CEP");
    }
    const data = await response.json();
    if (data.erro) {
      throw new Error("CEP n\xE3o encontrado");
    }
    return data.logradouro;
  } catch (error) {
    console.error(error);
    return "";
  }
};

// src/controllers/notaFiscalController.ts
var headers = new Headers();
headers.append("Content-Type", "application/json");
var PDFDocument = require("pdfkit");
var bwipjs = require("bwip-js");
var QRCode = require("qrcode");
function notaFiscalController(fastify, prisma) {
  fastify.get(
    "/notaFiscal/listarPorPlaca",
    async (request, reply) => {
      try {
        const { placa } = request.query;
        const ctesMotorista = await prisma.ctes.findMany({
          where: {
            placaVeiculo: placa,
            listarCTE: true,
            codUltOco: 85
          },
          include: {
            motorista: true,
            NotaFiscal: true,
            remetente: true,
            destinatario: true,
            recebedor: true
          }
        });
        let motorista = "";
        const CNPJ_CEP = await prisma.cnpjTb.findMany({
          where: { idAtivo: true }
        });
        const nFEs = await Promise.all(
          ctesMotorista.map(async (cte) => {
            if (motorista == "") {
              motorista = {
                ...cte.motorista,
                placa
              };
            }
            if (CNPJ_CEP.some((item) => item.CNPJ === cte.remetente.cnpjCPF)) {
              cte.recebedor.endereco = await buscarCep(cte.recebedor.cep);
            }
            const objNFe = cte.NotaFiscal.map((nfe) => ({
              chaveCte: cte.chaveCTe,
              chaveNFe: nfe.chaveNFe,
              nrNfre: nfe.nroNF,
              qtdeVolumes: nfe.qtdeVolumes,
              remetente: cte.remetente.nome,
              prevEntrega: cte.previsaoEntrega,
              destinatario: cte.destinatario.nome,
              bairro: cte.recebedor.bairro,
              cep: cte.recebedor.cep,
              endereco: cte.recebedor.endereco,
              numero: cte.recebedor.numero,
              cidade: cte.recebedor.cidade,
              telefone: cte.recebedor.foneContato,
              celular: cte.recebedor.celularContato,
              uf: cte.recebedor.uf,
              complemento: cte.recebedor.complemento,
              ctesPorParada: ctesMotorista.filter(
                (ctePorParada) => ctePorParada.cte === cte.id
              )
            }));
            return objNFe;
          })
        );
        const nFEsOrdenadas = nFEs.sort((a, b) => {
          if (a[0].cep < b[0].cep) return -1;
          if (a[0].cep > b[0].cep) return 1;
          return 0;
        });
        const res = {
          motorista,
          Nfes: nFEsOrdenadas
        };
        const base64PDF = await generatePDF(res);
        reply.code(200).send({ pdfBase64: base64PDF });
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    }
  );
  const generatePDF = async (data) => {
    const doc = new PDFDocument({ margins: { top: 20, bottom: 0, left: 30, right: 30 } });
    let buffers = [];
    const motorista = data.motorista;
    const Nfes = data.Nfes;
    let currentPage = 1;
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      console.log("PDF gerado");
    });
    doc.fontSize(7).text(`PLACA: ${motorista.placa}`, { continued: true, align: "left" }).text(` CPF: ${cpfMask(data.motorista.cpf)}`, { continued: true, align: "left" }).text(` NOME: ${data.motorista.nome}`, { align: "left" });
    doc.moveDown(1);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(1);
    for (let i = 0; i < Nfes.length; i++) {
      const indice = i + 1;
      const stops = Nfes[i];
      const quebraPagina = indice % 4 === 0;
      for (const stop of stops) {
        doc.fontSize(7).text(`NF: ${stop.nrNfre}`, { continued: true, align: "left" }).text(` REMETENTE: ${stop.remetente}`, { continued: true, align: "center" }).text(` PREVIS\xC3O ENTREGA: ${stop.prevEntrega}`, { align: "right" });
        doc.moveDown(0.5);
        doc.fontSize(7).text(`QTD VOLUMES: ${stop.qtdeVolumes}`, { align: "left" });
        doc.fontSize(7).text(`DESTINAT\xC1RIO: ${stop.destinatario}`);
        doc.moveDown(0.5);
        doc.fontSize(7).text(`TELEFONE: ${stop.telefone || "N INF."} / ${stop.celular || "N INF."}`);
        doc.moveDown(0.5);
        doc.fontSize(7).text(`BAIRRO: ${stop.bairro}`, { align: "left" });
        if (stop.chaveNFe || stop.chaveCTe) {
          const chave = stop.chaveNFe && stop.chaveNFe.trim() !== "" ? stop.chaveNFe : stop.chaveCTe;
          const qrCodeBuffer = await generateQRCode(chave);
          doc.image(qrCodeBuffer, doc.page.width - doc.page.margins.right - 300, doc.y - 30, { fit: [60, 60] });
          const barcodeBuffer = await generateBarcode(chave);
          doc.image(barcodeBuffer, doc.page.width - doc.page.margins.right - 170, doc.y - 20, { fit: [170, 60] });
        }
        doc.moveDown(0.5);
        doc.fontSize(7).text(`CEP: ${stop.cep}`, { continued: true, align: "left" }).text(` ${stop.cidade} / ${stop.uf}`);
        doc.moveDown(0.5);
        doc.fontSize(7).text(`ENDERE\xC7O: ${stop.endereco} ${stop.numero}`);
        doc.moveDown(0.5);
        doc.fontSize(7).text(`COMPL.: ${stop.complemento || ""}`);
        doc.moveDown(2);
        const lineWidth = 100;
        doc.moveTo(doc.page.width - doc.page.margins.right - lineWidth, doc.y - 2).lineTo(doc.page.width - doc.page.margins.right, doc.y - 2).stroke();
        doc.fontSize(7).text(`DATA`, { align: "right" });
        doc.moveDown(2);
        const lineWidthRecebedor = 120;
        doc.moveTo(doc.page.margins.left, doc.y - 2).lineTo(doc.page.margins.left + lineWidthRecebedor, doc.y - 2).stroke();
        doc.fontSize(7).text(`RECEBEDOR`, { continued: true, align: "left" });
        const lineWidthDocumento = 120;
        const offset = 20;
        doc.moveTo(doc.page.width / 2 - lineWidthDocumento / 2 + offset, doc.y - 2).lineTo(doc.page.width / 2 + lineWidthDocumento / 2 + offset, doc.y - 2).stroke();
        doc.fontSize(7).text(`DOCUMENTO`, { continued: true, align: "center" });
        const lineWidthParentesco = 120;
        doc.moveTo(doc.page.width - doc.page.margins.right - lineWidthParentesco, doc.y - 2).lineTo(doc.page.width - doc.page.margins.right, doc.y - 2).stroke();
        doc.fontSize(7).text(`GRAU DE PARENTESCO`, { align: "right" });
        if (!quebraPagina) {
          doc.moveDown(4);
          doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
          doc.moveDown(3);
        } else {
          doc.fontSize(7).text(`P\xE1gina ${currentPage}`, { align: "center" });
          if (indice < Nfes.length) doc.addPage();
          currentPage++;
        }
      }
    }
    doc.end();
    return new Promise((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        const base64PDF = pdfBuffer.toString("base64");
        resolve(base64PDF);
      });
      doc.on("error", reject);
    });
  };
  const generateBarcode = async (text) => {
    return new Promise((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid: "code128",
          // Tipo de código de barras
          text,
          // Texto para codificar
          scale: 2,
          // Escala do código de barras
          height: 10,
          // Altura
          includetext: true,
          // Incluir texto abaixo
          textxalign: "center"
          // Centralizar texto
        },
        (err, png) => {
          if (err) return reject(err);
          resolve(png);
        }
      );
    });
  };
  const cpfMask = (cpf) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };
  async function generateQRCode(chaveNFe) {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(chaveNFe);
      return qrCodeBuffer;
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      throw error;
    }
  }
  fastify.get(
    "/notaFiscal/listarObjPorPlaca",
    async (request, reply) => {
      try {
        const { placa } = request.query;
        const ctesMotorista = await prisma.ctes.findMany({
          where: {
            placaVeiculo: placa,
            listarCTE: true,
            codUltOco: 85
          },
          include: {
            motorista: true,
            NotaFiscal: true,
            remetente: true,
            destinatario: true,
            recebedor: true
          }
        });
        let motorista = "";
        const CNPJ_CEP = await prisma.cnpjTb.findMany({
          where: { idAtivo: true }
        });
        const nFEs = await Promise.all(
          ctesMotorista.map(async (cte) => {
            if (motorista == "") {
              motorista = {
                ...cte.motorista,
                placa
              };
            }
            if (CNPJ_CEP.some((item) => item.CNPJ === cte.remetente.cnpjCPF)) {
              cte.recebedor.endereco = await buscarCep(cte.recebedor.cep);
            }
            const objNFe = cte.NotaFiscal.map((nfe) => ({
              chaveCte: cte.chaveCTe,
              chaveNFe: nfe.chaveNFe,
              nrNfre: nfe.nroNF,
              qtdeVolumes: nfe.qtdeVolumes,
              remetente: cte.remetente.nome,
              prevEntrega: cte.previsaoEntrega,
              destinatario: cte.destinatario.nome,
              bairro: cte.recebedor.bairro,
              cep: cte.recebedor.cep,
              endereco: cte.recebedor.endereco,
              numero: cte.recebedor.numero,
              cidade: cte.recebedor.cidade,
              telefone: cte.recebedor.foneContato,
              celular: cte.recebedor.celularContato,
              uf: cte.recebedor.uf,
              complemento: cte.recebedor.complemento,
              ctesPorParada: ctesMotorista.filter(
                (ctePorParada) => ctePorParada.cte === cte.id
              )
            }));
            return objNFe;
          })
        );
        const nFEsOrdenadas = nFEs.sort((a, b) => {
          if (a[0].cep < b[0].cep) return -1;
          if (a[0].cep > b[0].cep) return 1;
          return 0;
        });
        const res = {
          motorista,
          Nfes: nFEsOrdenadas
        };
        return res;
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    }
  );
  fastify.get(
    "/notaFiscal/listarPorCte",
    async (request, reply) => {
      try {
        const { id } = request.query;
        const cte = await prisma.ctes.findMany({
          where: {
            id: Number(id)
          },
          include: {
            motorista: true,
            NotaFiscal: true,
            remetente: true,
            destinatario: true,
            recebedor: true
          }
        });
        let motorista = "";
        const CNPJ_CEP = await prisma.cnpjTb.findMany({
          where: { idAtivo: true }
        });
        const nFEs = await Promise.all(
          cte.map(async (cte2) => {
            if (motorista == "") {
              motorista = {
                ...cte2.motorista
              };
            }
            if (CNPJ_CEP.some((item) => item.CNPJ === cte2.remetente.cnpjCPF)) {
              cte2.recebedor.endereco = await buscarCep(cte2.recebedor.cep);
            }
            const objNFe = cte2.NotaFiscal.map((nfe) => ({
              chaveCte: cte2.chaveCTe,
              chaveNFe: nfe.chaveNFe,
              nrNfre: nfe.nroNF,
              qtdeVolumes: nfe.qtdeVolumes,
              remetente: cte2.remetente.nome,
              prevEntrega: cte2.previsaoEntrega,
              destinatario: cte2.destinatario.nome,
              bairro: cte2.recebedor.bairro,
              cep: cte2.recebedor.cep,
              endereco: cte2.recebedor.endereco,
              numero: cte2.recebedor.numero,
              cidade: cte2.recebedor.cidade,
              telefone: cte2.recebedor.foneContato,
              celular: cte2.recebedor.celularContato,
              uf: cte2.recebedor.uf,
              complemento: cte2.recebedor.complemento,
              ctesPorParada: cte2
            }));
            return objNFe;
          })
        );
        const nFEsOrdenadas = nFEs.sort((a, b) => {
          if (a[0].cep < b[0].cep) return -1;
          if (a[0].cep > b[0].cep) return 1;
          return 0;
        });
        const res = {
          motorista,
          Nfes: nFEsOrdenadas
        };
        return res;
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    }
  );
}
