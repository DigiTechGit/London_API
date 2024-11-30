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

// src/services/cteService.ts
var cteService_exports = {};
__export(cteService_exports, {
  buscarEInserirCtesRecorrente: () => buscarEInserirCtesRecorrente
});
module.exports = __toCommonJS(cteService_exports);
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

// src/services/cteService.ts
var prisma = new import_client.PrismaClient();
async function buscarEInserirCtesRecorrente(UNIDADE) {
  try {
    const camposNecessarios = ["username", "password", "cnpj_edi", "domain"];
    const ultimoLog = await prisma.log.findFirst({
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
        await prisma.ctes.deleteMany();
        console.log("Tabela cte apagada.");
      }
    }
    const motoristasSalvos = await prisma.motorista.findMany({
      select: {
        placa: true
      }
    });
    const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
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
        const existingCTe = await prisma.ctes.findFirst({
          where: {
            chaveCTe: cte.chaveCTe,
            nroCTRC: cte.nroCTRC
          }
        });
        if (existingCTe) {
          await prisma.ctes.update({
            where: { id: existingCTe.id },
            data: {}
          });
        } else {
          await prisma.ctes.create({
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
    await prisma.log.create({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buscarEInserirCtesRecorrente
});
