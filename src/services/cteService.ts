import { PrismaClient } from "@prisma/client";
import { endpoints } from "../utils/API";

const prisma = new PrismaClient();
const cacheCtes = new Map(); // Cache para armazenar CTes por unidade

export async function buscarEInserirCtesRecorrente(UNIDADE: string) {
  try {
    const camposNecessarios = ["username", "password", "cnpj_edi", "domain"];

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

    const camposFaltantes = camposNecessarios.filter(
      (campo) => !(campo in authDados)
    );

    if (camposFaltantes.length > 0) {
      console.log(
        `Os seguintes campos estão faltando: ${camposFaltantes.join(", ")}`
      );
      return;
    }

    const authResponse = await fetch(endpoints.generateToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: authDados["domain"],
        username: authDados["username"],
        password: authDados["password"],
        cnpj_edi: authDados["cnpj_edi"],
      }),
    });

    const authData = await authResponse.json();
    const startTimeAPI = Date.now();

    const token = authData.token;
    const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${UNIDADE}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    const endTimeAPI = Date.now();
    const durationAPI = (endTimeAPI - startTimeAPI) / 1000; 
    
    let text = await response.text();

    const startTime = Date.now();

    text = text.replace(/"cep":(\d+)/g, (match, p1) => `"cep":"${p1}"`);

    let parsedData = JSON.parse(text);

    const ctes = parsedData?.ctes ?? [];

    // Obter cache existente
    const cachedCtes = cacheCtes.get(UNIDADE) || [];
    const ctesNovos = ctes.filter((cte: { chaveCTe: any; nroCTRC: any; }) => {
      const existing = cachedCtes.find(
        (cached: { chaveCTe: any; nroCTRC: any; }) => cached.chaveCTe === cte.chaveCTe && cached.nroCTRC === cte.nroCTRC
      );

      if (existing) {
        prisma.ctes.updateMany({
          where: { chaveCTe: cte.chaveCTe, nroCTRC: cte.nroCTRC },
          data: { listarCTE: false },
        });
      }

      return !existing;
    });

    const ctesRemovidos = cachedCtes.filter(
      (cached: { chaveCTe: any; }) => !ctes.some((cte: { chaveCTe: any; }) => cte.chaveCTe === cached.chaveCTe)
    );

    // Atualizar os CTes que n�o est�o mais na API
    if (ctesRemovidos.length > 0) {
      for (const cte of ctesRemovidos) {
        await prisma.ctes.updateMany({
          where: { chaveCTe: cte.chaveCTe, nroCTRC: cte.nroCTRC },
          data: { listarCTE: false },
        });
      }
    }

    // Atualizar cache
    cacheCtes.set(UNIDADE, ctes);

    let criados = 0;
    let atualizados = 0;
    const dt_alteracao = new Date();
    const idsCriados = [];

    if (ctesNovos.length > 0) {
      const novosCtes = [];
      const updatePromises = [];

      const existingCTEs = await prisma.ctes.findMany({
        where: {
          chaveCTe: { in: ctesNovos.map((cte: { chaveCTe: any; }) => cte.chaveCTe) },
        },
      });
      const existingCTEsMap = new Map(existingCTEs.map((cte) => [cte.chaveCTe, cte]));

      for (const cte of ctesNovos) {
        const existingCTE = existingCTEsMap.get(cte.chaveCTe);

        if (existingCTE) {
          if (
            existingCTE.placaVeiculo.toUpperCase() !== cte.placaVeiculo.toUpperCase()
          ) {
            let motoristaData;
            if (cte.cpfMotorista && cte.nomeMotorista) {
              motoristaData = await prisma.motorista_ssw.upsert({
                where: { cpf: cte.cpfMotorista },
                update: {},
                create: {
                  cpf: cte.cpfMotorista,
                  nome: cte.nomeMotorista,
                },
              });
            }

            updatePromises.push(
              prisma.ctes.update({
                where: { id: existingCTE.id },
                data: {
                  dt_alteracao,
                  codUltOco: cte.codUltOco,
                  placaVeiculo: cte.placaVeiculo,
                  statusId: 1,
                  motoristaId: motoristaData?.id,
                },
              })
            );
          } else {
            updatePromises.push(
              prisma.ctes.update({
                where: { id: existingCTE.id },
                data: { dt_alteracao, codUltOco: cte.codUltOco },
              })
            );
          }
          atualizados++;
        } else {
          const motoristaData =  await prisma.motorista_ssw.upsert({
            where: { cpf: cte.cpfMotorista },
            update: {},
            create: {
              cpf: cte.cpfMotorista,
              nome: cte.nomeMotorista,
            },
          });

          const remetenteData = await prisma.remetente.upsert({
            where: { cnpjCPF: cte.remetente.cnpjCPF },
            update: {},
            create: {
              cnpjCPF: cte.remetente.cnpjCPF,
              nome: cte.remetente.nome,
              tipo: cte.remetente.tipo,
            },
          });

          const destinatarioData = await prisma.destinatario.upsert({
            where: { cnpjCPF: cte.destinatario.cnpjCPF },
            update: {},
            create: {
              cnpjCPF: cte.destinatario.cnpjCPF,
              nome: cte.destinatario.nome,
              tipo: cte.destinatario.tipo,
            },
          });

          const recebedorData = await prisma.recebedor.upsert({
            where: { cnpjCPF: cte.recebedor.cnpjCPF },
            update: {},
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
          });

          const createdCte = await prisma.ctes.create({
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
              recebedorId: recebedorData.id,
              statusId: 1,
              listarCTE: true,
              NotaFiscal: {
                create: cte.notasFiscais.map((nota: any) => ({
                  chaveNFe: nota.chave_nfe,
                  serNF: nota.serNF,
                  nroNF: nota.nroNF,
                  nroPedido: nota.nroPedido,
                  qtdeVolumes: nota.qtdeVolumes,
                  pesoReal: nota.pesoReal,
                  metragemCubica: nota.metragemCubica,
                  valorMercadoria: nota.valorMercadoria,
                })),
              },
            },
          });

          idsCriados.push(createdCte.id);
          criados++;
        }
      }

      await Promise.all(updatePromises);
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Duration in seconds

    await prisma.log.create({
      data: {
        desc: `Foram inseridos ${criados} CTe(s) novos e atualizados ${atualizados} CTe(s) existentes em ${duration} segundos | SSW: ${durationAPI}`,
        tp: `AGENDADOR-${UNIDADE}`,
        createdAt: dt_alteracao,
      },
    });

    console.log(
      `Foram inseridos ${criados} CTe(s) novos e atualizados ${atualizados} CTe(s) existentes`
    );
    console.log(`IDs dos CTes criados:`, idsCriados);

  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  }
}

