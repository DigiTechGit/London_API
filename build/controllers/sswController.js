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

// src/controllers/sswController.ts
var sswController_exports = {};
__export(sswController_exports, {
  default: () => RouteRomaneioStockfy
});
module.exports = __toCommonJS(sswController_exports);

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

// src/controllers/sswController.ts
var fetch = require("node-fetch");
function RouteRomaneioStockfy(fastify, prisma) {
  fastify.options("*", (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    reply.send();
  });
  fastify.get(
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
