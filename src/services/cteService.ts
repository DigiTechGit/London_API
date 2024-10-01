// services/cteService.ts
import { PrismaClient } from '@prisma/client';
import { endpoints } from "../utils/API";
import { Motorista } from '@prisma/client';
import { Cte } from '../types/cte';

const prisma = new PrismaClient();

export async function buscarEInserirCtesRecorrente() {
  try {
    // Faz a requisição para a API externa usando a função fornecida
    const response = await fetch(`${endpoints.roteirizaRomaneioStockfy}?siglaEnt=CTE`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Falha ao buscar dados da API externa');
      return;
    }

    const data = await response.json();
    const ctes: Cte[] = data.ctes;

    // Pega todas as placas de motoristas salvos no banco de dados
    const motoristasSalvos = await prisma.motorista.findMany({
      select: {
        placa: true,
      },
    });

    const placasSalvas = motoristasSalvos.map(motorista => motorista.placa);

    // Filtra os CTe que correspondem às placas salvas
    const ctesFiltrados = ctes.filter(cte => placasSalvas.includes(cte.placaVeiculo));

    for (const cte of ctesFiltrados) {
      // Verifica se o CTe já está salvo
      const cteExistente = await prisma.ctes.findUnique({
        where: {
          chaveCTe: cte.chaveCTe,
        },
      });

      // Se não está salvo, insere o CTe no banco
      if (!cteExistente) {
        await prisma.ctes.create({
          data: {
            chaveCTe: cte.chaveCTe,
            valorFrete: cte.valorFrete,
            placaVeiculo: cte.placaVeiculo,
            previsaoEntrega: new Date(cte.previsaoEntrega),
            motorista: { 
              connectOrCreate: {
                where: { cpf: cte.cpfMotorista },
                create: { 
                  cpf: cte.cpfMotorista, 
                  nome: cte.nomeMotorista,
                }
              },
            },
            remetente: {
              connectOrCreate: {
                where: { cnpjCPF: cte.remetente.cnpjCPF },
                create: {
                  cnpjCPF: cte.remetente.cnpjCPF,
                  nome: cte.remetente.nome,
                  tipo: cte.remetente.tipo,
                },
              },
            },
            destinatario: {
              connectOrCreate: {
                where: { cnpjCPF: cte.destinatario.cnpjCPF },
                create: {
                  cnpjCPF: cte.destinatario.cnpjCPF,
                  nome: cte.destinatario.nome,
                  tipo: cte.destinatario.tipo,
                },
              },
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
                  foneContato: cte.recebedor.foneContato,
                },
              },
            },
            status: {
              connect: {
                id: 2, // O ID do status que você deseja conectar
              },
            },
          },
        });
      }
    }

    console.log(`Foram inseridos ${ctesFiltrados.length} CTe(s) novos`);
  } catch (error) {
    console.error('Erro ao buscar e salvar CTe:', error);
  }
}