export async function atualizarStatusCtes() {
  try {
    const ctes = await prisma.ctes.findMany({
      select: {
        id: true, // Identificador �nico do CTe
        chaveCTe: true, // Chave do CTe
        nroCTRC: true, // N�mero do CTRC
        ordem: true, // Ordem para prioriza��o
        listarCTE: true, // Indicador se o CTe est� ativo para listagem
      },
      orderBy: {
        ordem: "desc", // Ordena os CTes para que o maior valor de ordem venha primeiro
      },
    });

    // Agrupar os CTes pelo par (chaveCTe, nroCTRC)
    const groupedCtes = ctes.reduce<Record<string, typeof ctes>>((acc, cte) => {
      const key = `${cte.chaveCTe}-${cte.nroCTRC}`; // Cria uma chave �nica para agrupamento
      if (!acc[key]) {
        acc[key] = []; // Inicializa o grupo se n�o existir
      }
      acc[key].push(cte); // Adiciona o CTe ao grupo correspondente
      return acc;
    }, {});

    // Iterar pelos grupos de CTes
    for (const key in groupedCtes) {
      const ctesGroup = groupedCtes[key]; // Obt�m todos os CTes do grupo

      // Atualizar cada CTe no grupo
      ctesGroup.forEach((cte, index) => {
        const isHighestOrder = index === 0; // Apenas o primeiro elemento (maior ordem) ser� listado

        // Se o estado atual de listarCTE estiver incorreto, atualiza no banco
        if (cte.listarCTE !== isHighestOrder) {
          prisma.ctes.update({
            where: { id: cte.id }, // Filtra pelo ID �nico do CTe
            data: { listarCTE: isHighestOrder }, // Atualiza o campo listarCTE
          });
        }
      });
    }

    console.log("Status dos CTes atualizado com sucesso.");
  } catch (error) {
    // Captura e exibe erros durante a execu��o
    console.error("Erro ao atualizar status dos CTes:", error);
  }
}





