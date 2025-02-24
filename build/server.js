"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/server.ts
var import_fastify = __toESM(require("fastify"));
var import_client5 = require("@prisma/client");

// src/services/motoristaService.ts
var import_client = require("@prisma/client");

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

// src/services/motoristaService.ts
var apiKey = process.env.API_KEY;
var headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", `Basic ${btoa(`${apiKey}:`)}`);
var prisma = new import_client.PrismaClient();
var MotoristaService = class {
  static async getMotoristasComDetalhes() {
    try {
      const motoristas = await prisma.motorista.findMany();
      const driversWithDetails = [];
      for (const motorista of motoristas) {
        const driverId = motorista.idCircuit;
        const response = await fetch(`${endpoints.getCircuitBase}/${driverId}`, {
          method: "GET",
          headers
        });
        if (response.ok) {
          const driverData = await response.json();
          if (driverData.active) {
            driversWithDetails.push({
              id: motorista.id,
              idCircuit: motorista.idCircuit,
              placa: motorista.placa,
              name: driverData.name,
              email: driverData.email,
              active: driverData.active
            });
          } else {
            prisma.motorista.delete({ where: { id: motorista.id } });
          }
        } else {
          console.log(`Falha ao obter dados do driver ${driverId}`);
        }
      }
      return driversWithDetails;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Erro ao buscar motoristas com detalhes: " + error.message);
      } else {
        throw new Error("Erro ao buscar motoristas com detalhes: " + String(error));
      }
    }
  }
};

// src/controllers/motoristaController.ts
var apiKey2 = process.env.API_KEY;
var headers2 = new Headers();
headers2.append("Content-Type", "application/json");
headers2.append("Authorization", `Basic ${btoa(`${apiKey2}:`)}`);
function motoristaRoutes(fastify2, prisma6) {
  fastify2.post("/Motorista", async (request, reply) => {
    try {
      console.log("Request body:", request.body);
      const { placa, idCircuit } = request.body;
      const Motorista = await prisma6.motorista.create({
        data: { placa, idCircuit }
      });
      reply.code(201).send(Motorista);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/Motoristas", async (request, reply) => {
    try {
      const driversWithDetails = await MotoristaService.getMotoristasComDetalhes();
      reply.send(driversWithDetails);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/Motorista/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const Motorista = await prisma6.motorista.findUnique({ where: { id: Number(id) } });
      if (Motorista) {
        reply.send(Motorista);
      } else {
        reply.code(404).send({ error: "Motorista n\xE3o encontrado" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.put("/Motorista/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { placa } = request.body;
      const Motorista = await prisma6.motorista.update({
        where: { id: Number(id) },
        data: { placa }
      });
      reply.send(Motorista);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.delete("/Motorista/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma6.motorista.delete({ where: { id: Number(id) } });
      reply.code(204).send();
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
}

// src/controllers/cteController.ts
function cteRoutes(fastify2, prisma6) {
  fastify2.put("/CTES", async (request, reply) => {
    try {
      const { status, id } = request.body;
      const ctes = await prisma6.ctes.update({
        where: { id },
        data: { statusId: parseInt(status) }
      });
      reply.send(ctes);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/LOG", async (request, reply) => {
    try {
      const { tpLog } = request.query;
      const log = await prisma6.log.findFirst({
        where: {
          tp: tpLog.toUpperCase()
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      reply.status(200).send(log);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify2.delete("/CTES", async (request, reply) => {
    try {
      await prisma6.ctes.deleteMany();
      reply.code(204).send();
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.put("/cte/status", async (request, reply) => {
    const { status, chaveCTe, nroCTRC } = request.body;
    try {
      const existingCTe = await prisma6.ctes.findFirst({
        where: {
          chaveCTe,
          nroCTRC
        }
      });
      if (existingCTe) {
        await prisma6.ctes.update({
          where: { id: existingCTe.id },
          data: { statusId: status }
        });
      }
      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: "Failed to update CTe" });
    }
  });
  fastify2.get("/quantidadeCtesTotalPorStatus", async (request, reply) => {
    try {
      const { unidade, status } = request.query;
      const ultimoLog = await prisma6.log.findFirst({
        where: {
          tp: `AGENDADOR-${unidade.toUpperCase()}`
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      const motoristasSalvos = await prisma6.motorista.findMany({
        select: {
          idCircuit: true,
          placa: true
        }
      });
      const statusFormatado = status ? parseInt(status) : 1;
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      if (ultimoLog && ultimoLog.createdAt) {
        const dtAlteracaoComMinutos = new Date(ultimoLog.createdAt);
        dtAlteracaoComMinutos.setMinutes(dtAlteracaoComMinutos.getMinutes());
      }
      const ctes = await prisma6.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas
          },
          statusId: statusFormatado,
          Unidade: unidade.toUpperCase(),
          listarCTE: true
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true
        }
      });
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma6.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ
            }
          });
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists
          };
        })
      );
      const motoristasComCtes = motoristasSalvos.map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa
        );
        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesDoMotorista.length > 0 ? {
          ...motoristaComNome,
          ctes: statusFormatado ? ctesDoMotorista.filter((cte) => cte.statusId === statusFormatado) : ctesDoMotorista,
          ctesEnviados: ctesEnviados.length,
          ctesNaoEnviados: ctesNaoEnviados.length
        } : null;
      }).filter(Boolean);
      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify2.get("/ctesPorPlaca", async (request, reply) => {
    try {
      const { unidade, placa, statusId } = request.query;
      const motoristasSalvos = await prisma6.motorista.findMany({
        where: {
          placa
        },
        select: {
          idCircuit: true,
          placa: true
        }
      });
      const statusFormatado = statusId ? parseInt(statusId) : 1;
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      const ctes = await prisma6.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas
          },
          // statusId: statusIdFormatado,
          listarCTE: true
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true
        }
      });
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma6.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ
            }
          });
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists
          };
        })
      );
      const motoristasComCtes = motoristasSalvos.map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa
        );
        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesDoMotorista.length > 0 ? {
          ...motoristaComNome,
          ctes: statusFormatado ? ctesDoMotorista.filter((cte) => cte.statusId === statusFormatado) : ctesDoMotorista,
          ctesEnviados: ctesEnviados.length,
          ctesNaoEnviados: ctesNaoEnviados.length
        } : null;
      }).filter(Boolean);
      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify2.get("/quantidadeCtesNaoEnviados", async (request, reply) => {
    try {
      const { unidade } = request.query;
      const motoristasSalvos = await prisma6.motorista.findMany({
        select: {
          idCircuit: true,
          placa: true
        }
      });
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      const ctes = await prisma6.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas
          },
          Unidade: unidade.toUpperCase(),
          listarCTE: true
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true
        }
      });
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma6.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ
            }
          });
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists
          };
        })
      );
      const motoristasComCtes = motoristasSalvos.map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa
        );
        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesNaoEnviados.length > 0 && ctesEnviados.length == 0 ? {
          ...motoristaComNome,
          ctes: ctesDoMotorista.filter((cte) => cte.statusId === 1),
          ctesEnviados: ctesEnviados.length,
          ctesNaoEnviados: ctesNaoEnviados.length
        } : null;
      }).filter(Boolean);
      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
}

