import { Prisma, PrismaClient } from "@prisma/client";
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
    text = text.replace(
      /"cep":(\d+)/g,
      (match: any, p1: any) => `"cep":"${p1}"`
    );
    const parsedData = JSON.parse(text);

    const ctes: Cte[] = parsedData?.ctes ?? [];
    if (ctes.length === 0) {
      console.log("Nenhum CTe encontrado para inserção.");
      return;
    }

    console.time("salvamento_otimizado");

    const dt_alteracao = new Date();

    // Processar e salvar remetente, destinatário e recebedor
    const remetentes = await Promise.all(
      ctes.map(async (cte) => {
        const remetente = await prisma.remetente.upsert({
          where: { cnpjCPF: cte.remetente.cnpjCPF },
          update: {},
          create: {
            cnpjCPF: cte.remetente.cnpjCPF,
            nome: cte.remetente.nome,
            tipo: cte.remetente.tipo,
          },
        });
        return { cnpjCPF: cte.remetente.cnpjCPF, id: remetente.id };
      })
    );

    const destinatarios = await Promise.all(
      ctes.map(async (cte) => {
        const destinatario = await prisma.destinatario.upsert({
          where: { cnpjCPF: cte.destinatario.cnpjCPF },
          update: {},
          create: {
            cnpjCPF: cte.destinatario.cnpjCPF,
            nome: cte.destinatario.nome,
            tipo: cte.destinatario.tipo,
          },
        });
        return { cnpjCPF: cte.destinatario.cnpjCPF, id: destinatario.id };
      })
    );

    const recebedores = await Promise.all(
      ctes.map(async (cte) => {
        const recebedor = await prisma.recebedor.upsert({
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
        return { cnpjCPF: cte.recebedor.cnpjCPF, id: recebedor.id };
      })
    );

    const motoristaIds = await Promise.all(
      ctes.map(async (cte) => {
        const motorista = await prisma.motorista_ssw.upsert({
          where: { cpf: cte.cpfMotorista },
          update: {},
          create: {
            cpf: cte.cpfMotorista,
            nome: cte.nomeMotorista,
          },
        });
        return { cpf: cte.cpfMotorista, id: motorista.id };
      })
    );

    // Mapear IDs de relações para os CTes
    // Remova registros com IDs indefinidos antes de usar createMany
    const ctesData = ctes
      .map((cte) => {
        const remetenteId = remetentes.find(
          (r) => r.cnpjCPF === cte.remetente.cnpjCPF
        )?.id;
        const destinatarioId = destinatarios.find(
          (d) => d.cnpjCPF === cte.destinatario.cnpjCPF
        )?.id;
        const recebedorId = recebedores.find(
          (r) => r.cnpjCPF === cte.recebedor.cnpjCPF
        )?.id;
        const motoristaId = motoristaIds.find(
          (m) => m.cpf === cte.cpfMotorista
        )?.id;

        // Retorne apenas se todos os IDs obrigatórios estiverem presentes
        if (!motoristaId || !remetenteId || !destinatarioId || !recebedorId) {
          console.warn(`ID faltando para CTe: ${cte.chaveCTe}`);
          return null;
        }

        return {
          chaveCTe: cte.chaveCTe,
          Unidade: UNIDADE,
          nroCTRC: cte.nroCTRC,
          valorFrete: cte.valorFrete,
          placaVeiculo: cte.placaVeiculo,
          previsaoEntrega: cte.previsaoEntrega,
          codUltOco: cte.codUltOco,
          remetenteId,
          destinatarioId,
          recebedorId,
          motoristaId,
          statusId: 1,
          dt_alteracao,
        };
      })
      .filter((cte) => cte !== null) as Array<Prisma.CtesCreateManyInput>;

    // Inserção em lote
    await prisma.ctes.createMany({
      data: ctesData,
      skipDuplicates: true,
    });

    console.timeEnd("salvamento_otimizado");
    console.log(`CTes inseridos: ${ctesData.length}`);
  } catch (error) {
    console.error("Erro ao buscar e salvar CTe:", error);
  }
}
