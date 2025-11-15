import { PrismaClient } from '@prisma/client';
import { endpoints } from "../utils/API";

const prisma = new PrismaClient();

// Filtrar apenas os códigos que não são do processo "ENTREGA"
// const codigosNaoPrecisamAtualizar = [
//   1, 2, 3, 4, 5, 7, 9, 10, 11, 13, 14, 16, 18, 19, 20, 23, 25, 26, 28, 34, 35, 36, 37, 38, 39, 45, 48, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 62, 65, 88, 91, 92, 93, 94, 99
// ];

const codigosNaoPrecisamAtualizar = [
  1
];

export async function AtualizarCtesRecorrente() {
  try {
    const startTime = Date.now();
    const camposNecessarios = ['username', 'password', 'cnpj_edi', 'domain'];

    // Obtenha os dados de autenticação necessários
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
      return;
    }

    // Gere o token de autenticação
    console.log('Gerando token de autenticação...');
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

    // Encontre os CTEs que precisam ser atualizados
    const ctesAtualizar = await prisma.ctes.findMany({
      where: {
        NotaFiscal: {
          some: {
            chaveNFe: { not: '' },
          },
        },
        codUltOco: { notIn: codigosNaoPrecisamAtualizar },
      },
      include: {
        NotaFiscal: true,
      },
    });

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Processa os CTEs de forma assíncrona
    const processarCTEs = async () => {
      const MAX_REQS_PER_SECOND = 18;
      const INTERVAL_MS = 1000;
    
      let reqCount = 0;
      let startTime = Date.now();
      let contadorCTE = 0;
    
      console.log(ctesAtualizar.length);
    
      for (const cte of ctesAtualizar) {
        if (cte.NotaFiscal.length > 0) {
          for (const nota of cte.NotaFiscal) {
            const url = endpoints.trackingdanfe;
            const body = JSON.stringify({ chave_nfe: nota.chaveNFe });
    
            try {
              const now = Date.now();
    
              if (reqCount >= MAX_REQS_PER_SECOND) {
                const elapsed = now - startTime;
                if (elapsed < INTERVAL_MS) {
                  await delay(INTERVAL_MS - elapsed);
                }
                reqCount = 0;
                startTime = Date.now();
              }
    
              const response = await fetch(url, {
                method: "POST",
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json",
                },
                body: body,
              });
    
              reqCount++;
              contadorCTE++;
    
              if (!response.ok) {
                continue;
              }
    
              const data: any = await response.json();
    
              if (!data.success || !data.documento.tracking.length) {
                continue;
              }
    
              const ultimaOcorrencia = data.documento.tracking[data.documento.tracking.length - 1];
              const ocorrenciaTexto = ultimaOcorrencia.ocorrencia;
              const ocorrenciaData = ultimaOcorrencia.data_hora;
              const numeroOcorrencia = ocorrenciaTexto.match(/\((\d+)\)/)?.[1];
    
              console.log(ctesAtualizar.length, "==>", contadorCTE, "| ID", cte.id, "| codUltOco", cte.codUltOco);
    
              if (numeroOcorrencia && cte.codUltOco != numeroOcorrencia) {
                console.log('Atualizando CTE', cte.id, 'de', cte.codUltOco, 'para', numeroOcorrencia, 'em', ocorrenciaData);
    
                await prisma.ctes.update({
                  where: { id: cte.id },
                  data: {
                    codUltOco: parseInt(numeroOcorrencia),
                    dt_alteracao: new Date(ocorrenciaData)
                  },
                });
              }
    
            } catch (error) {
              console.error(`Erro na requisição para NF-e ${nota.chaveNFe}:`, error);
            }
          }
        } else {
          await prisma.ctes.update({ where: { id: cte.id }, data: { codUltOco: 0 } });
        }
      }
    
      console.log('Atualizações concluídas.');
    };
        

    await processarCTEs();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`Processo concluído em ${duration} segundos.`);

    await prisma.log.create({
      data: {
        desc: `Processo de atualização de CTEs concluído em ${duration} segundos.`,
        tp: `AGENDADOR`,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.log('Erro ao buscar e salvar CTe:', error);
  } finally {
    await prisma.$disconnect();
  }
}
