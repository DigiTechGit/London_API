import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { FastifyInstance } from "fastify";

interface RelatorioMotorista {
  motorista: string;
  entregue: number;
  naoEntregue: number;
}

export default function RelatorioRoutes(
  fastify: FastifyInstance,
  prisma: PrismaClient
) {
  const relatorioDiario = async (date: string) => {
    try {
      const dataInicio = dayjs(date).startOf("day");
      const dataFim = dayjs(date).endOf("day");

      const ctes = await prisma.ctes.findMany({
        where: {
          dt_alteracao: {
            gte: dataInicio.toDate(),
            lte: dataFim.toDate(),
          },
          codUltOco: { gt: 0 },
        },
        select: {
          placaVeiculo: true,
          codUltOco: true,
        },
      });

      const entregaStatusCodes = new Set([1]);

      // Filtrar os registros onde o tipo de processo é "ENTREGA" e o código de status está no conjunto de entregaStatusCodes
      const entregas = ctes.filter((cte) =>
        entregaStatusCodes.has(cte.codUltOco)
      );

      const totalEntregues = entregas.length;

      const placasUnicas = new Set(ctes.map((cte) => cte.placaVeiculo));
      const totalCarros = placasUnicas.size;

      const statusMap: Record<number, string> = {
        1: "MERCADORIA ENTREGUE",
        2: "MERCADORIA PRE-ENTREGUE (MOBILE)",
        3: "MERCADORIA DEVOLVIDA AO REMETENTE",
        4: "DESTINATARIO RETIRA",
        5: "CLIENTE ALEGA MERCAD DESACORDO C/ PEDIDO",
        7: "CHEGADA NO CLIENTE DESTINATÁRIO",
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
        25: "REMETENTE RECUSA RECEBER DEVOLUÇÃO",
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
        48: "EDI FOI RECEPCIONADO MAS A MERCADORIA NÃO",
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
        61: "MERCADORIA CONFISCADA PELA FISCALIZAÇÃO",
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
        95: "PREVISÃO DE ENTREGA ALTERADA",
        99: "CTRC BAIXADO/CANCELADO",
      };

      // Contadores de status
      const statusCount: Record<string, number> = {};

      ctes.forEach((cte) => {
        const descricao = statusMap[cte.codUltOco] || "OUTRO";
        statusCount[descricao] = (statusCount[descricao] || 0) + 1;
      });

      return {
        totalVolumes: ctes.length,
        totalEntregues,
        totalCarros,
        status: statusCount, // Retorna os números por status
      };
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const relatorioMotorista = async (from: string, to: string) => {
    try {
      const dataInicio = dayjs(from).startOf("day"); // Início do intervalo
      const dataFim = dayjs(to).endOf("day"); // Fim do intervalo

      const relatorios = await prisma.relatorioPerformance.findMany({
        where: {
          data: {
            gte: dataInicio.toDate(),
            lte: dataFim.toDate(),
          },
        },
      });

      // Objeto para armazenar dados agregados por motorista
      const entregasPorMotorista: Record<string, RelatorioMotorista> = {};

      relatorios.forEach((relatorio) => {
        const { nomeMotorista, totalEntregue, totalNaoEntregue } = relatorio;

        if (!entregasPorMotorista[nomeMotorista]) {
          // Inicializa os dados do motorista, se ainda não estiver no objeto
          entregasPorMotorista[nomeMotorista] = {
            motorista: nomeMotorista,
            entregue: 0,
            naoEntregue: 0,
          };
        }

        // Converte os valores para números (caso venham como strings)
        entregasPorMotorista[nomeMotorista].entregue += Number(totalEntregue);
        entregasPorMotorista[nomeMotorista].naoEntregue += Number(totalNaoEntregue);
      });

      // Retorna os dados agregados por motorista como uma lista
      return Object.values(entregasPorMotorista);
    } catch (error) {
      console.error("Erro ao gerar relatório do motorista:", error);
      throw new Error("Falha ao gerar o relatório");
    }
  };

  fastify.get("/relatorio/motorista", async (request, reply) => {
    try {
      const { from, to } = request.query as { from?: string; to?: string };

      const ontem = dayjs().subtract(1, "day").format("YYYY-MM-DD");

      let endDate: string | undefined;

      const startDate = from || ontem;

      if (to === "undefined") {
        endDate = startDate;
      } else {
        endDate = to!;
      }

      console.log(`Período selecionado: de ${startDate} a ${endDate}`);

      const dados = await relatorioMotorista(startDate, endDate);

      reply.status(200).send(dados);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Erro ao listar CTe" });
    }
  });

  fastify.get("/relatorio/diario", async (request, reply) => {
    try {
      const { data } = request.query as { data: string };
      // Obtém os CTe com codUltOco = 1
      if (!data) {
        return reply.status(400).send({ error: "Data são necessários" });
      }

      const dados = await relatorioDiario(data);

      // Envia a resposta com as informações
      reply.status(200).send(dados);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });

  fastify.get("/relatorio/semanal", async (request, reply) => {
    try {
      const { data } = request.query as { data: string };

      // Verifica se a data foi fornecida
      if (!data) {
        return reply.status(400).send({ error: "Data é necessária" });
      }

      // Converte a data recebida para um objeto Day.js
      const dataInicial = dayjs(data); // Data inicial da semana (dia fornecido)

      if (!dataInicial.isValid()) {
        return reply.status(400).send({ error: "Data inválida" });
      }

      const primeiroDiaDaSemana = dataInicial.startOf("week");

      const resultadosSemanais = [];

      let diaAtual = primeiroDiaDaSemana;
      for (let i = 0; i < 7; i++) {
        const dataDia = diaAtual.format("YYYY-MM-DD");

        // Chama a função relatorioDiario para cada dia da semana
        const relatorio = await relatorioDiario(dataDia);

        resultadosSemanais.push({
          dia: dataDia,
          totalVolumes: relatorio!.totalVolumes,
          totalEntregues: relatorio!.totalEntregues,
          totalCarros: relatorio!.totalCarros,
        });

        // Adiciona um dia para o próximo loop
        diaAtual = diaAtual.add(1, "day");
      }

      reply.status(200).send(resultadosSemanais);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Falha ao gerar relatório semanal" });
    }
  });

  fastify.get("/relatorio/mensal", async (request, reply) => {
    try {
      const { mes, ano } = request.query as { mes: string; ano: string }; // Supondo que a data seja fornecida como 'mes' e 'ano' na query

      // Verifica se o mês e ano foram fornecidos
      if (!mes || !ano) {
        return reply.status(400).send({ error: "Mês e ano são necessários" });
      }

      // Converte mês e ano para números
      const mesNumero = parseInt(mes, 10);
      const anoNumero = parseInt(ano, 10);

      // Verifica se o mês está no intervalo correto
      if (mesNumero < 1 || mesNumero > 12) {
        return reply.status(400).send({ error: "Mês inválido" });
      }

      // Calcula o primeiro dia do mês
      const primeiroDiaDoMes = dayjs(new Date(anoNumero, mesNumero - 1, 1)); // Primeiro dia do mês

      // Calcula o último dia do mês ou o dia de ontem caso o mês seja o atual
      const hoje = dayjs();
      const ultimoDiaDoMes =
        hoje.month() + 1 === mesNumero && hoje.year() === anoNumero
          ? hoje.subtract(1, "day")
          : primeiroDiaDoMes.endOf("month");

      const resultadosMensais = [];

      let diaAtual = primeiroDiaDoMes;
      while (
        diaAtual.isBefore(ultimoDiaDoMes) ||
        diaAtual.isSame(ultimoDiaDoMes, "day")
      ) {
        const dataDia = diaAtual.format("YYYY-MM-DD");

        const relatorio = await relatorioDiario(dataDia);
        resultadosMensais.push({
          dia: dataDia,
          totalVolumes: relatorio!.totalVolumes,
          totalEntregues: relatorio!.totalEntregues,
          totalCarros: relatorio!.totalCarros,
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
        placasUnicas,
      } = request.body as {
        data: string;
        totalEntregas: string;
        motoristasUnicos: string;
        placasUnicas: string;
      };

      // Usa slice para extrair partes da data
      const day = parseInt(date.slice(0, 2)); // Pega os 2 primeiros caracteres (dia)
      const month = parseInt(date.slice(2, 4)) - 1; // Pega os 2 seguintes (mês) - 1 porque o JS considera 0 como janeiro
      const year = 2000 + parseInt(date.slice(4, 6)); // Pega os últimos 2 caracteres (ano) e ajusta para o ano 2000+

      // Cria a data no formato correto
      const parsedDate = new Date(year, month, day);

      // Salva no banco
      const response = await prisma.relatorioMensal.create({
        data: {
          data: parsedDate,
          totalEntregas: totalEntregas.toString(),
          motoristasUnicos: motoristasUnicos.toString(),
          placasUnicas: placasUnicas.toString(),
        },
      });

      console.log(response);
      return reply.status(200).send();
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });

  function parseDateToDateTime(dateString: string) {
    const [day, month, year] = dateString.split("/").map(Number);
    // Adiciona 2000 ao ano se estiver no formato yy
    const fullYear = year < 100 ? 2000 + year : year;
    return new Date(fullYear, month - 1, day);
  }

  fastify.post("/relatorio/performance/salvar", async (request, reply) => {
    try {
      const {
        data: date,
        totalEntregue,
        totalNaoEntregue,
        placaMotorista,
        nomeMotorista,
      } = request.body as {
        data: string;
        totalEntregue: string;
        totalNaoEntregue: string;
        placaMotorista: string;
        nomeMotorista: string;
      };

      if (date === "") {
        return reply.status(200).send();
      }

      // Usa slice para extrair partes da data
      const parsedDate = parseDateToDateTime(date);
      // Cria a data no formato correto

      // Salva no banco
      const response = await prisma.relatorioPerformance.create({
        data: {
          data: parsedDate,
          totalEntregue: totalEntregue.toString(),
          totalNaoEntregue: totalNaoEntregue.toString(),
          nomeMotorista: nomeMotorista.toString(),
          placaMotorista: placaMotorista.toString(),
        },
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
        nomeMotorista,
      } = request.body as {
        data: string;
        totalEntregue: string;
        totalNaoEntregue: string;
        placaMotorista: string;
        nomeMotorista: string;
      };

      if (date === "") {
        return reply.status(200).send();
      }

      // Usa slice para extrair partes da data
      const parsedDate = parseDateToDateTime(date);
      // Cria a data no formato correto

      // Salva no banco
      await prisma.relatorioPerformance.deleteMany({where: {data: parsedDate, nomeMotorista: nomeMotorista, placaMotorista: placaMotorista}});

      const response = await prisma.relatorioPerformance.create({
        data: {
          data: parsedDate,
          totalEntregue: totalEntregue.toString(),
          totalNaoEntregue: totalNaoEntregue.toString(),
          nomeMotorista: nomeMotorista.toString(),
          placaMotorista: placaMotorista.toString(),
        },
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
      const { mes, ano } = request.query as { mes: string; ano: string }; // Supondo que a data seja fornecida como 'mes' e 'ano' na query
      // Verifica se o mês e ano foram fornecidos
      if (!mes || !ano) {
        return reply.status(400).send({ error: "Mês e ano são necessários" });
      }

      // Converte mês e ano para números
      const mesNumero = parseInt(mes, 10);
      const anoNumero = parseInt(ano, 10);

      // Verifica se o mês está no intervalo correto
      if (mesNumero < 1 || mesNumero > 12) {
        return reply.status(400).send({ error: "Mês inválido" });
      }

      const primeiroDiaDoMes = dayjs(new Date(anoNumero, mesNumero - 1, 1)); // Primeiro dia do mês

      // Calcula o último dia do mês ou o dia de ontem caso o mês seja o atual
      const hoje = dayjs();
      const ultimoDiaDoMes =
        hoje.month() + 1 === mesNumero && hoje.year() === anoNumero
          ? hoje.subtract(1, "day")
          : primeiroDiaDoMes.endOf("month");

      // Consulta no banco
      const relatorios = await prisma.relatorioMensal.findMany({
        where: {
          data: {
            gte: primeiroDiaDoMes.toDate(),
            lte: ultimoDiaDoMes.toDate(),
          },
        },
        orderBy: {
          data: "asc",
        },
      });

      return reply.status(200).send(relatorios);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });

  fastify.get("/relatorio/performance/listar", async (request, reply) => {
    try {
      const { from, to } = request.query as { from?: string; to?: string };

      const ontem = dayjs().format("YYYY-MM-DD");

      let endDate: string | undefined;

      const startDate = from || ontem;

      if (!to || to === "undefined") {
        endDate = startDate;
      } else {
        endDate = to!;
      }

      console.log(`Período selecionado: de ${startDate} a ${endDate}`);

      const dados = await relatorioMotorista(startDate, endDate);

      reply.status(200).send(dados);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Erro ao listar CTe" });
    }
  });
}
