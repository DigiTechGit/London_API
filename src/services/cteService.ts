import { PrismaClient } from "@prisma/client";
import { endpoints } from "../utils/API";
import { CTES } from "../utils/interface";

const prisma = new PrismaClient();
const cacheCtes = new Map(); // Cache para armazenar CTes por unidade

async function GenerateToken() {
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

  const token = authData.token;
  return token;
}

export async function buscarEInserirCtesRecorrente(UNIDADE: string) {
  try {
    const startTimeTotal = Date.now(); // Início do processo

    // Chamada à API
    const startTimeAPI = Date.now();
    const url = `${endpoints.roteirizaRomaneioStockfy}?siglaEnt=${UNIDADE}`;
    const token = await GenerateToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    const endTimeAPI = Date.now();
    const durationAPI = (endTimeAPI - startTimeAPI) / 1000;

    // Processar resposta da API
    const cachedCtes = cacheCtes.get(UNIDADE) || [];
    let text = await response.text();

    const startTimeParsing = Date.now();
    text = text.replace(/"cep":(\d+)/g, (match, p1) => `"cep":"${p1}"`);
    let parsedData = JSON.parse(text);
    const endTimeParsing = Date.now();
    const durationParsing = (endTimeParsing - startTimeParsing) / 1000;

    // Filtrar CTes duplicadas
    const startTimeFiltering = Date.now();
    const ctes: CTES[] = parsedData?.ctes ?? [];
    const filteredCTES = await filtroCTEsDuplicadas(ctes);
    const endTimeFiltering = Date.now();
    const durationFiltering = (endTimeFiltering - startTimeFiltering) / 1000;

    // Atualizar cache
    cacheCtes.set(UNIDADE, filteredCTES);

    // Comparar e processar CTes
    const startTimeProcessing = Date.now();
    const { novos, removidos, modificados } = compararCtes(
      cachedCtes,
      filteredCTES
    );

    const adicionados = await adicionarCTEs(novos, UNIDADE);
    const CTESremovidos = await removerCTEs(removidos, UNIDADE);
    const atualizados = await atualizarCTEs(modificados, UNIDADE);
    const endTimeProcessing = Date.now();
    const durationProcessing = (endTimeProcessing - startTimeProcessing) / 1000;

    // Fim do processo
    const endTimeTotal = Date.now();
    const durationTotal = (endTimeTotal - startTimeTotal) / 1000;

    // Log detalhado
    console.log(`Log do processo de CTes para a unidade ${UNIDADE}:
    - Tempo total: ${durationTotal} segundos
    - Chamada à API: ${durationAPI} segundos
    - Parsing da resposta: ${durationParsing} segundos
    - Filtragem de CTes duplicados: ${durationFiltering} segundos
    - Processamento de CTes (adicionar, remover, atualizar): ${durationProcessing} segundos
    - CTes adicionados: ${adicionados}
    - CTes removidos: ${removidos.length}
    - CTes atualizados: ${modificados.length}`);
  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  }
}


export async function buscarEInserirCtesRecorrenteStatusId(UNIDADE: string) {
  try {
    const startTimeAPI = Date.now();

    const token = await GenerateToken();
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
                  listarCTE: true,
                },
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
                  listarCTE: true,
                },
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

async function adicionarCTEs(ctes: CTES[], UNIDADE:string) {
  let criados = 0
  for(const cte of ctes){
  const motoristaData = await prisma.motorista_ssw.upsert({
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
      cep: cte.recebedor.cep.toString(),
      cidade: cte.recebedor.cidade,
      uf: cte.recebedor.uf,
      foneContato: cte.recebedor.foneContato,
    },
  });

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
  criados++;

}
return criados
}

async function removerCTEs(ctes: CTES[], UNIDADE: string) {
  for (const cte of ctes) {
    await prisma.ctes.updateMany({
      where: {
        chaveCTe: cte.chaveCTe,
        placaVeiculo: cte.placaVeiculo,
        nroCTRC: cte.nroCTRC,
        Unidade: UNIDADE,
      },
      data: {
        listarCTE: false,
      },
    });
  }
}

async function atualizarCTEs(ctes: CTES[], UNIDADE: string) {
  for (const cte of ctes) {
    // Criar ou atualizar o motorista e obter o ID
    const motorista = await prisma.motorista_ssw.upsert({
      where: { cpf: cte.cpfMotorista },
      update: {
        nome: cte.nomeMotorista,
      },
      create: {
        cpf: cte.cpfMotorista,
        nome: cte.nomeMotorista,
      },
    });

    await prisma.ctes.updateMany({
      where: {
        chaveCTe: cte.chaveCTe,
        nroCTRC: cte.nroCTRC,
        Unidade: UNIDADE,
      },
      data: {
        statusId: 1,
        codUltOco: cte.codUltOco,
        placaVeiculo: cte.placaVeiculo,
        listarCTE: true,
        motoristaId: motorista.id,
      },
    });
  }
}





function filtroCTEsDuplicadas(ctes: CTES[]) {
  const filteredCTES = ctes.reduce((acc, current) => {
    const existing = acc.find(
      (cte) =>
        cte.chaveCTe === current.chaveCTe &&
        cte.serCTRC === current.serCTRC &&
        cte.nroCTRC === current.nroCTRC &&
        cte.valorFrete === current.valorFrete &&
        cte.valorImpostoCTRC === current.valorImpostoCTRC &&
        cte.setor === current.setor
    );

    if (existing) {
      if (current.ordem > existing.ordem) {
        acc = acc.filter(
          (cte) =>
            !(
              cte.chaveCTe === current.chaveCTe &&
              cte.serCTRC === current.serCTRC &&
              cte.nroCTRC === current.nroCTRC &&
              cte.valorFrete === current.valorFrete &&
              cte.valorImpostoCTRC === current.valorImpostoCTRC &&
              cte.setor === current.setor
            )
        );
        acc.push(current);
      }
    } else {
      // Adiciona novo item se não existir no acumulador
      acc.push(current);
    }

    return acc;
  }, [] as CTES[]);
  return filteredCTES;
}

function compararCtes(cachedCtes: CTES[], filteredCTES: CTES[]) {
  const novos = filteredCTES.filter(
    (cteFiltered) =>
      !cachedCtes.some(
        (cteCached) =>
          cteCached.chaveCTe === cteFiltered.chaveCTe &&
          cteCached.serCTRC === cteFiltered.serCTRC &&
          cteCached.nroCTRC === cteFiltered.nroCTRC &&
          cteCached.setor === cteFiltered.setor 
        )
  );

  const removidos = cachedCtes.filter(
    (cteCached) =>
      !filteredCTES.some(
        (cteFiltered) =>
          cteCached.chaveCTe === cteFiltered.chaveCTe &&
          cteCached.serCTRC === cteFiltered.serCTRC &&
          cteCached.nroCTRC === cteFiltered.nroCTRC &&
          cteCached.setor === cteFiltered.setor
      )
  );

  const modificados = filteredCTES.filter((cteFiltered) =>
    cachedCtes.some(
      (cteCached) =>
        cteCached.chaveCTe === cteFiltered.chaveCTe &&
        cteCached.serCTRC === cteFiltered.serCTRC &&
        cteCached.nroCTRC === cteFiltered.nroCTRC &&
        cteCached.setor === cteFiltered.setor && 
          (
            cteCached.cpfMotorista !== cteFiltered.cpfMotorista ||
            cteCached.placaVeiculo !== cteFiltered.placaVeiculo
          )
    )
  );

  return { novos, removidos, modificados };
}