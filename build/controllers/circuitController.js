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

// src/controllers/circuitController.ts
var circuitController_exports = {};
__export(circuitController_exports, {
  default: () => circuitController
});
module.exports = __toCommonJS(circuitController_exports);

// src/utils/API.ts
var API_BASE_URL = "https://ssw.inf.br/api";
var API_CIRCUIT_BASE_URL = "https://api.getcircuit.com/public/v0.2b";
var endpoints = {
  generateToken: `${API_BASE_URL}/generateToken`,
  // Endpoint para gerar o token de autenticação
  roteirizaRomaneioStockfy: `${API_BASE_URL}/roteirizaRomaneioStockfy`,
  // Endpoint para roteirizar um romaneio
  trackingdanfe: `${API_BASE_URL}/trackingdanfe`,
  // Endpoint para roteirizar um romaneio
  getCircuitBase: `${API_CIRCUIT_BASE_URL}`
};

// src/controllers/circuitController.ts
var apiKey = process.env.API_KEY;
var headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", `Basic ${btoa(`${apiKey}:`)}`);
var PDFDocument = require("pdfkit");
var bwipjs = require("bwip-js");
var fs = require("fs");
function circuitController(fastify, prisma) {
  fastify.get("/getCircuitPlans", async (request, reply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/plans`, {
        method: "GET",
        headers
      });
      if (response.ok) {
        const circuitPlans = await response.json();
        reply.code(200).send(circuitPlans);
      } else {
        reply.code(400).send({ error: "Failed to get Circuit plans" });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.post("/postCircuitPlans", async (request, reply) => {
    const model = request.body;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/plans`, {
        method: "POST",
        headers,
        body: JSON.stringify(model)
      });
      if (response.ok) {
        const createdPlan = await response.json();
        reply.code(200).send(createdPlan);
      } else {
        reply.code(400).send({ error: "Failed to create a new plan" });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.get("/getDrivers", async (request, reply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/drivers`, {
        method: "GET",
        headers
      });
      if (response.ok) {
        const drivers = await response.json();
        reply.code(200).send(drivers);
      } else {
        reply.code(400).send({ error: "Failed to get drivers" });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.put("/importStops", async (request, reply) => {
    const model = request.body;
    const { planId } = request.query;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}/stops:import`, {
        method: "POST",
        headers,
        body: JSON.stringify(model)
      });
      if (response.ok) {
        const stops = await response.json();
        reply.code(200).send(stops);
      } else {
        reply.code(400).send({ error: "Failed to import stops" });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.put("/optimizePlan", async (request, reply) => {
    const { planId } = request.query;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}:optimize`, {
        method: "POST",
        headers
      });
      if (response.ok) {
        const operation = await response.json();
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to optimize plan" });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.put("/distributePlan", async (request, reply) => {
    const { planId } = request.query;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}:distribute`, {
        method: "POST",
        headers
      });
      if (response.ok) {
        const operation = await response.json();
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to distribute plan" });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.get("/operationProgress", async (request, reply) => {
    const { operationId } = request.query;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${operationId}`, {
        method: "GET",
        headers
      });
      if (response.ok) {
        const operation = await response.json();
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to get operation" });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.get("/getDepots", async (request, reply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/depots`, {
        method: "GET",
        headers
      });
      if (response.ok) {
        const depots = await response.json();
        reply.code(200).send(depots);
      } else {
        reply.code(400).send({ error: "Failed to get depots" });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.get("/getStopsByPlan", async (request, reply) => {
    try {
      const { planId } = request.query;
      await listarParadasPorPlano(planId).then((data) => {
        if (data) {
          reply.code(200).send(data);
        } else {
          reply.code(400).send({ error: "Failed to get depots" });
        }
      });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.get("/getNfesByPlan", async (request, reply) => {
    try {
      const { placa } = request.query;
      let stops;
      let planId = "";
      await getPlanByDriver(placa).then(async (data) => {
        planId = data;
      });
      await listarParadasPorPlano(planId).then((data) => {
        if (data) {
          stops = data;
        } else {
          reply.code(400).send({ error: "Failed to get depots" });
        }
      });
      const ctesPorParada = stops.stops.map((stop) => {
        if (stop.orderInfo.products.length > 0) {
          return stop.orderInfo.products.map((product) => ({
            cte: parseInt(product),
            posicao: stop.stopPosition
          }));
        }
        return [];
      }).flat();
      let ctePorOrdem = [];
      for (let i = 0; i < ctesPorParada.length; i++) {
        const ctes = await prisma.ctes.findMany({
          where: {
            id: ctesPorParada[i].cte
          },
          include: {
            motorista: true,
            NotaFiscal: true,
            remetente: true,
            destinatario: true,
            recebedor: true
          }
        });
        ctePorOrdem.push(ctes[0]);
      }
      let motorista = "";
      const nFEs = await Promise.all(
        ctePorOrdem.map(async (cte) => {
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
            ctesPorParada: ctesPorParada.filter((ctePorParada) => ctePorParada.cte === cte.id)
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
  });
  async function getPlanByDriver(placa) {
    let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const response = await fetch(`${endpoints.getCircuitBase}/plans?maxPageSize=10&filter.startsGte=${date}`, {
      method: "GET",
      headers
    });
    if (response.ok) {
      const motorista = await prisma.motorista.findFirst({
        where: {
          placa
        },
        orderBy: { id: "desc" }
      });
      const plans = await response.json();
      let foundPlanId = "";
      await plans.plans.forEach((plan) => {
        plan.drivers.forEach((driver) => {
          if (driver.id === motorista?.idCircuit) {
            foundPlanId = plan.id.replace(/^plans\//, "");
          }
        });
      });
      return foundPlanId;
    } else {
      throw new Error("Failed to get plans");
    }
  }
  async function listarParadasPorPlano(planId) {
    const response = await fetch(`${endpoints.getCircuitBase}/plans/${planId}/stops`, {
      method: "GET",
      headers
    });
    if (response.ok) {
      var res = await response.json();
      var stops = res.stops;
      var nrPaginas = 1;
      while (res.nextPageToken) {
        const response2 = await fetch(`${endpoints.getCircuitBase}/plans/${planId}/stops?pageToken=${res.nextPageToken}`, {
          method: "GET",
          headers
        });
        if (response2.ok) {
          res = await response2.json();
          stops = stops.concat(res.stops);
          nrPaginas++;
        } else {
          throw new Error("Failed to get stops");
        }
      }
      const stopPosition = stops.sort((a, b) => a.stopPosition - b.stopPosition);
      stops = {
        stops: stopPosition,
        nrPaginas
      };
      return stops;
    }
  }
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
    doc.fontSize(7).text(`PLACA: ${motorista.placa}`, { continued: true, align: "left" }).text(` CPF: ${cpfMask(data.motorista.cpf)}`, { continued: true, align: "left" }).text(` NOME: ${data.motorista.nome}`, { continued: true, align: "left" });
    doc.moveDown(2);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(2);
    for (let i = 0; i < Nfes.length; i++) {
      const indice = i + 1;
      const stops = Nfes[i];
      for (const stop of stops) {
        if (currentPage > 1) doc.moveDown(2);
        doc.fontSize(7).text(`ORDEM: ${stop.ctesPorParada[0].posicao}`, { align: "left" });
        doc.fontSize(7).text(`NF: ${stop.nrNfre}`, { continued: true }).fontSize(7).text(` REMETENTE: ${stop.remetente}`, { continued: true, align: "center" }).fontSize(7).text(` PREVIS\xC3O ENTREGA: ${stop.prevEntrega}`, { align: "right" });
        doc.moveDown(0.5);
        doc.fontSize(7).text(`QTD VOLUMES: ${stop.qtdeVolumes}`, { align: "left" });
        doc.fontSize(7).text(`DESTINAT\xC1RIO: ${stop.destinatario}`);
        doc.moveDown(0.5);
        doc.fontSize(7).text(`BAIRRO: ${stop.bairro}`, { align: "left" });
        if (stop.chaveNfe) {
          const barcodeBuffer = await generateBarcode(stop.chaveNfe);
          doc.image(barcodeBuffer, doc.page.width - doc.page.margins.right - 200, doc.y - 20, {
            fit: [200, 80],
            // Novo tamanho do código de barras
            align: "right",
            // Mantém à direita
            valign: "top"
            // Alinha no topo
          });
        }
        doc.moveDown(0.5);
        doc.fontSize(7).text(`CEP: ${stop.cep}`, { continued: true, align: "left" }).fontSize(7).text(` ${stop.cidade} / ${stop.uf}`);
        doc.moveDown(0.5);
        doc.fontSize(7).text(`ENDERE\xC7O: ${stop.endereco} ${stop.numero}`);
        doc.moveDown(1);
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
        doc.moveDown(3);
        doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
        doc.moveDown(3);
      }
      if (indice % 4 === 0) {
        doc.fontSize(7).text(
          `P\xE1gina ${currentPage}`,
          { align: "center", baseline: "bottom" }
        );
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
