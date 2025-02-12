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
  buscarEInserirCtesRecorrente: () => buscarEInserirCtesRecorrente,
  buscarEInserirCtesRecorrenteStatusId: () => buscarEInserirCtesRecorrenteStatusId
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
  trackingdanfe: `${API_BASE_URL}/trackingdanfe`,
  // Endpoint para roteirizar um romaneio
  getCircuitBase: `${API_CIRCUIT_BASE_URL}`
};

// src/services/cteService.ts
var prisma = new import_client.PrismaClient();
var cacheCtes = /* @__PURE__ */ new Map();
async function GenerateToken() {
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
    await prisma.log.create({
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
        const existingCTe = await prisma.ctes.findFirst({
          where: {
            chaveCTe: cte.chaveCTe,
            nroCTRC: cte.nroCTRC
          }
        });
        if (existingCTe) {
          if (existingCTe.placaVeiculo.toUpperCase() != cte.placaVeiculo.toUpperCase()) {
            let motoristaData;
            if (cte.cpfMotorista && cte.nomeMotorista) {
              motoristaData = await prisma.motorista_ssw.upsert({
                where: { cpf: cte.cpfMotorista },
                update: {},
                create: {
                  cpf: cte.cpfMotorista,
                  nome: cte.nomeMotorista
                }
              });
            }
            updatePromises.push(
              prisma.ctes.update({
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
              prisma.ctes.update({
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
          let recebedor = await prisma.recebedor.findFirst({
            where: {
              cnpjCPF: cte.recebedor.cnpjCPF,
              nome: cte.recebedor.nome,
              endereco: cte.recebedor.endereco,
              cep: cte.recebedor.cep,
              numero: cte.recebedor.numero
            }
          });
          if (!recebedor) {
            recebedor = await prisma.recebedor.create({
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
          await prisma.ctes.create({
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
    await prisma.log.create({
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
    const motoristaData = await prisma.motorista_ssw.upsert({
      where: { cpf: cte.cpfMotorista },
      update: {},
      create: {
        cpf: cte.cpfMotorista,
        nome: cte.nomeMotorista
      }
    });
    const remetenteData = await prisma.remetente.upsert({
      where: { cnpjCPF: cte.remetente.cnpjCPF },
      update: {},
      create: {
        cnpjCPF: cte.remetente.cnpjCPF,
        nome: cte.remetente.nome,
        tipo: cte.remetente.tipo
      }
    });
    const destinatarioData = await prisma.destinatario.upsert({
      where: { cnpjCPF: cte.destinatario.cnpjCPF },
      update: {},
      create: {
        cnpjCPF: cte.destinatario.cnpjCPF,
        nome: cte.destinatario.nome,
        tipo: cte.destinatario.tipo
      }
    });
    const recebedorExistente = await prisma.recebedor.findMany({
      where: { cnpjCPF: cte.recebedor.cnpjCPF }
    });
    const registroIgual = recebedorExistente.find(
      (recebedor) => recebedor.nome === cte.recebedor.nome && recebedor.tipo === cte.recebedor.tipo && recebedor.endereco === cte.recebedor.endereco && recebedor.numero === cte.recebedor.numero && recebedor.bairro === cte.recebedor.bairro && recebedor.cep === cte.recebedor.cep.toString() && recebedor.cidade === cte.recebedor.cidade && recebedor.uf === cte.recebedor.uf && recebedor.foneContato === cte.recebedor.foneContato
    );
    let recebedorId;
    if (registroIgual) {
      recebedorId = registroIgual.id;
    } else {
      const novoRecebedor = await prisma.recebedor.create({
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
    await prisma.ctes.create({
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
    await prisma.ctes.updateMany({
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
    const motorista = await prisma.motorista_ssw.upsert({
      where: { cpf: cte.cpfMotorista },
      update: {
        nome: cte.nomeMotorista
      },
      create: {
        cpf: cte.cpfMotorista,
        nome: cte.nomeMotorista
      }
    });
    await prisma.ctes.updateMany({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buscarEInserirCtesRecorrente,
  buscarEInserirCtesRecorrenteStatusId
});
