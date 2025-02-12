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
var headers = new Headers();
headers.append("Content-Type", "application/json");
var PDFDocument = require("pdfkit");
var bwipjs = require("bwip-js");
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
        console.log(ctesMotorista);
        let motorista = "";
        const nFEs = await Promise.all(
          ctesMotorista.map(async (cte) => {
            if (motorista == "") {
              motorista = {
                ...cte.motorista,
                placa
              };
            }
            const objNFe = cte.NotaFiscal.map((nfe) => ({
              chaveNfe: nfe.chaveNFe,
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
              uf: cte.recebedor.uf,
              ctesPorParada: ctesMotorista.filter(
                (ctePorParada) => ctePorParada.cte === cte.id
              )
            }));
            return objNFe;
          })
        );
        const res = {
          motorista,
          Nfes: nFEs
        };
        const base64PDF = await generatePDF(res);
        reply.code(200).send({ pdfBase64: base64PDF });
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    }
  );
  const generatePDF = async (data) => {
    const doc = new PDFDocument({ margin: 30 });
    let buffers = [];
    const motorista = data.motorista;
    const Nfes = data.Nfes;
    let currentPage = 1;
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      console.log("PDF gerado");
    });
    doc.fontSize(7).text(`PLACA: ${motorista.placa}`, { continued: true, align: "left" }).text(` CPF: ${cpfMask(data.motorista.cpf)}`, {
      continued: true,
      align: "left"
    }).text(` NOME: ${data.motorista.nome}`, {
      continued: true,
      align: "left"
    });
    doc.moveDown(2);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(2);
    for (let i = 0; i < Nfes.length; i++) {
      const indice = i + 1;
      const stops = Nfes[i];
      for (const stop of stops) {
        if (currentPage > 1) doc.moveDown(2);
        doc.fontSize(7).text(`NF: ${stop.nrNfre}`, { continued: true }).fontSize(7).text(` REMETENTE: ${stop.remetente}`, {
          continued: true,
          align: "center"
        }).fontSize(7).text(` PREVIS\xC3O ENTREGA: ${stop.prevEntrega}`, { align: "right" });
        doc.moveDown(0.5);
        doc.fontSize(7).text(`QTD VOLUMES: ${stop.qtdeVolumes}`, { align: "left" });
        doc.fontSize(7).text(`DESTINAT\xC1RIO: ${stop.destinatario}`);
        doc.moveDown(0.5);
        doc.fontSize(7).text(`BAIRRO: ${stop.bairro}`, { align: "left" });
        if (stop.chaveNfe) {
          const barcodeBuffer = await generateBarcode(stop.chaveNfe);
          doc.image(
            barcodeBuffer,
            doc.page.width - doc.page.margins.right - 200,
            doc.y - 20,
            {
              fit: [200, 80],
              // Novo tamanho do código de barras
              align: "right",
              // Mantém à direita
              valign: "top"
              // Alinha no topo
            }
          );
        }
        doc.moveDown(0.5);
        doc.fontSize(7).text(`CEP: ${stop.cep}`, { continued: true, align: "left" }).fontSize(7).text(` ${stop.cidade} / ${stop.uf}`);
        doc.moveDown(0.5);
        doc.fontSize(7).text(`ENDERE\xC7O: ${stop.endereco} ${stop.numero}`);
        doc.moveDown(1);
        const lineWidth = 100;
        doc.moveTo(
          doc.page.width - doc.page.margins.right - lineWidth,
          doc.y - 2
        ).lineTo(doc.page.width - doc.page.margins.right, doc.y - 2).stroke();
        doc.fontSize(7).text(`DATA`, { align: "right" });
        doc.moveDown(2);
        const lineWidthRecebedor = 120;
        doc.moveTo(doc.page.margins.left, doc.y - 2).lineTo(doc.page.margins.left + lineWidthRecebedor, doc.y - 2).stroke();
        doc.fontSize(7).text(`RECEBEDOR`, { continued: true, align: "left" });
        const lineWidthDocumento = 120;
        const offset = 20;
        doc.moveTo(
          doc.page.width / 2 - lineWidthDocumento / 2 + offset,
          doc.y - 2
        ).lineTo(
          doc.page.width / 2 + lineWidthDocumento / 2 + offset,
          doc.y - 2
        ).stroke();
        doc.fontSize(7).text(`DOCUMENTO`, { continued: true, align: "center" });
        const lineWidthParentesco = 120;
        doc.moveTo(
          doc.page.width - doc.page.margins.right - lineWidthParentesco,
          doc.y - 2
        ).lineTo(doc.page.width - doc.page.margins.right, doc.y - 2).stroke();
        doc.fontSize(7).text(`GRAU DE PARENTESCO`, { align: "right" });
        doc.moveDown(3);
        doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
        doc.moveDown(3);
      }
      if (indice % 4 === 0) {
        doc.fontSize(7).text(`P\xE1gina ${currentPage}`, {
          align: "center",
          baseline: "bottom"
        });
        if (indice < Nfes.length) doc.addPage();
        currentPage++;
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
}
