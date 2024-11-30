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
  getCircuitBase: `${API_CIRCUIT_BASE_URL}`
};

// src/controllers/circuitController.ts
var apiKey = process.env.API_KEY;
var headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", `Basic ${btoa(`${apiKey}:`)}`);
function circuitController(fastify) {
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
}