export async function buscarEInserirCtesRecorrenteStatusId(UNIDADE: string) {
  try {
    const camposNecessarios = ["username", "password", "cnpj_edi", "domain"];

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

    const camposFaltantes = camposNecessarios.filter(
      (campo) => !(campo in authDados)
    );

    if (camposFaltantes.length > 0) {
      console.log(
        `Os seguintes campos estão faltando: ${camposFaltantes.join(", ")}`
      );
      return;
    }
    const authResponse = await fetch(endpoints.generateToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: authDados["domain"],
        username: authDados["username"],
        password: authDados["password"],
        cnpj_edi: authDados["cnpj_edi"],
      }),
    });

    const authData = await authResponse.json();
    const startTimeAPI = Date.now();

    const token = authData.token;
    const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${UNIDADE}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    const endTimeAPI = Date.now();
    const durationAPI = (endTimeAPI - startTimeAPI) / 1000;

    let text = await response.text();

    const startTime = Date.now();

    text = text.replace(/"cep":(\d+)/g, (match, p1) => `"cep":"${p1}"`);

    let parsedData = JSON.parse(text);

    const ctes = parsedData?.ctes ?? [];

    let criados = 0;
    let atualizados = 0;
    const dt_alteracao = new Date();

    if (ctes.length > 0) {
      const novosCtes = [];
      const updatePromises = [];

      for (const cte of ctes) {
        const existingCTe = await prisma.ctes.findFirst({
          where: {
            chaveCTe: cte.chaveCTe,
            nroCTRC: cte.nroCTRC,
          },
        });

        if (existingCTe) {
          if (
            existingCTe.placaVeiculo.toUpperCase() !=
              cte.placaVeiculo.toUpperCase()
          ) {
            let motoristaData;
            if (cte.cpfMotorista && cte.nomeMotorista) {
              motoristaData = await prisma.motorista_ssw.upsert({
                where: { cpf: cte.cpfMotorista },
                update: {},
                create: {
                  cpf: cte.cpfMotorista,
                  nome: cte.nomeMotorista,
                },
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
                  motoristaId: motoristaData!.id,
                  listarCTE: true
                },
              })
            );
          } else {
            updatePromises.push(
              prisma.ctes.update({
                where: { id: existingCTe.id },
                data: { dt_alteracao, codUltOco: cte.codUltOco,  statusId: 1, listarCTE: true },
              })
            );
          }
          atualizados++;
        } else {
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
               NotaFiscal: {
                 create: cte.notasFiscais.map((nota: any) => ({
                   chaveNFe: nota.chave_nfe,
                   serNF: nota.serNF,
                   nroNF: nota.nroNF,
                   nroPedido: nota.nroPedido,
                   qtdeVolumes: nota.qtdeVolumes,
                   pesoReal: nota.pesoReal,
                   metragemCubica: nota.metragemCubica,
                   valorMercadoria: nota.valorMercadoria,
                 })),
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

      await Promise.all(updatePromises);
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Duration in seconds

    await prisma.log.create({
      data: {
        desc: `DIARIO Foram inseridos ${criados} CTe(s) novos e atualizados ${atualizados} CTe(s) existentes em ${duration} segundos | SSW: ${durationAPI}`,
        tp: `AGENDADOR-${UNIDADE}`,
        createdAt: dt_alteracao,
      },
    });

    console.log(
      `Foram inseridos ${criados} CTe(s) novos e atualizados ${atualizados} CTe(s) existentes`
    );
  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  }
}

