"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controllers/RelatorioController.ts
var RelatorioController_exports = {};
__export(RelatorioController_exports, {
  default: () => RelatorioRoutes
});
module.exports = __toCommonJS(RelatorioController_exports);
var import_dayjs = __toESM(require("dayjs"));
function RelatorioRoutes(fastify, prisma) {
  const relatorioDiario = async (date) => {
    try {
      const dataInicio = (0, import_dayjs.default)(date).startOf("day");
      const dataFim = (0, import_dayjs.default)(date).endOf("day");
      const ctes = await prisma.ctes.findMany({
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
      const relatorios = await prisma.relatorioPerformance.findMany({
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
  fastify.get("/relatorio/motorista", async (request, reply) => {
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
  fastify.get("/relatorio/diario", async (request, reply) => {
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
  fastify.get("/relatorio/semanal", async (request, reply) => {
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
  fastify.get("/relatorio/mensal", async (request, reply) => {
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
  fastify.post("/relatorio/mensal/salvar", async (request, reply) => {
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
      const response = await prisma.relatorioMensal.create({
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
  fastify.post("/relatorio/performance/salvar", async (request, reply) => {
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
      const response = await prisma.relatorioPerformance.create({
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
  fastify.post("/relatorio/performance/salvar/diario", async (request, reply) => {
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
      await prisma.relatorioPerformance.deleteMany({ where: { data: parsedDate, nomeMotorista, placaMotorista } });
      const response = await prisma.relatorioPerformance.create({
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
  fastify.get("/relatorio/mensal/listar", async (request, reply) => {
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
      const relatorios = await prisma.relatorioMensal.findMany({
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
  fastify.get("/relatorio/performance/listar", async (request, reply) => {
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
