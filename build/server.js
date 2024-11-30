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
var import_client4 = require("@prisma/client");

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
        console.log(driverId);
        const response = await fetch(`${endpoints.getCircuitBase}/${driverId}`, {
          method: "GET",
          headers
        });
        if (response.ok) {
          const driverData = await response.json();
          driversWithDetails.push({
            id: motorista.id,
            idCircuit: motorista.idCircuit,
            placa: motorista.placa,
            name: driverData.name,
            email: driverData.email,
            active: driverData.active
          });
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
function motoristaRoutes(fastify2, prisma5) {
  fastify2.post("/Motorista", async (request, reply) => {
    try {
      console.log("Request body:", request.body);
      const { placa, idCircuit } = request.body;
      const Motorista = await prisma5.motorista.create({
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
      const Motorista = await prisma5.motorista.findUnique({ where: { id: Number(id) } });
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
      const Motorista = await prisma5.motorista.update({
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
      await prisma5.motorista.delete({ where: { id: Number(id) } });
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
function cteRoutes(fastify2, prisma5) {
  fastify2.post("/ctes", async (request, reply) => {
    const {
      chaveCTe,
      valorFrete,
      nomeMotorista,
      cpfMotorista,
      placaVeiculo,
      previsaoEntrega,
      remetente,
      destinatario,
      recebedor
    } = request.body;
    try {
      const motorista = await prisma5.motorista_ssw.upsert({
        where: { cpf: cpfMotorista },
        update: {},
        create: {
          nome: nomeMotorista,
          cpf: cpfMotorista
        }
      });
      const remetenteEntity = await prisma5.remetente.upsert({
        where: { cnpjCPF: remetente.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: remetente.cnpjCPF,
          tipo: remetente.tipo,
          nome: remetente.nome
        }
      });
      const destinatarioEntity = await prisma5.destinatario.upsert({
        where: { cnpjCPF: destinatario.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: destinatario.cnpjCPF,
          tipo: destinatario.tipo,
          nome: destinatario.nome
        }
      });
      const recebedorEntity = await prisma5.recebedor.upsert({
        where: { cnpjCPF: recebedor.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: recebedor.cnpjCPF,
          tipo: recebedor.tipo,
          nome: recebedor.nome,
          endereco: recebedor.endereco,
          numero: recebedor.numero,
          bairro: recebedor.bairro,
          cep: recebedor.cep,
          cidade: recebedor.cidade,
          uf: recebedor.uf,
          foneContato: recebedor.foneContato
        }
      });
      const cte = await prisma5.ctes.create({
        data: {
          chaveCTe,
          valorFrete,
          placaVeiculo,
          previsaoEntrega,
          motoristaId: motorista.id,
          remetenteId: remetenteEntity.id,
          destinatarioId: destinatarioEntity.id,
          recebedorId: recebedorEntity.id,
          statusId: 1
        }
      });
      reply.status(201).send(cte);
    } catch (error) {
      reply.status(500).send({ error: "Failed to create CTe" });
    }
  });
  fastify2.get("/quantidadeCtesPorStatusEUnidade", async (request, reply) => {
    try {
      const { status, unidade } = request.query;
      const ctes = await prisma5.ctes.findMany({
        where: {
          statusId: Number(status),
          Unidade: unidade.toUpperCase()
        },
        include: {
          motorista: true,
          // Incluir dados do motorista
          remetente: true,
          // Incluir dados do remetente
          destinatario: true,
          // Incluir dados do destinatário
          recebedor: true,
          // Incluir dados do recebedor
          status: true
          // Incluir dados do status
        }
      });
      reply.status(200).send(ctes);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
  fastify2.put("/CTES", async (request, reply) => {
    try {
      const { status, id } = request.body;
      const ctes = await prisma5.ctes.update({
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
      const log = await prisma5.log.findFirst({
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
      await prisma5.ctes.deleteMany();
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

// src/controllers/LoginController.ts
var fetch2 = require("node-fetch");
function userRoutes(fastify2, prisma5) {
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
function RouteRomaneioStockfy(fastify2, prisma5) {
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
function circuitController(fastify2) {
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
}

// src/server.ts
var import_dotenv = __toESM(require("dotenv"));
var import_node_cron = __toESM(require("node-cron"));

// src/services/cteService.ts
var import_client3 = require("@prisma/client");
var prisma3 = new import_client3.PrismaClient();
async function buscarEInserirCtesRecorrente(UNIDADE) {
  try {
    const camposNecessarios = ["username", "password", "cnpj_edi", "domain"];
    const ultimoLog = await prisma3.log.findFirst({
      orderBy: {
        createdAt: "desc"
        // Ordenar pelo campo de data de criação
      }
    });
    if (ultimoLog) {
      const hoje = /* @__PURE__ */ new Date();
      const ultimoLogDate = new Date(ultimoLog.createdAt);
      ultimoLogDate.setHours(0, 0, 0, 0);
      const ontem = new Date(hoje);
      ontem.setDate(hoje.getDate() - 1);
      ontem.setHours(0, 0, 0, 0);
      if (ultimoLogDate.getTime() === ontem.getTime()) {
        await prisma3.ctes.deleteMany();
        console.log("Tabela cte apagada.");
      }
    }
    const motoristasSalvos = await prisma3.motorista.findMany({
      select: {
        placa: true
      }
    });
    const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
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
    const camposFaltantes = camposNecessarios.filter((campo) => !(campo in authDados));
    if (camposFaltantes.length > 0) {
      console.log(`Os seguintes campos est\xE3o faltando: ${camposFaltantes.join(", ")}`);
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
    const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${UNIDADE}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      }
    });
    let text = await response.text();
    text = text.replace(/"cep":(\d+)/g, (match, p1) => `"cep":"${p1}"`);
    let parsedData = JSON.parse(text);
    const ctes = parsedData?.ctes ?? [];
    let ctesFiltrados = [];
    if (ctes.length > 0) {
      ctesFiltrados = ctes.filter((cte) => placasSalvas.includes(cte.placaVeiculo));
      for (const cte of ctesFiltrados) {
        const existingCTe = await prisma3.ctes.findFirst({
          where: {
            chaveCTe: cte.chaveCTe,
            nroCTRC: cte.nroCTRC
          }
        });
        if (existingCTe) {
          await prisma3.ctes.update({
            where: { id: existingCTe.id },
            data: {}
          });
        } else {
          await prisma3.ctes.create({
            data: {
              chaveCTe: cte.chaveCTe,
              Unidade: UNIDADE,
              nroCTRC: cte.nroCTRC,
              valorFrete: cte.valorFrete,
              placaVeiculo: cte.placaVeiculo,
              previsaoEntrega: cte.previsaoEntrega,
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
                connectOrCreate: {
                  where: { cnpjCPF: cte.recebedor.cnpjCPF },
                  create: {
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
                }
              },
              status: {
                connect: {
                  id: 1
                }
              }
            }
          });
        }
      }
    }
    await prisma3.log.create({
      data: {
        desc: `Foram inseridos ${ctesFiltrados.length} CTe(s) novos`,
        tp: `AGENDADOR-${UNIDADE}`
      }
    });
    console.log(`Foram inseridos ${ctesFiltrados.length} CTe(s) novos`);
  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  }
}

// src/controllers/UnidadeController.ts
function unidadeRoutes(fastify2, prisma5) {
  fastify2.post("/Unidade", async (request, reply) => {
    try {
      const { Unidade, idAtivo, desc } = request.body;
      const unidade = await prisma5.unidade.create({
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
      const unidades = await prisma5.unidade.findMany();
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
      const unidade = await prisma5.unidade.findUnique({ where: { id } });
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
      const unidade = await prisma5.unidade.update({
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
      await prisma5.unidade.delete({ where: { id } });
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
function dadosUsuariosRoutes(fastify2, prisma5) {
  fastify2.post("/DadosUsuario", async (request, reply) => {
    try {
      const { tpDados, vlDados } = request.body;
      const dadosUsuario = await prisma5.dadosUsuario.create({
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
      const dadosUsuarios = await prisma5.dadosUsuario.findMany();
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
      const dadosUsuario = await prisma5.dadosUsuario.findUnique({ where: { id } });
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
      const dadosUsuario = await prisma5.dadosUsuario.findUnique({ where: { tpDados } });
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
      const dadosUsuario = await prisma5.dadosUsuario.update({
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
      await prisma5.dadosUsuario.delete({ where: { id } });
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

// src/server.ts
var jobRunning = false;
import_dotenv.default.config();
var fastify = (0, import_fastify.default)({ logger: true });
var prisma4 = new import_client4.PrismaClient();
fastify.addHook("onRequest", (request, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  done();
});
var port = 3e3;
statusRoutes(fastify);
motoristaRoutes(fastify, prisma4);
cteRoutes(fastify, prisma4);
userRoutes(fastify, prisma4);
unidadeRoutes(fastify, prisma4);
dadosUsuariosRoutes(fastify, prisma4);
RouteRomaneioStockfy(fastify, prisma4);
circuitController(fastify);
fastify.get("/", async (request, reply) => {
  reply.send({ status: "Servidor rodando corretamente" });
});
import_node_cron.default.schedule("*/1 * * * *", async () => {
  if (jobRunning) {
    console.log("O job j\xE1 est\xE1 em execu\xE7\xE3o. Ignorando nova execu\xE7\xE3o.");
    return;
  }
  try {
    const unidades = await prisma4.unidade.findMany({
      where: {
        idAtivo: true
        // Somente as unidades ativas
      }
    });
    jobRunning = true;
    console.log("Iniciando job de busca de CTe...");
    const promessas = unidades.map((unidade) => {
      console.log(`Iniciando processamento da unidade: ${unidade.Unidade}`);
      return buscarEInserirCtesRecorrente(unidade.Unidade);
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
var start = async () => {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Servidor rodando na porta ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
