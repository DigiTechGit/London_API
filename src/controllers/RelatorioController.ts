import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import dayjs from 'dayjs';

export default function RelatorioRoutes(
  fastify: FastifyInstance,
  prisma: PrismaClient
) {
  const relatorioDiario = async (date: string) => {
    try {
      const dataInicio = dayjs(date).startOf('day'); 
      const dataFim = dayjs(date).endOf('day');
  
  
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 1,
          dt_alteracao: {
            gte: dataInicio.toDate(), 
            lte: dataFim.toDate(),
          },
        },
        select: {
          placaVeiculo: true,
        },
      });
  
      const totalEntregues = ctes.length;
  
      const placasUnicas = new Set(ctes.map(cte => cte.placaVeiculo));
      const totalCarros = placasUnicas.size;
    
      return {
        totalEntregues,
        totalCarros,
      };
    } catch (error) {
      console.error(error);
      return;
    }
  };

  fastify.get("/relatorio/diario", async (request, reply) => {
    try {
      const { data } = request.query as { data: string};
      // Obtém os CTe com codUltOco = 1
      if (!data ) {
        return reply.status(400).send({ error: "Data são necessários" });
      }

      const dados = await relatorioDiario( data );

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

    const primeiroDiaDaSemana = dataInicial.startOf('week'); 

    const resultadosSemanais = [];

    let diaAtual = primeiroDiaDaSemana;
    for (let i = 0; i < 7; i++) {
      const dataDia = diaAtual.format('YYYY-MM-DD');

      // Chama a função relatorioDiario para cada dia da semana
      const relatorio = await relatorioDiario(dataDia);
      
      resultadosSemanais.push({
        dia: dataDia,
        totalEntregues: relatorio!.totalEntregues,
        totalCarros: relatorio!.totalCarros,
      });

      // Adiciona um dia para o próximo loop
      diaAtual = diaAtual.add(1, 'day');
    }

    reply.status(200).send(resultadosSemanais);
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: "Falha ao gerar relatório semanal" });
  }
});

  fastify.get("/relatorio/mensal", async (request, reply) => {
    try {
      const { mes, ano } = request.query as { mes: string, ano: string }; // Supondo que a data seja fornecida como 'mes' e 'ano' na query
  
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
  
      // Calcula o primeiro e o último dia do mês
      const primeiroDiaDoMes = dayjs(new Date(anoNumero, mesNumero - 1, 1)); // Primeiro dia do mês
      const ultimoDiaDoMes = primeiroDiaDoMes.endOf('month'); // Último dia do mês
  
      const resultadosMensais = [];
  
      let diaAtual = primeiroDiaDoMes;
      while (diaAtual.isBefore(ultimoDiaDoMes) || diaAtual.isSame(ultimoDiaDoMes, 'day')) {
        const dataDia = diaAtual.format('YYYY-MM-DD');
        
        const relatorio = await relatorioDiario(dataDia);
        resultadosMensais.push({
          dia: dataDia,
          totalEntregues: relatorio!.totalEntregues,
          totalCarros: relatorio!.totalCarros,
        });
  
        diaAtual = diaAtual.add(1, 'day');
      }
  
      reply.status(200).send(resultadosMensais);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to generate monthly report" });
    }
  });
}
