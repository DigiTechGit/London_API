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

// src/services/motoristaService.ts
var motoristaService_exports = {};
__export(motoristaService_exports, {
  MotoristaService: () => MotoristaService
});
module.exports = __toCommonJS(motoristaService_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MotoristaService
});
