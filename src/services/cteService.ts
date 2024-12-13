import { PrismaClient } from "@prisma/client";
import { endpoints } from "../utils/API";
import { Cte } from "../types/cte";

const prisma = new PrismaClient();

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
            cte.ordem > existingCTe.ordem &&
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
                  motoristaId: motoristaData!.id ,
                },
              })
            );
          } else {
            updatePromises.push(
              prisma.ctes.update({
                where: { id: existingCTe.id },
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

          novosCtes.push({
            chaveCTe: cte.chaveCTe,
            Unidade: UNIDADE,
            nroCTRC: cte.nroCTRC,
            valorFrete: cte.valorFrete,
            placaVeiculo: cte.placaVeiculo,
            previsaoEntrega: cte.previsaoEntrega,
            codUltOco: cte.codUltOco,
            ordem: cte.ordem,
            motoristaId:  motoristaData.id,
            remetenteId: remetenteData.id,
            destinatarioId: destinatarioData.id,
            recebedorId: recebedorData.id,
            statusId: 1,
          });
          criados++;
        }
      }

      if (novosCtes.length > 0) {
        await prisma.ctes.createMany({
          data: novosCtes,
          skipDuplicates: true,
        });
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
  } catch (error) {
    console.log("Erro ao buscar e salvar CTe:", error);
  }
}