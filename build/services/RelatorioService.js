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

// src/services/RelatorioService.ts
var RelatorioService_exports = {};
__export(RelatorioService_exports, {
  AtualizarCtesRecorrente: () => AtualizarCtesRecorrente
});
module.exports = __toCommonJS(RelatorioService_exports);
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

// src/services/RelatorioService.ts
var prisma = new import_client.PrismaClient();
var codigosNaoPrecisamAtualizar = [
  1
];
async function AtualizarCtesRecorrente() {
  try {
    const startTime = Date.now();
    const camposNecessarios = ["username", "password", "cnpj_edi", "domain"];
    const dados = await prisma.dadosUsuario.findMany({
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
    const ctesAtualizar = await prisma.ctes.findMany({
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
                console.warn(`${cte.id} Nenhum tracking encontrado para NF-e ${nota.chaveNFe}`);
                continue;
              }
              const ultimaOcorrencia = data.documento.tracking[data.documento.tracking.length - 1];
              const ocorrenciaTexto = ultimaOcorrencia.ocorrencia;
              const ocorrenciaData = ultimaOcorrencia.data_hora;
              const numeroOcorrencia = ocorrenciaTexto.match(/\((\d+)\)/)?.[1];
              if (numeroOcorrencia && cte.codUltOco != numeroOcorrencia) {
                await prisma.ctes.update({
                  where: { id: cte.id },
                  data: { codUltOco: parseInt(numeroOcorrencia), dt_alteracao: new Date(ocorrenciaData) }
                });
              }
            } catch (error) {
              console.error(`Erro na requisi\xE7\xE3o para NF-e ${nota.chaveNFe}:`, error);
            }
          }
        } else {
          await prisma.ctes.update({ where: { id: cte.id }, data: { codUltOco: 0 } });
        }
      }
      console.log("Atualiza\xE7\xF5es conclu\xEDdas.");
    };
    await processarCTEs();
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1e3;
    console.log(`Processo conclu\xEDdo em ${duration} segundos.`);
    await prisma.log.create({
      data: {
        desc: `Processo de atualiza\xE7\xE3o de CTEs conclu\xEDdo em ${duration} segundos.`,
        tp: `AGENDADOR`,
        createdAt: /* @__PURE__ */ new Date()
      }
    });
  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  } finally {
    await prisma.$disconnect();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AtualizarCtesRecorrente
});
