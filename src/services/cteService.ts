import { PrismaClient } from '@prisma/client';
import { endpoints } from "../utils/API";
import { Cte } from '../types/cte';

const prisma = new PrismaClient();

export async function buscarEInserirCtesRecorrente(UNIDADE: string) {
  try {
    const camposNecessarios = ['username', 'password', 'cnpj_edi', 'domain'];

    const motoristasSalvos = await prisma.motorista.findMany({
      select: {
        placa: true,
      },
    });

    const placasSalvas = motoristasSalvos.map(motorista => motorista.placa);
    const dados = await prisma.dadosUsuario.findMany({
      where: {
        tpDados: {
          in: camposNecessarios,
        },
      },
    });

    const authDados: Record<string, string> = {};
    dados.forEach((dado) => {
      authDados[dado.tpDados] = dado.vlDados;
    });

    const camposFaltantes = camposNecessarios.filter(campo => !(campo in authDados));

    if (camposFaltantes.length > 0) {
      console.log(`Os seguintes campos estão faltando: ${camposFaltantes.join(', ')}`);
      return
    }
    const authResponse = await fetch(endpoints.generateToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: authDados['domain'],
        username: authDados['username'],
        password: authDados['password'],
        cnpj_edi: authDados['cnpj_edi'],
      }),
    });


    const authData = await authResponse.json();

    const token = authData.token;
    const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${UNIDADE}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    let text = await response.text();

    text = text.replace(/"cep":(\d+)/g, (match: any, p1: any) => `"cep":"${p1}"`);

    let parsedData = JSON.parse(text);

    const ctes: Cte[] = parsedData?.ctes ?? [];

    let ctesFiltrados = [];

    let criados = 0;  
    let atualizados = 0;
    const dt_alteracao = new Date();

    if (ctes.length > 0) {
      ctesFiltrados = ctes.filter(cte => placasSalvas.includes(cte.placaVeiculo));
      for (const cte of ctesFiltrados) {
        const existingCTe = await prisma.ctes.findFirst({
          where: {
            chaveCTe: cte.chaveCTe,
            nroCTRC: cte.nroCTRC,
          },
        });

        if (existingCTe) {
          await prisma.ctes.update({
            where: { id: existingCTe.id },
            data: {dt_alteracao, codUltOco: cte.codUltOco },
          });
          atualizados++;
        } else {
          await prisma.ctes.create({
            data: {
              chaveCTe: cte.chaveCTe,
              Unidade: UNIDADE,
              nroCTRC: cte.nroCTRC,
              valorFrete: cte.valorFrete,
              dt_alteracao: dt_alteracao,
              placaVeiculo: cte.placaVeiculo,
              previsaoEntrega: cte.previsaoEntrega,
              codUltOco: cte.codUltOco,
              motorista: {
                connectOrCreate: {
                  where: { cpf: cte.cpfMotorista },
                  create: {
                    cpf: cte.cpfMotorista,
                    nome: cte.nomeMotorista,
                  },
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
                  id: 1,
                },
              },
            },
          });
          criados++;
        }
      }

    }

    await prisma.log.create({
      data: {
        desc: `Foram inseridos ${criados} CTe(s) novos e atualizados ${atualizados} CTe(s) existentes`,
        tp: `AGENDADOR-${UNIDADE}`,
        createdAt: dt_alteracao
      }
    })

    console.log(`Foram inseridos ${criados} CTe(s) novos e atualizados ${atualizados} CTe(s) existentes`);
  } catch (error) {
    console.log('Erro ao buscar e salvar CTe:', error);
  }
}
