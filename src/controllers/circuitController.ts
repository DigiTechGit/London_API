import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PrismaClient } from '@prisma/client';

const apiKey = process.env.API_KEY;

import { endpoints } from "../utils/API";

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);

const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const fs = require('fs');

export default function circuitController
(
  fastify: FastifyInstance,
  prisma: PrismaClient
) {

  fastify.get('/getCircuitPlans', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/plans`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const circuitPlans = await response.json();

        // Salvar no Prisma
        // await prisma.circuitPlan.createMany({
        //   data: circuitPlans, // Assumindo que os dados estejam no formato correto
        //   skipDuplicates: true, // Evitar duplicatas
        // });

        reply.code(200).send(circuitPlans);
      } else {
        reply.code(400).send({ error: "Failed to get Circuit plans" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.post('/postCircuitPlans', async (request: FastifyRequest, reply: FastifyReply) => {
    const model = request.body;
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/plans`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(model),
      });
  
      if (response.ok) {
        const createdPlan = await response.json();
  
        reply.code(200).send(createdPlan);
      } else {
        reply.code(400).send({ error: "Failed to create a new plan" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/getDrivers', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/drivers`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const drivers = await response.json();

        reply.code(200).send(drivers);
      } else {
        reply.code(400).send({ error: "Failed to get drivers" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.put('/importStops', async (request: FastifyRequest, reply: FastifyReply) => {
    const model = request.body;
    const { planId } = request.query as { planId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}/stops:import`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(model),
      });
  
      if (response.ok) {
        const stops = await response.json();
  
        reply.code(200).send(stops);
      } else {
        reply.code(400).send({ error: "Failed to import stops" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.put('/optimizePlan', async (request: FastifyRequest, reply: FastifyReply) => {
    const { planId } = request.query as { planId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}:optimize`, {
        method: "POST",
        headers: headers,
      });
  
      if (response.ok) {
        const operation = await response.json();
  
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to optimize plan" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.put('/distributePlan', async (request: FastifyRequest, reply: FastifyReply) => {
    const { planId } = request.query as { planId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}:distribute`, {
        method: "POST",
        headers: headers,
      });
  
      if (response.ok) {
        const operation = await response.json();
  
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to distribute plan" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/operationProgress', async (request: FastifyRequest, reply: FastifyReply) => {
    const { operationId } = request.query as { operationId: string };
  
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${operationId}`, {
        method: "GET",
        headers: headers,
      });
  
      if (response.ok) {
        const operation = await response.json();
  
        reply.code(200).send(operation);
      } else {
        reply.code(400).send({ error: "Failed to get operation" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/getDepots', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/depots`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const depots = await response.json();

        reply.code(200).send(depots);
      } else {
        reply.code(400).send({ error: "Failed to get depots" });
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/getStopsByPlan', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { planId } = request.query as { planId: string };

      await listarParadasPorPlano(planId).then((data) => {
        if(data) {
          reply.code(200).send(data);
        } else {
          reply.code(400).send({ error: "Failed to get depots" });
        }
      });
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/getNfesByPlan', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { placa } = request.query as { placa: string };
      let stops: any;
      let planId = '';
      await getPlanByDriver(placa).then(async (data) => {
          planId = data;
      })

      await listarParadasPorPlano(planId).then((data) => {
        if(data) {
          stops = data;
        } else {
          reply.code(400).send({ error: "Failed to get depots" });
        }
      });

      const ctesPorParada = stops.stops.map((stop: any) => {
        if (stop.orderInfo.products.length > 0) {
            return stop.orderInfo.products.map((product: string) => ({
                cte: parseInt(product),
                posicao: stop.stopPosition
            }));
        }
        return [];
      }).flat();

      let ctePorOrdem = []
      for(let i = 0; i < ctesPorParada.length; i++) { 
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

      let motorista: any = '';

      const nFEs = await Promise.all(
        ctePorOrdem.map(async (cte) => {   
          
          if(motorista == ''){
            motorista = {
              ...cte.motorista,
              placa: placa
            };
          }

          const objNFe = cte.NotaFiscal.map((nfe: any) => ({
            chaveNfe: nfe.chaveNFe,
            nrNfre: nfe.nroNF,
            remetente: cte.remetente.nome,
            prevEntrega: cte.previsaoEntrega,
            destinatario: cte.destinatario.nome,
            bairro: cte.recebedor.bairro,
            cep: cte.recebedor.cep,
            endereco: cte.recebedor.endereco,
            numero: cte.recebedor.numero,
            cidade: cte.recebedor.cidade,
            uf: cte.recebedor.uf,
            ctesPorParada: ctesPorParada.filter((ctePorParada: any) => ctePorParada.cte === cte.id)
          }));
          return objNFe;
        })
      )

      const res = {
        motorista: motorista,
        Nfes: nFEs
      }

      const base64PDF = await generatePDF(res);

      reply.code(200).send({ pdfBase64: base64PDF });
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  async function getPlanByDriver(placa: string) {

    let date = new Date().toISOString().split('T')[0];
    const response = await fetch(`${endpoints.getCircuitBase}/plans?maxPageSize=10&filter.startsGte=${date}`, {
      method: "GET",
      headers: headers,
    });
    
    if (response.ok) {
      const motorista = await prisma.motorista.findFirst({
        where: {
          placa: placa
        },
        orderBy: { id: 'desc' }
      });
      
      const plans = await response.json();
      let foundPlanId = '';
      
      await plans.plans.forEach((plan: any) => {
        plan.drivers.forEach((driver: any) => {
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

  async function listarParadasPorPlano(planId: string) {
    const response = await fetch(`${endpoints.getCircuitBase}/plans/${planId}/stops`, {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      var res = await response.json();
      var stops = res.stops;
      var nrPaginas = 1;
      while(res.nextPageToken) {
        const response = await fetch(`${endpoints.getCircuitBase}/plans/${planId}/stops?pageToken=${res.nextPageToken}`, {
          method: "GET",
          headers: headers,
        });
        if (response.ok) {
          res = await response.json();
          stops = stops.concat(res.stops);
          nrPaginas++;
        } else {
          throw new Error("Failed to get stops");
        }    
      }
      const stopPosition = stops.sort((a: any, b: any) => a.stopPosition - b.stopPosition);
      stops = {
        stops: stopPosition,
        nrPaginas: nrPaginas
      }
      return stops;
    }
  }
  
  const generatePDF = async (data: any) => {
    const doc = new PDFDocument({ margin: 30 });
    let buffers: any = [];
    
    // Adiciona buffers para armazenar o conteúdo do PDF
    doc.on('data', buffers.push.bind(buffers));
    
    // Finaliza o PDF e concatena os buffers
    doc.on('end', () => {
        console.log('PDF gerado');
    });
    
    const Nfes = data.Nfes;
    // Loop pelas paradas
    for (let i = 0; i < Nfes.length; i++) {
        const stops = Nfes[i];
    
        for (const stop of stops) {
          // Título
          doc.fontSize(7).text(`ORDEM: ${stop.ctesPorParada.posicao}`, { align: 'left' });
          doc.fontSize(7).text(`NF: ${stop.nrNfre}`, { continued: true })
            .fontSize(7).text(` REMETENTE: ${stop.remetente}`, { continued: true, align: 'center' })
            .fontSize(7).text(` PREVISÃO ENTREGA: ${stop.prevEntrega}`, { align: 'right' });
          doc.moveDown(0.5);

          doc.fontSize(7).text(`DESTINATÁRIO: ${stop.destinatario}`);
          doc.moveDown(0.5);

          doc.fontSize(7).text(`BAIRRO: ${stop.bairro}`, { align: 'left' });
          if (stop.chaveNfe) {
            const barcodeBuffer = await generateBarcode(stop.chaveNfe);
            doc.image(barcodeBuffer, doc.page.width - doc.page.margins.right - 200, doc.y - 20, {
                fit: [200, 80], // Novo tamanho do código de barras
                align: 'right', // Mantém à direita
                valign: 'top'   // Alinha no topo
            });            
          }
          doc.moveDown(0.5);

          doc.fontSize(7).text(`CEP: ${stop.cep}`, { continued: true, align: 'left' })
            .fontSize(7).text(` ${stop.cidade} / ${stop.uf}`)
          doc.moveDown(0.5);

          doc.fontSize(7).text(`ENDEREÇO: ${stop.endereco} ${stop.numero}`);
          doc.moveDown(1);

          // Reduz o tamanho da linha, deixando-a mais curta
          const lineWidth = 100; // Largura da linha menor
          doc.moveTo(doc.page.width - doc.page.margins.right - lineWidth, doc.y - 2)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y - 2)
            .stroke();
          doc.fontSize(7).text(`DATA`, { align: 'right' });
          doc.moveDown(2);
          
          const lineWidthRecebedor = 120; // Defina o tamanho desejado da linha
          doc.moveTo(doc.page.margins.left, doc.y - 2)
            .lineTo(doc.page.margins.left + lineWidthRecebedor, doc.y - 2)
            .stroke();
          doc.fontSize(7).text(`RECEBEDOR`, { continued: true, align: 'left' });

          // Linha e texto para "DOCUMENTO"
          const lineWidthDocumento = 120; // Defina o tamanho desejado da linha
          const offset = 20; // Ajuste para mover o traço à direita
          doc.moveTo(doc.page.width / 2 - lineWidthDocumento / 2 + offset, doc.y - 2) // Centraliza e ajusta para a direita
             .lineTo(doc.page.width / 2 + lineWidthDocumento / 2 + offset, doc.y - 2)
             .stroke();
          doc.fontSize(7).text(`DOCUMENTO`, { continued: true, align: 'center' });
          

          // Linha e texto para "GRAU DE PARENTESCO"
          const lineWidthParentesco = 120; // Defina o tamanho desejado da linha
          doc.moveTo(doc.page.width - doc.page.margins.right - lineWidthParentesco, doc.y - 2)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y - 2)
            .stroke();
          doc.fontSize(7).text(`GRAU DE PARENTESCO`, { align: 'right' });

          // doc.moveTo(doc.page.margins.left, doc.y - 10)
          //   .lineTo(doc.page.width - doc.page.margins.right, doc.y - 10)
          //   .stroke();
          // Adicionar a linha de separação abaixo do código de barras
          doc.moveDown();
          doc.moveTo(doc.page.margins.left, doc.y)
              .lineTo(doc.page.width - doc.page.margins.right, doc.y)
              .stroke();
          doc.moveDown(2); // Espaço extra após a linha
        }
    
        // Adicionar uma nova página para cada parada, exceto a última
        if (i < data.length - 1) doc.addPage();
    }
    
    // Finalizar o documento
    doc.end();
    
  
      // Retorna o PDF como base64
      return new Promise((resolve, reject) => {
          doc.on('end', () => {
              const pdfBuffer = Buffer.concat(buffers);
              const base64PDF = pdfBuffer.toString('base64');
              resolve(base64PDF);
          });
  
          doc.on('error', reject);
      });
  };
  
  const generateBarcode = async (text: any) => {
      return new Promise((resolve, reject) => {
          bwipjs.toBuffer(
              {
                  bcid: 'code128', // Tipo de código de barras
                  text: text, // Texto para codificar
                  scale: 2, // Escala do código de barras
                  height: 10, // Altura
                  includetext: true, // Incluir texto abaixo
                  textxalign: 'center', // Centralizar texto
              },
              (err: any, png: any) => {
                  if (err) return reject(err);
                  resolve(png);
              }
          );
      });
  };
}