// src/controllers/LoginController.ts
var fetch2 = require("node-fetch");
function userRoutes(fastify2, prisma6) {
  fastify2.post("/User", async (request, reply) => {
    try {
      const { username, password, CNPJ } = request.body;
      const authResponse = await fetch2(endpoints.generateToken, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          domain: "RED",
          username,
          password,
          cnpj_edi: CNPJ
        })
      });
      if (!authResponse.ok) {
        reply.code(401).send({ error: "Login failed" });
        return;
      }
      const authData = await authResponse.json();
      reply.code(201).send({ authData });
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
}

// src/controllers/sswController.ts
var fetch3 = require("node-fetch");
function RouteRomaneioStockfy(fastify2, prisma6) {
  fastify2.options("*", (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    reply.send();
  });
  fastify2.get(
    "/RouteRomaneioStockfy",
    async (request, reply) => {
      try {
        const token = request.headers.authorization;
        const { siglaEnt } = request.query;
        if (!token || siglaEnt === void 0) {
          reply.code(401).send({ error: "Authorization token is required" });
          return;
        }
        const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${siglaEnt}`;
        const response = await fetch3(url, {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json"
          }
        });
        let text = await response.text();
        text = text.replace(/"cep":(\d+)/g, (match, p1) => `"cep":"${p1}"`);
        let parsedData = JSON.parse(text);
        reply.code(200).send(parsedData);
      } catch (error) {
        console.log(error);
        if (error.response && error.response.data) {
          reply.code(400).send({
            error: error.response.data.mensagem || "Failed to route romaneio"
          });
        } else {
          reply.code(500).send({ error: "Request failed" });
        }
      }
    }
  );
}

// src/controllers/statusController.ts
var import_client2 = require("@prisma/client");
var prisma2 = new import_client2.PrismaClient();
async function statusRoutes(fastify2) {
  fastify2.post("/status", async (request, reply) => {
    try {
      const { status, descricao } = request.body;
      console.log(request.body);
      const newStatus = await prisma2.statusEnvio.create({
        data: {
          status,
          descricao
        }
      });
      reply.code(201).send(newStatus);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: "Erro ao criar o status" });
    }
  });
  fastify2.get("/status", async (request, reply) => {
    try {
      const statusList = await prisma2.statusEnvio.findMany();
      reply.send(statusList);
    } catch (error) {
      reply.code(500).send({ error: "Erro ao obter os status" });
    }
  });
  fastify2.get("/status/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const status = await prisma2.statusEnvio.findUnique({
        where: {
          id: Number(id)
        }
      });
      if (!status) {
        reply.code(404).send({ error: "Status n\xE3o encontrado" });
      } else {
        reply.send(status);
      }
    } catch (error) {
      reply.code(500).send({ error: "Erro ao obter o status" });
    }
  });
  fastify2.put("/status/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { status, descricao } = request.body;
      const updatedStatus = await prisma2.statusEnvio.update({
        where: {
          id: Number(id)
        },
        data: {
          status,
          descricao
        }
      });
      reply.send(updatedStatus);
    } catch (error) {
      reply.code(500).send({ error: "Erro ao atualizar o status" });
    }
  });
  fastify2.delete("/status/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma2.statusEnvio.delete({
        where: {
          id: Number(id)
        }
      });
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: "Erro ao deletar o status" });
    }
  });
}

// src/controllers/circuitController.ts
var apiKey3 = process.env.API_KEY;
var headers3 = new Headers();
headers3.append("Content-Type", "application/json");
headers3.append("Authorization", `Basic ${btoa(`${apiKey3}:`)}`);
var PDFDocument = require("pdfkit");
var bwipjs = require("bwip-js");
var fs = require("fs");
function circuitController(fastify2, prisma6) {
  fastify2.get("/getCircuitPlans", async (request, reply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/plans`, {
        method: "GET",
        headers: headers3
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
  fastify2.post("/postCircuitPlans", async (request, reply) => {
    const model = request.body;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/plans`, {
        method: "POST",
        headers: headers3,
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
  fastify2.get("/getDrivers", async (request, reply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/drivers`, {
        method: "GET",
        headers: headers3
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
  fastify2.put("/importStops", async (request, reply) => {
    const model = request.body;
    const { planId } = request.query;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}/stops:import`, {
        method: "POST",
        headers: headers3,
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
  fastify2.put("/optimizePlan", async (request, reply) => {
    const { planId } = request.query;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}:optimize`, {
        method: "POST",
        headers: headers3
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
  fastify2.put("/distributePlan", async (request, reply) => {
    const { planId } = request.query;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${planId}:distribute`, {
        method: "POST",
        headers: headers3
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
  fastify2.get("/operationProgress", async (request, reply) => {
    const { operationId } = request.query;
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/${operationId}`, {
        method: "GET",
        headers: headers3
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
  fastify2.get("/getDepots", async (request, reply) => {
    try {
      const response = await fetch(`${endpoints.getCircuitBase}/depots`, {
        method: "GET",
        headers: headers3
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
  fastify2.get("/getStopsByPlan", async (request, reply) => {
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
  fastify2.get("/getNfesByPlan", async (request, reply) => {
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
        const ctes = await prisma6.ctes.findMany({
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
      headers: headers3
    });
    if (response.ok) {
      const motorista = await prisma6.motorista.findFirst({
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
      headers: headers3
    });
    if (response.ok) {
      var res = await response.json();
      var stops = res.stops;
      var nrPaginas = 1;
      while (res.nextPageToken) {
        const response2 = await fetch(`${endpoints.getCircuitBase}/plans/${planId}/stops?pageToken=${res.nextPageToken}`, {
          method: "GET",
          headers: headers3
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

// src/server.ts
var import_dotenv = __toESM(require("dotenv"));
var import_node_cron = __toESM(require("node-cron"));

// src/services/cteService.ts
var import_client3 = require("@prisma/client");
var prisma3 = new import_client3.PrismaClient();
var cacheCtes = /* @__PURE__ */ new Map();
async function GenerateToken() {
  const camposNecessarios = ["username", "password", "cnpj_edi", "domain"];
  const dados = await prisma3.dadosUsuario.findMany({
    where: {
      tpDados: {
        in: camposNecessarios
      }
    }
  });
  const authDados = {};
  dados.forEach((dado) => {
    authDados[dado.tpDados] = dado.vlDados;
  });
  const camposFaltantes = camposNecessarios.filter(
    (campo) => !(campo in authDados)
  );
  if (camposFaltantes.length > 0) {
    return;
  }
  const authResponse = await fetch(endpoints.generateToken, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      domain: authDados["domain"],
      username: authDados["username"],
      password: authDados["password"],
      cnpj_edi: authDados["cnpj_edi"]
    })
  });
  const authData = await authResponse.json();
  const token = authData.token;
  return token;
}
async function buscarEInserirCtesRecorrente(UNIDADE) {
  try {
    const startTimeTotal = Date.now();
    const startTimeAPI = Date.now();
    const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${UNIDADE}`;
    const token = await GenerateToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      }
    });
    const endTimeAPI = Date.now();
    const durationAPI = (endTimeAPI - startTimeAPI) / 1e3;
    const cachedCtes = cacheCtes.get(UNIDADE) || [];
    let text = await response.text();
    const startTimeParsing = Date.now();
    text = text.replace(/"cep":(\d+)/g, (match, p1) => `"cep":"${p1}"`);
    let parsedData = JSON.parse(text);
    const endTimeParsing = Date.now();
    const durationParsing = (endTimeParsing - startTimeParsing) / 1e3;
    const startTimeFiltering = Date.now();
    const ctes = parsedData?.ctes ?? [];
    const filteredCTES = await filtroCTEsDuplicadas(ctes);
    const endTimeFiltering = Date.now();
    const durationFiltering = (endTimeFiltering - startTimeFiltering) / 1e3;
    cacheCtes.set(UNIDADE, filteredCTES);
    if (cachedCtes.length === 0) return;
    const startTimeProcessing = Date.now();
    const { novos, removidos, modificados } = compararCtes(
      cachedCtes,
      filteredCTES
    );
    const adicionados = await adicionarCTEs(novos, UNIDADE);
    const CTESremovidos = await removerCTEs(removidos, UNIDADE);
    const atualizados = await atualizarCTEs(modificados, UNIDADE);
    const endTimeProcessing = Date.now();
    const durationProcessing = (endTimeProcessing - startTimeProcessing) / 1e3;
    const endTimeTotal = Date.now();
    const durationTotal = (endTimeTotal - startTimeTotal) / 1e3;
    const dt_alteracao = /* @__PURE__ */ new Date();
    await prisma3.log.create({
      data: {
        desc: `Log do processo de CTes para a unidade ${UNIDADE}:
    - Tempo total: ${durationTotal} segundos
    - Chamada \xE0 API: ${durationAPI} segundos
    - Parsing da resposta: ${durationParsing} segundos
    - Filtragem de CTes duplicados: ${durationFiltering} segundos
    - Processamento de CTes (adicionar, remover, atualizar): ${durationProcessing} segundos
    - CTes adicionados: ${adicionados}
    - CTes removidos: ${removidos.length}
    - CTes atualizados: ${modificados.length}`,
        tp: `AGENDADOR-${UNIDADE}`,
        createdAt: dt_alteracao
      }
    });
  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  }
}
async function buscarEInserirCtesRecorrenteStatusId(UNIDADE) {
  try {
    const startTimeAPI = Date.now();
    const token = await GenerateToken();
    const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${UNIDADE}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      }
    });
    const endTimeAPI = Date.now();
    const durationAPI = (endTimeAPI - startTimeAPI) / 1e3;
    let text = await response.text();
    const startTime = Date.now();
    text = text.replace(/"cep":(\d+)/g, (match, p1) => `"cep":"${p1}"`);
    let parsedData = JSON.parse(text);
    const ctes = parsedData?.ctes ?? [];
    let criados = 0;
    let atualizados = 0;
    const dt_alteracao = /* @__PURE__ */ new Date();
    if (ctes.length > 0) {
      const novosCtes = [];
      const updatePromises = [];
      for (const cte of ctes) {
        const existingCTe = await prisma3.ctes.findFirst({
          where: {
            chaveCTe: cte.chaveCTe,
            nroCTRC: cte.nroCTRC
          }
        });
        if (existingCTe) {
          if (existingCTe.placaVeiculo.toUpperCase() != cte.placaVeiculo.toUpperCase()) {
            let motoristaData;
            if (cte.cpfMotorista && cte.nomeMotorista) {
              motoristaData = await prisma3.motorista_ssw.upsert({
                where: { cpf: cte.cpfMotorista },
                update: {},
                create: {
                  cpf: cte.cpfMotorista,
                  nome: cte.nomeMotorista
                }
              });
            }
            updatePromises.push(
              prisma3.ctes.update({
                where: { id: existingCTe.id },
                data: {
                  dt_alteracao,
                  codUltOco: cte.codUltOco,
                  placaVeiculo: cte.placaVeiculo,
                  statusId: 1,
                  motoristaId: motoristaData.id,
                  listarCTE: true
                }
              })
            );
          } else {
            updatePromises.push(
              prisma3.ctes.update({
                where: { id: existingCTe.id },
                data: {
                  dt_alteracao,
                  codUltOco: cte.codUltOco,
                  statusId: 1,
                  listarCTE: true
                }
              })
            );
          }
          atualizados++;
        } else {
          let recebedor = await prisma3.recebedor.findFirst({
            where: {
              cnpjCPF: cte.recebedor.cnpjCPF,
              nome: cte.recebedor.nome,
              endereco: cte.recebedor.endereco,
              cep: cte.recebedor.cep,
              numero: cte.recebedor.numero
            }
          });
          if (!recebedor) {
            recebedor = await prisma3.recebedor.create({
              data: {
                cnpjCPF: cte.recebedor.cnpjCPF,
                nome: cte.recebedor.nome,
                tipo: cte.recebedor.tipo,
                endereco: cte.recebedor.endereco,
                numero: cte.recebedor.numero,
                bairro: cte.recebedor.bairro,
                cep: cte.recebedor.cep,
                cidade: cte.recebedor.cidade,
                uf: cte.recebedor.uf,
                foneContato: cte.recebedor.foneContato
              }
            });
          }
          await prisma3.ctes.create({
            data: {
              chaveCTe: cte.chaveCTe,
              Unidade: UNIDADE,
              nroCTRC: cte.nroCTRC,
              valorFrete: cte.valorFrete,
              placaVeiculo: cte.placaVeiculo,
              previsaoEntrega: cte.previsaoEntrega,
              codUltOco: cte.codUltOco,
              motorista: {
                connectOrCreate: {
                  where: { cpf: cte.cpfMotorista },
                  create: {
                    cpf: cte.cpfMotorista,
                    nome: cte.nomeMotorista
                  }
                }
              },
              remetente: {
                connectOrCreate: {
                  where: { cnpjCPF: cte.remetente.cnpjCPF },
                  create: {
                    cnpjCPF: cte.remetente.cnpjCPF,
                    nome: cte.remetente.nome,
                    tipo: cte.remetente.tipo
                  }
                }
              },
              destinatario: {
                connectOrCreate: {
                  where: { cnpjCPF: cte.destinatario.cnpjCPF },
                  create: {
                    cnpjCPF: cte.destinatario.cnpjCPF,
                    nome: cte.destinatario.nome,
                    tipo: cte.destinatario.tipo
                  }
                }
              },
              recebedor: {
                connect: { id: recebedor.id }
              },
              NotaFiscal: {
                create: cte.notasFiscais.map((nota) => ({
                  chaveNFe: nota.chave_nfe,
                  serNF: nota.serNF,
                  nroNF: nota.nroNF,
                  nroPedido: nota.nroPedido,
                  qtdeVolumes: nota.qtdeVolumes,
                  pesoReal: nota.pesoReal,
                  metragemCubica: nota.metragemCubica,
                  valorMercadoria: nota.valorMercadoria
                }))
              },
              status: {
                connect: {
                  id: 1
                }
              }
            }
          });
          criados++;
        }
      }
      await Promise.all(updatePromises);
    }
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1e3;
    await prisma3.log.create({
      data: {
        desc: `DIARIO Foram inseridos ${criados} CTe(s) novos e atualizados ${atualizados} CTe(s) existentes em ${duration} segundos | SSW: ${durationAPI}`,
        tp: `AGENDADOR-${UNIDADE}`,
        createdAt: dt_alteracao
      }
    });
  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  }
}
async function adicionarCTEs(ctes, UNIDADE) {
  let criados = 0;
  for (const cte of ctes) {
    const motoristaData = await prisma3.motorista_ssw.upsert({
      where: { cpf: cte.cpfMotorista },
      update: {},
      create: {
        cpf: cte.cpfMotorista,
        nome: cte.nomeMotorista
      }
    });
    const remetenteData = await prisma3.remetente.upsert({
      where: { cnpjCPF: cte.remetente.cnpjCPF },
      update: {},
      create: {
        cnpjCPF: cte.remetente.cnpjCPF,
        nome: cte.remetente.nome,
        tipo: cte.remetente.tipo
      }
    });
    const destinatarioData = await prisma3.destinatario.upsert({
      where: { cnpjCPF: cte.destinatario.cnpjCPF },
      update: {},
      create: {
        cnpjCPF: cte.destinatario.cnpjCPF,
        nome: cte.destinatario.nome,
        tipo: cte.destinatario.tipo
      }
    });
    const recebedorExistente = await prisma3.recebedor.findMany({
      where: { cnpjCPF: cte.recebedor.cnpjCPF }
    });
    const registroIgual = recebedorExistente.find(
      (recebedor) => recebedor.nome === cte.recebedor.nome && recebedor.tipo === cte.recebedor.tipo && recebedor.endereco === cte.recebedor.endereco && recebedor.numero === cte.recebedor.numero && recebedor.bairro === cte.recebedor.bairro && recebedor.cep === cte.recebedor.cep.toString() && recebedor.cidade === cte.recebedor.cidade && recebedor.uf === cte.recebedor.uf && recebedor.foneContato === cte.recebedor.foneContato
    );
    let recebedorId;
    if (registroIgual) {
      recebedorId = registroIgual.id;
    } else {
      const novoRecebedor = await prisma3.recebedor.create({
        data: {
          cnpjCPF: cte.recebedor.cnpjCPF,
          nome: cte.recebedor.nome,
          tipo: cte.recebedor.tipo,
          endereco: cte.recebedor.endereco,
          numero: cte.recebedor.numero,
          bairro: cte.recebedor.bairro,
          cep: cte.recebedor.cep.toString(),
          cidade: cte.recebedor.cidade,
          uf: cte.recebedor.uf,
          foneContato: cte.recebedor.foneContato
        }
      });
      recebedorId = novoRecebedor.id;
    }
    await prisma3.ctes.create({
      data: {
        chaveCTe: cte.chaveCTe,
        Unidade: UNIDADE,
        nroCTRC: cte.nroCTRC,
        valorFrete: cte.valorFrete,
        placaVeiculo: cte.placaVeiculo,
        previsaoEntrega: cte.previsaoEntrega,
        codUltOco: cte.codUltOco,
        ordem: cte.ordem,
        motoristaId: motoristaData.id,
        remetenteId: remetenteData.id,
        destinatarioId: destinatarioData.id,
        recebedorId,
        statusId: 1,
        listarCTE: true,
        NotaFiscal: {
          create: cte.notasFiscais.map((nota) => ({
            chaveNFe: nota.chave_nfe,
            serNF: nota.serNF,
            nroNF: nota.nroNF,
            nroPedido: nota.nroPedido,
            qtdeVolumes: nota.qtdeVolumes,
            pesoReal: nota.pesoReal,
            metragemCubica: nota.metragemCubica,
            valorMercadoria: nota.valorMercadoria
          }))
        }
      }
    });
    criados++;
  }
  return criados;
}
async function removerCTEs(ctes, UNIDADE) {
  for (const cte of ctes) {
    await prisma3.ctes.updateMany({
      where: {
        chaveCTe: cte.chaveCTe,
        placaVeiculo: cte.placaVeiculo,
        nroCTRC: cte.nroCTRC,
        Unidade: UNIDADE
      },
      data: {
        listarCTE: false
      }
    });
  }
}
async function atualizarCTEs(ctes, UNIDADE) {
  for (const cte of ctes) {
    const motorista = await prisma3.motorista_ssw.upsert({
      where: { cpf: cte.cpfMotorista },
      update: {
        nome: cte.nomeMotorista
      },
      create: {
        cpf: cte.cpfMotorista,
        nome: cte.nomeMotorista
      }
    });
    await prisma3.ctes.updateMany({
      where: {
        chaveCTe: cte.chaveCTe,
        nroCTRC: cte.nroCTRC,
        Unidade: UNIDADE
      },
      data: {
        statusId: 1,
        codUltOco: cte.codUltOco,
        placaVeiculo: cte.placaVeiculo,
        listarCTE: true,
        motoristaId: motorista.id
      }
    });
  }
}
function filtroCTEsDuplicadas(ctes) {
  const filteredCTES = ctes.reduce((acc, current) => {
    const existing = acc.find(
      (cte) => cte.chaveCTe === current.chaveCTe && cte.serCTRC === current.serCTRC && cte.nroCTRC === current.nroCTRC && cte.valorFrete === current.valorFrete && cte.valorImpostoCTRC === current.valorImpostoCTRC && cte.setor === current.setor
    );
    if (existing) {
      if (current.ordem > existing.ordem) {
        acc = acc.filter(
          (cte) => !(cte.chaveCTe === current.chaveCTe && cte.serCTRC === current.serCTRC && cte.nroCTRC === current.nroCTRC && cte.valorFrete === current.valorFrete && cte.valorImpostoCTRC === current.valorImpostoCTRC && cte.setor === current.setor)
        );
        acc.push(current);
      }
    } else {
      acc.push(current);
    }
    return acc;
  }, []);
  return filteredCTES;
}
function compararCtes(cachedCtes, filteredCTES) {
  const novos = filteredCTES.filter(
    (cteFiltered) => !cachedCtes.some(
      (cteCached) => cteCached.chaveCTe === cteFiltered.chaveCTe && cteCached.serCTRC === cteFiltered.serCTRC && cteCached.nroCTRC === cteFiltered.nroCTRC && cteCached.setor === cteFiltered.setor
    )
  );
  const removidos = cachedCtes.filter(
    (cteCached) => !filteredCTES.some(
      (cteFiltered) => cteCached.chaveCTe === cteFiltered.chaveCTe && cteCached.serCTRC === cteFiltered.serCTRC && cteCached.nroCTRC === cteFiltered.nroCTRC && cteCached.setor === cteFiltered.setor
    )
  );
  const modificados = filteredCTES.filter(
    (cteFiltered) => cachedCtes.some(
      (cteCached) => cteCached.chaveCTe === cteFiltered.chaveCTe && cteCached.serCTRC === cteFiltered.serCTRC && cteCached.nroCTRC === cteFiltered.nroCTRC && cteCached.setor === cteFiltered.setor && (cteCached.cpfMotorista !== cteFiltered.cpfMotorista || cteCached.placaVeiculo !== cteFiltered.placaVeiculo)
    )
  );
  return { novos, removidos, modificados };
}

// src/controllers/UnidadeController.ts
function unidadeRoutes(fastify2, prisma6) {
  fastify2.post("/Unidade", async (request, reply) => {
    try {
      const { Unidade, idAtivo, desc } = request.body;
      const unidade = await prisma6.unidade.create({
        data: { Unidade, idAtivo, desc }
      });
      reply.code(201).send(unidade);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/Unidades", async (request, reply) => {
    try {
      const unidades = await prisma6.unidade.findMany();
      reply.send(unidades);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/Unidade/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const unidade = await prisma6.unidade.findUnique({ where: { id } });
      if (unidade) {
        reply.send(unidade);
      } else {
        reply.code(404).send({ error: "Unidade n\xE3o encontrada" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.put("/Unidade/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { Unidade, idAtivo, desc } = request.body;
      const unidade = await prisma6.unidade.update({
        where: { id },
        data: { Unidade, idAtivo, desc }
      });
      reply.send(unidade);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.delete("/Unidade/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma6.unidade.delete({ where: { id } });
      reply.code(204).send();
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
}

// src/controllers/DadosUsuarioController.ts
function dadosUsuariosRoutes(fastify2, prisma6) {
  fastify2.post("/DadosUsuario", async (request, reply) => {
    try {
      const { tpDados, vlDados } = request.body;
      const dadosUsuario = await prisma6.dadosUsuario.create({
        data: { tpDados, vlDados }
      });
      reply.code(201).send(dadosUsuario);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/DadosUsuarios", async (request, reply) => {
    try {
      const dadosUsuarios = await prisma6.dadosUsuario.findMany();
      reply.send(dadosUsuarios);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/DadosUsuario/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const dadosUsuario = await prisma6.dadosUsuario.findUnique({ where: { id } });
      if (dadosUsuario) {
        reply.send(dadosUsuario);
      } else {
        reply.code(404).send({ error: "Dados do usu\xE1rio n\xE3o encontrados" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.post("/DadosUsuarioByTp", async (request, reply) => {
    try {
      const { tpDados } = request.body;
      const dadosUsuario = await prisma6.dadosUsuario.findUnique({ where: { tpDados } });
      if (dadosUsuario) {
        reply.send(dadosUsuario);
      } else {
        reply.code(404).send({ error: "Dados do usu\xE1rio n\xE3o encontrados" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.put("/DadosUsuario/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { tpDados, vlDados } = request.body;
      const dadosUsuario = await prisma6.dadosUsuario.update({
        where: { id },
        data: { tpDados, vlDados }
      });
      reply.send(dadosUsuario);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.delete("/DadosUsuario/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma6.dadosUsuario.delete({ where: { id } });
      reply.code(204).send();
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
}

// src/services/RelatorioService.ts
var import_client4 = require("@prisma/client");
var prisma4 = new import_client4.PrismaClient();
var codigosNaoPrecisamAtualizar = [
  1
];
async function AtualizarCtesRecorrente() {
  try {
    const startTime = Date.now();
    const camposNecessarios = ["username", "password", "cnpj_edi", "domain"];
    const dados = await prisma4.dadosUsuario.findMany({
      where: {
        tpDados: {
          in: camposNecessarios
        }
      }
    });
    const authDados = {};
    dados.forEach((dado) => {
      authDados[dado.tpDados] = dado.vlDados;
    });
    const camposFaltantes = camposNecessarios.filter((campo) => !(campo in authDados));
    if (camposFaltantes.length > 0) {
      console.log(`Os seguintes campos est\xE3o faltando: ${camposFaltantes.join(", ")}`);
      return;
    }
    console.log("Gerando token de autentica\xE7\xE3o...");
    const authResponse = await fetch(endpoints.generateToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        domain: authDados["domain"],
        username: authDados["username"],
        password: authDados["password"],
        cnpj_edi: authDados["cnpj_edi"]
      })
    });
    const authData = await authResponse.json();
    const token = authData.token;
    const ctesAtualizar = await prisma4.ctes.findMany({
      where: {
        NotaFiscal: {
          some: {
            chaveNFe: { not: "" }
          }
        },
        codUltOco: { notIn: codigosNaoPrecisamAtualizar }
      },
      include: {
        NotaFiscal: true
      }
    });
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const processarCTEs = async () => {
      let contador = 0;
      let contadorCTE = 0;
      for (const cte of ctesAtualizar) {
        if (cte.NotaFiscal.length > 0) {
          for (const nota of cte.NotaFiscal) {
            const url = endpoints.trackingdanfe;
            const body = JSON.stringify({ chave_nfe: nota.chaveNFe });
            try {
              if (contador >= 18) {
                await delay(1e3);
                contador = 0;
              }
              const response = await fetch(url, {
                method: "POST",
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json"
                },
                body
              });
              contador++;
              contadorCTE++;
              if (!response.ok) {
                continue;
              }
              const data = await response.json();
              if (!data.success || !data.documento.tracking.length) {
                // console.warn(`${cte.id} Nenhum tracking encontrado para NF-e ${nota.chaveNFe}`);
                continue;
              }
              const ultimaOcorrencia = data.documento.tracking[data.documento.tracking.length - 1];
              const ocorrenciaTexto = ultimaOcorrencia.ocorrencia;
              const ocorrenciaData = ultimaOcorrencia.data_hora;
              const numeroOcorrencia = ocorrenciaTexto.match(/\((\d+)\)/)?.[1];
              if (numeroOcorrencia && cte.codUltOco != numeroOcorrencia) {
                await prisma4.ctes.update({
                  where: { id: cte.id },
                  data: { codUltOco: parseInt(numeroOcorrencia), dt_alteracao: new Date(ocorrenciaData) }
                });
              }
            } catch (error) {
              console.error(`Erro na requisi\xE7\xE3o para NF-e ${nota.chaveNFe}:`, error);
            }
          }
        } else {
          await prisma4.ctes.update({ where: { id: cte.id }, data: { codUltOco: 0 } });
        }
      }
      console.log("Atualiza\xE7\xF5es conclu\xEDdas.");
    };
    await processarCTEs();
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1e3;
    console.log(`Processo conclu\xEDdo em ${duration} segundos.`);
    await prisma4.log.create({
      data: {
        desc: `Processo de atualiza\xE7\xE3o de CTEs conclu\xEDdo em ${duration} segundos.`,
        tp: `AGENDADOR`,
        createdAt: /* @__PURE__ */ new Date()
      }
    });
  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  } finally {
    await prisma4.$disconnect();
  }
}

// src/controllers/RelatorioController.ts
var import_dayjs = __toESM(require("dayjs"));
function RelatorioRoutes(fastify2, prisma6) {
  const relatorioDiario = async (date) => {
    try {
      const dataInicio = (0, import_dayjs.default)(date).startOf("day");
      const dataFim = (0, import_dayjs.default)(date).endOf("day");
      const ctes = await prisma6.ctes.findMany({
        where: {
          dt_alteracao: {
            gte: dataInicio.toDate(),
            lte: dataFim.toDate()
          },
          codUltOco: { gt: 0 }
        },
        select: {
          placaVeiculo: true,
          codUltOco: true
        }
      });
      const entregaStatusCodes = /* @__PURE__ */ new Set([1]);
      const entregas = ctes.filter(
        (cte) => entregaStatusCodes.has(cte.codUltOco)
      );
      const totalEntregues = entregas.length;
      const placasUnicas = new Set(ctes.map((cte) => cte.placaVeiculo));
      const totalCarros = placasUnicas.size;
      const statusMap = {
        1: "MERCADORIA ENTREGUE",
        2: "MERCADORIA PRE-ENTREGUE (MOBILE)",
        3: "MERCADORIA DEVOLVIDA AO REMETENTE",
        4: "DESTINATARIO RETIRA",
        5: "CLIENTE ALEGA MERCAD DESACORDO C/ PEDIDO",
        7: "CHEGADA NO CLIENTE DESTINAT\xC1RIO",
        9: "DESTINATARIO DESCONHECIDO",
        10: "LOCAL DE ENTREGA NAO LOCALIZADO",
        11: "LOCAL DE ENTREGA FECHADO/AUSENTE",
        13: "ENTREGA PREJUDICADA PELO HORARIO",
        14: "NOTA FISCAL ENTREGUE",
        15: "ENTREGA AGENDADA PELO CLIENTE",
        16: "ENTREGA AGUARDANDO INSTRUCOES",
        18: "MERCAD REPASSADA P/ PROX TRANSPORTADORA",
        19: "ANEXADO COMPROVANTE DE ENTREGA COMPLEMENTAR",
        20: "CLIENTE ALEGA FALTA DE MERCADORIA",
        23: "CLIENTE ALEGA MERCADORIA AVARIADA",
        25: "REMETENTE RECUSA RECEBER DEVOLU\xC7\xC3O",
        26: "AGUARDANDO AUTORIZACAO P/ DEVOLUCAO",
        27: "DEVOLUCAO AUTORIZADA",
        28: "AGUARDANDO AUTORIZACAO P/ REENTREGA",
        29: "REENTREGA AUTORIZADA",
        31: "PRIMEIRA TENTATIVA DE ENTREGA",
        32: "SEGUNDA TENTATIVA DE ENTREGA",
        33: "TERCEIRA TENTATIVA DE ENTREGA",
        34: "MERCADORIA EM CONFERENCIA NO CLIENTE",
        35: "AGUARDANDO AGENDAMENTO DO CLIENTE",
        36: "MERCAD EM DEVOLUCAO EM OUTRA OPERACAO",
        37: "ENTREGA REALIZADA COM RESSALVA",
        38: "CLIENTE RECUSA/NAO PODE RECEBER MERCAD",
        39: "CLIENTE RECUSA PAGAR O FRETE",
        40: "FRETE DO CTRC DE ORIGEM RECEBIDO",
        45: "CARGA SINISTRADA",
        48: "EDI FOI RECEPCIONADO MAS A MERCADORIA N\xC3O",
        50: "FALTA DE MERCADORIA",
        51: "SOBRA DE MERCADORIA",
        52: "FALTA DE DOCUMENTACAO",
        53: "MERCADORIA AVARIADA",
        54: "EMBALAGEM AVARIADA",
        55: "CARGA ROUBADA",
        56: "MERCAD RETIDA PELA FISCALIZACAO",
        57: "GREVE OU PARALIZACAO",
        58: "MERCAD LIBERADA PELA FISCALIZACAO",
        59: "VEICULO AVARIADO/SINISTRADO",
        60: "VIA INTERDITADA",
        61: "MERCADORIA CONFISCADA PELA FISCALIZA\xC7\xC3O",
        62: "VIA INTERDITADA POR FATORES NATURAIS",
        65: "NOTIFIC REMET DE ENVIO NOVA MERCAD",
        66: "NOVA MERCAD ENVIADA PELO REMETENTE",
        72: "COLETA COMANDADA",
        73: "AGUARDANDO DISPONIBILIDADE DE BALSA",
        74: "PRIMEIRA TENTATIVA DE COLETA",
        75: "SEGUNDA TENTATIVA DE COLETA",
        76: "TERCEIRA TENTATIVA DE COLETA",
        77: "COLETA CANCELADA",
        78: "COLETA REVERSA REALIZADA",
        79: "COLETA REVERSA AGENDADA",
        80: "MERCADORIA RECEBIDA PARA TRANSPORTE",
        82: "SAIDA DE UNIDADE",
        83: "CHEGADA EM UNIDADE",
        84: "CHEGADA NA UNIDADE",
        85: "SAIDA PARA ENTREGA",
        86: "ESTORNO DE BAIXA/ENTREGA ANTERIOR",
        87: "DISPONIVEL NO LOCKER",
        88: "RESGATE DE MERCADORIA SOLICITADA PELO CLIENTE",
        91: "MERCADORIA EM INDENIZACAO",
        92: "MERCADORIA INDENIZADA",
        93: "CTRC EMITIDO PARA EFEITO DE FRETE",
        94: "CTRC SUBSTITUIDO",
        95: "PREVIS\xC3O DE ENTREGA ALTERADA",
        99: "CTRC BAIXADO/CANCELADO"
      };
      const statusCount = {};
      ctes.forEach((cte) => {
        const descricao = statusMap[cte.codUltOco] || "OUTRO";
        statusCount[descricao] = (statusCount[descricao] || 0) + 1;
      });
      return {
        totalVolumes: ctes.length,
        totalEntregues,
        totalCarros,
        status: statusCount
        // Retorna os números por status
      };
    } catch (error) {
      console.error(error);
      return;
    }
  };
  const relatorioMotorista = async (from, to) => {
    try {
      const dataInicio = (0, import_dayjs.default)(from).startOf("day");
      const dataFim = (0, import_dayjs.default)(to).endOf("day");
      const relatorios = await prisma6.relatorioPerformance.findMany({
        where: {
          data: {
            gte: dataInicio.toDate(),
            lte: dataFim.toDate()
          }
        }
      });
      const entregasPorMotorista = {};
      relatorios.forEach((relatorio) => {
        const { nomeMotorista, totalEntregue, totalNaoEntregue } = relatorio;
        if (!entregasPorMotorista[nomeMotorista]) {
          entregasPorMotorista[nomeMotorista] = {
            motorista: nomeMotorista,
            entregue: 0,
            naoEntregue: 0
          };
        }
        entregasPorMotorista[nomeMotorista].entregue += Number(totalEntregue);
        entregasPorMotorista[nomeMotorista].naoEntregue += Number(totalNaoEntregue);
      });
      return Object.values(entregasPorMotorista);
    } catch (error) {
      console.error("Erro ao gerar relat\xF3rio do motorista:", error);
      throw new Error("Falha ao gerar o relat\xF3rio");
    }
  };
  fastify2.get("/relatorio/motorista", async (request, reply) => {
    try {
      const { from, to } = request.query;
      const ontem = (0, import_dayjs.default)().subtract(1, "day").format("YYYY-MM-DD");
      let endDate;
      const startDate = from || ontem;
      if (to === "undefined") {
        endDate = startDate;
      } else {
        endDate = to;
      }
      console.log(`Per\xEDodo selecionado: de ${startDate} a ${endDate}`);
      const dados = await relatorioMotorista(startDate, endDate);
      reply.status(200).send(dados);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Erro ao listar CTe" });
    }
  });
  fastify2.get("/relatorio/diario", async (request, reply) => {
    try {
      const { data } = request.query;
      if (!data) {
        return reply.status(400).send({ error: "Data s\xE3o necess\xE1rios" });
      }
      const dados = await relatorioDiario(data);
      reply.status(200).send(dados);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify2.get("/relatorio/semanal", async (request, reply) => {
    try {
      const { data } = request.query;
      if (!data) {
        return reply.status(400).send({ error: "Data \xE9 necess\xE1ria" });
      }
      const dataInicial = (0, import_dayjs.default)(data);
      if (!dataInicial.isValid()) {
        return reply.status(400).send({ error: "Data inv\xE1lida" });
      }
      const primeiroDiaDaSemana = dataInicial.startOf("week");
      const resultadosSemanais = [];
      let diaAtual = primeiroDiaDaSemana;
      for (let i = 0; i < 7; i++) {
        const dataDia = diaAtual.format("YYYY-MM-DD");
        const relatorio = await relatorioDiario(dataDia);
        resultadosSemanais.push({
          dia: dataDia,
          totalVolumes: relatorio.totalVolumes,
          totalEntregues: relatorio.totalEntregues,
          totalCarros: relatorio.totalCarros
        });
        diaAtual = diaAtual.add(1, "day");
      }
      reply.status(200).send(resultadosSemanais);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Falha ao gerar relat\xF3rio semanal" });
    }
  });
  fastify2.get("/relatorio/mensal", async (request, reply) => {
    try {
      const { mes, ano } = request.query;
      if (!mes || !ano) {
        return reply.status(400).send({ error: "M\xEAs e ano s\xE3o necess\xE1rios" });
      }
      const mesNumero = parseInt(mes, 10);
      const anoNumero = parseInt(ano, 10);
      if (mesNumero < 1 || mesNumero > 12) {
        return reply.status(400).send({ error: "M\xEAs inv\xE1lido" });
      }
      const primeiroDiaDoMes = (0, import_dayjs.default)(new Date(anoNumero, mesNumero - 1, 1));
      const hoje = (0, import_dayjs.default)();
      const ultimoDiaDoMes = hoje.month() + 1 === mesNumero && hoje.year() === anoNumero ? hoje.subtract(1, "day") : primeiroDiaDoMes.endOf("month");
      const resultadosMensais = [];
      let diaAtual = primeiroDiaDoMes;
      while (diaAtual.isBefore(ultimoDiaDoMes) || diaAtual.isSame(ultimoDiaDoMes, "day")) {
        const dataDia = diaAtual.format("YYYY-MM-DD");
        const relatorio = await relatorioDiario(dataDia);
        resultadosMensais.push({
          dia: dataDia,
          totalVolumes: relatorio.totalVolumes,
          totalEntregues: relatorio.totalEntregues,
          totalCarros: relatorio.totalCarros
        });
        diaAtual = diaAtual.add(1, "day");
      }
      return reply.status(200).send(resultadosMensais);
    } catch (error) {
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });
  fastify2.post("/relatorio/mensal/salvar", async (request, reply) => {
    try {
      const {
        data: date,
        totalEntregas,
        motoristasUnicos,
        placasUnicas
      } = request.body;
      const day = parseInt(date.slice(0, 2));
      const month = parseInt(date.slice(2, 4)) - 1;
      const year = 2e3 + parseInt(date.slice(4, 6));
      const parsedDate = new Date(year, month, day);
      const response = await prisma6.relatorioMensal.create({
        data: {
          data: parsedDate,
          totalEntregas: totalEntregas.toString(),
          motoristasUnicos: motoristasUnicos.toString(),
          placasUnicas: placasUnicas.toString()
        }
      });
      console.log(response);
      return reply.status(200).send();
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });
  function parseDateToDateTime(dateString) {
    const [day, month, year] = dateString.split("/").map(Number);
    const fullYear = year < 100 ? 2e3 + year : year;
    return new Date(fullYear, month - 1, day);
  }
  fastify2.post("/relatorio/performance/salvar", async (request, reply) => {
    try {
      const {
        data: date,
        totalEntregue,
        totalNaoEntregue,
        placaMotorista,
        nomeMotorista
      } = request.body;
      if (date === "") {
        return reply.status(200).send();
      }
      const parsedDate = parseDateToDateTime(date);
      const response = await prisma6.relatorioPerformance.create({
        data: {
          data: parsedDate,
          totalEntregue: totalEntregue.toString(),
          totalNaoEntregue: totalNaoEntregue.toString(),
          nomeMotorista: nomeMotorista.toString(),
          placaMotorista: placaMotorista.toString()
        }
      });
      console.log(response);
      return reply.status(200).send();
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });
  fastify2.post("/relatorio/performance/salvar/diario", async (request, reply) => {
    try {
      const {
        data: date,
        totalEntregue,
        totalNaoEntregue,
        placaMotorista,
        nomeMotorista
      } = request.body;
      if (date === "") {
        return reply.status(200).send();
      }
      const parsedDate = parseDateToDateTime(date);
      await prisma6.relatorioPerformance.deleteMany({ where: { data: parsedDate, nomeMotorista, placaMotorista } });
      const response = await prisma6.relatorioPerformance.create({
        data: {
          data: parsedDate,
          totalEntregue: totalEntregue.toString(),
          totalNaoEntregue: totalNaoEntregue.toString(),
          nomeMotorista: nomeMotorista.toString(),
          placaMotorista: placaMotorista.toString()
        }
      });
      console.log(response);
      return reply.status(200).send();
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });
  fastify2.get("/relatorio/mensal/listar", async (request, reply) => {
    try {
      const { mes, ano } = request.query;
      if (!mes || !ano) {
        return reply.status(400).send({ error: "M\xEAs e ano s\xE3o necess\xE1rios" });
      }
      const mesNumero = parseInt(mes, 10);
      const anoNumero = parseInt(ano, 10);
      if (mesNumero < 1 || mesNumero > 12) {
        return reply.status(400).send({ error: "M\xEAs inv\xE1lido" });
      }
      const primeiroDiaDoMes = (0, import_dayjs.default)(new Date(anoNumero, mesNumero - 1, 1));
      const hoje = (0, import_dayjs.default)();
      const ultimoDiaDoMes = hoje.month() + 1 === mesNumero && hoje.year() === anoNumero ? hoje.subtract(1, "day") : primeiroDiaDoMes.endOf("month");
      const relatorios = await prisma6.relatorioMensal.findMany({
        where: {
          data: {
            gte: primeiroDiaDoMes.toDate(),
            lte: ultimoDiaDoMes.toDate()
          }
        },
        orderBy: {
          data: "asc"
        }
      });
      return reply.status(200).send(relatorios);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });
  fastify2.get("/relatorio/performance/listar", async (request, reply) => {
    try {
      const { from, to } = request.query;
      const ontem = (0, import_dayjs.default)().format("YYYY-MM-DD");
      let endDate;
      const startDate = from || ontem;
      if (!to || to === "undefined") {
        endDate = startDate;
      } else {
        endDate = to;
      }
      console.log(`Per\xEDodo selecionado: de ${startDate} a ${endDate}`);
      const dados = await relatorioMotorista(startDate, endDate);
      reply.status(200).send(dados);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Erro ao listar CTe" });
    }
  });
}

// src/controllers/CnpjCorreiosController.ts
function CNPJRoutes(fastify2, prisma6) {
  fastify2.post("/CNPJ", async (request, reply) => {
    try {
      const { CNPJ, idAtivo, desc } = request.body;
      const CNPJDATA = await prisma6.cnpjTb.create({
        data: { CNPJ, idAtivo, desc }
      });
      reply.code(201).send(CNPJDATA);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/CNPJ", async (request, reply) => {
    try {
      const CNPJs = await prisma6.cnpjTb.findMany();
      reply.send(CNPJs);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.get("/CNPJ/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const CNPJ = await prisma6.cnpjTb.findUnique({ where: { id } });
      if (CNPJ) {
        reply.send(CNPJ);
      } else {
        reply.code(404).send({ error: "CNPJ n\xE3o encontrada" });
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.put("/CNPJ/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { CNPJ, idAtivo, desc } = request.body;
      const _CNPJ = await prisma6.cnpjTb.update({
        where: { id },
        data: { CNPJ, idAtivo, desc }
      });
      reply.send(_CNPJ);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
  fastify2.delete("/CNPJ/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma6.cnpjTb.delete({ where: { id } });
      reply.code(204).send();
    } catch (error) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });
}

// src/controllers/notaFiscalController.ts
var headers4 = new Headers();
headers4.append("Content-Type", "application/json");
var PDFDocument2 = require("pdfkit");
var bwipjs2 = require("bwip-js");
function notaFiscalController(fastify2, prisma6) {
  fastify2.get(
    "/notaFiscal/listarPorPlaca",
    async (request, reply) => {
      try {
        const { placa } = request.query;
        const ctesMotorista = await prisma6.ctes.findMany({
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
    const doc = new PDFDocument2({ margin: 30 });
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
      bwipjs2.toBuffer(
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

// src/server.ts
var jobRunning = false;
var jobRelatorioRunning = false;
import_dotenv.default.config();
var fastify = (0, import_fastify.default)({
  logger: true
  //https: {
  //key: fs.readFileSync("/etc/letsencrypt/live/api.envioprime.com.br/privkey.pem"),
  //cert: fs.readFileSync("/etc/letsencrypt/live/api.envioprime.com.br/cert.pem"),
  // ca: fs.readFileSync("/etc/letsencrypt/live/api.envioprime.com.br/chain.pem"),
  //},
});
var prisma5 = new import_client5.PrismaClient();
fastify.addHook("onRequest", (request, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  done();
});
var port = 3e3;
statusRoutes(fastify);
motoristaRoutes(fastify, prisma5);
CNPJRoutes(fastify, prisma5);
cteRoutes(fastify, prisma5);
userRoutes(fastify, prisma5);
unidadeRoutes(fastify, prisma5);
dadosUsuariosRoutes(fastify, prisma5);
RelatorioRoutes(fastify, prisma5);
RouteRomaneioStockfy(fastify, prisma5);
circuitController(fastify, prisma5);
notaFiscalController(fastify, prisma5);
fastify.get("/", async (request, reply) => {
  reply.send({ status: (/* @__PURE__ */ new Date()).toISOString() + " - Servidor rodando corretamente vers\xE3o 1.2" });
});
import_node_cron.default.schedule("0 4 * * *", async () => {
  if (jobRunning) {
    return;
  }
  try {
    const unidades = await prisma5.unidade.findMany({
      where: {
        idAtivo: true
        // Somente as unidades ativas
      }
    });
    jobRunning = true;
    console.log("Iniciando job de busca de CTe...");
    const promessas = unidades.map((unidade) => {
      console.log(`Iniciando processamento da unidade: ${unidade.Unidade}`);
      return buscarEInserirCtesRecorrenteStatusId(unidade.Unidade);
    });
    await Promise.all(promessas);
    console.log("Job de busca de CTe conclu\xEDdo.");
  } catch (error) {
    console.error("Erro ao executar o job:", error);
  } finally {
    jobRunning = false;
    console.log("Job finalizado.");
  }
});
import_node_cron.default.schedule("* * 5-23 * * *", async () => {
  if (jobRunning) {
    return;
  }
  try {
    const unidades = await prisma5.unidade.findMany({
      where: {
        idAtivo: true
        // Somente as unidades ativas
      }
    });
    jobRunning = true;
    const promessas = unidades.map((unidade) => {
      return buscarEInserirCtesRecorrente(unidade.Unidade);
    });
    await Promise.all(promessas);
  } catch (error) {
    console.error("Erro ao executar o job:", error);
  } finally {
    jobRunning = false;
    console.log("Job finalizado.");
  }
});
import_node_cron.default.schedule("* * * * * *", async () => {
  if (jobRelatorioRunning) {
    return;
  }
  try {
    jobRelatorioRunning = true;
    console.log("Iniciando job de busca de CTe...");
    await AtualizarCtesRecorrente();
    console.log("Job de busca de CTe conclu\xEDdo.");
  } catch (error) {
    console.error("Erro ao executar o job:", error);
  } finally {
    jobRelatorioRunning = false;
    console.log("Job finalizado.");
  }
});
var start = async () => {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log("\x1B[33m%s\x1B[0m", "Running in Production Mode");
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
