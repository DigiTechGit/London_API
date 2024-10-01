// services/cteService.ts
import { PrismaClient } from '@prisma/client';
import { endpoints } from "../utils/API";
import { Motorista } from '@prisma/client';
import { Cte } from '../types/cte';

const prisma = new PrismaClient();

export async function buscarEInserirCtesRecorrente(UNIDADE: string) {
  try {
    const motoristasSalvos = await prisma.motorista.findMany({
      select: {
        placa: true,
      },
    });
    console.log(motoristasSalvos)
    const placasSalvas = motoristasSalvos.map(motorista => motorista.placa);

    const authResponse = await fetch(endpoints.generateToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: 'RED',
        username: 'emerson',
        password: 'emerson2',
        cnpj_edi: '27221173000358',
      }),
    });

    console.log(authResponse)
    const authData = await authResponse.json();


    const token = authData.token;
    const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${UNIDADE}`;

    // Faz a requisição para a API externa usando a função fornecida
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    let text = await response.text();

    // Corrige os valores numéricos de cep para strings no texto (com regex)
    text = text.replace(/"cep":(\d+)/g, (match: any, p1: any) => `"cep":"${p1}"`);

    let parsedData = JSON.parse(text);

    const ctes: Cte[] = parsedData.ctes;

    const ctesFiltrados = ctes.filter(cte => placasSalvas.includes(cte.placaVeiculo));

    for (const cte of ctesFiltrados) {

      const [day, month, year] = cte.previsaoEntrega.split('/');
      const dataPrevisao = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      await prisma.ctes.upsert({
        where: { chaveCTe: cte.chaveCTe },
        update: {},
        create: {
          chaveCTe: cte.chaveCTe,
          Unidade: UNIDADE,
          valorFrete: cte.valorFrete,
          placaVeiculo: cte.placaVeiculo,
          previsaoEntrega: dataPrevisao,
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
              id: 1, // O ID do status que você deseja conectar
            },
          },
        },
      });
    }
    

    console.log(`Foram inseridos ${ctesFiltrados.length} CTe(s) novos`);
  } catch (error) {
    console.log('Erro ao buscar e salvar CTe:', error);
  }
}
