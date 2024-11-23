import { PrismaClient } from '@prisma/client';
import { endpoints } from "../utils/API";
import { Cte } from '../types/cte';

const prisma = new PrismaClient();

export async function AtualizarCtesRecorrente() {
  try {
    const camposNecessarios = ['username', 'password', 'cnpj_edi', 'domain'];



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

    const ctesAtualizar = await prisma.ctes.findMany({
      where: {
        NotaFiscal: {
          some: {}, 
        },
        codUltOco: { gt: 1 }, 
      },
      include: {
        NotaFiscal: true,
      },
    });
    
    
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    
    const processarCTEs = async () => {
      let contador = 0;
    
      for (const cte of ctesAtualizar) {
        if (cte.NotaFiscal.length > 0) {
          for (const nota of cte.NotaFiscal) {
            const token = authData.token;
            const url = endpoints.trackingdanfe; // URL do endpoint fornecido
            const body = JSON.stringify({
              chave_nfe: nota.chaveNFe, // Parâmetro exigido
            });
    
            try {
              // Respeita o limite de 10 requisições por segundo
              if (contador >= 15) {
                await delay(1000); // Pausa de 1 segundo
                contador = 0; // Reseta o contador após a pausa
              }
    
              const response = await fetch(url, {
                method: "POST", // Método POST conforme exigido
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json", // Tipo de conteúdo JSON
                },
                body: body, // Corpo da requisição com a chave NF-e
              });
    
              contador++; // Incrementa o contador de requisições
    
              if (!response.ok) {
                console.error(`Erro ao processar CTe ${cte.id} com NF-e ${nota.chaveNFe}:`, response.statusText);
                continue; // Pula para a próxima iteração em caso de erro
              }
    
              const data: any = await response.json();
    
              if (!data.success || !data.documento.tracking.length) {
                console.warn(`${cte.id} Nenhum tracking encontrado para NF-e ${nota.chaveNFe}`);
                continue;
              }
    
              // Obtém a última ocorrência do tracking
              const ultimaOcorrencia = data.documento.tracking[data.documento.tracking.length - 1];
              const ocorrenciaTexto = ultimaOcorrencia.ocorrencia;
              const numeroOcorrencia = ocorrenciaTexto.match(/\((\d+)\)/)?.[1];

              if (numeroOcorrencia && cte.codUltOco != numeroOcorrencia) {
                await prisma.ctes.update({
                  where: { id: cte.id },
                  data: { codUltOco: parseInt(numeroOcorrencia, 10) },
                });
    
                console.log(`CTE ${cte.id} atualizado com codUltOco ${numeroOcorrencia}`);
              } else {
                console.warn(`sem atualização ${nota.chaveNFe}`);
              }
            } catch (error) {
              console.error(`Erro na requisição para NF-e ${nota.chaveNFe}:`);
            }
          }
        } else {
          prisma.ctes.update({where: {id: cte.id}, data: {codUltOco: 0}})
          console.warn(`Nenhuma nota fiscal encontrada para CTe ${cte.id}`);
        }
      }
    };
    
    processarCTEs();    
  

  } catch (error) {
    console.log('Erro ao buscar e salvar CTe:', error);
  }
}
