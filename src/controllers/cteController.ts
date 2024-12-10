import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { CTeRequestBody } from "../interfaces/CTeRequestBody";

export default function cteRoutes(
  fastify: FastifyInstance,
  prisma: PrismaClient
) {
  fastify.post<{ Body: CTeRequestBody }>("/ctes", async (request, reply) => {
    const {
      chaveCTe,
      valorFrete,
      nomeMotorista,
      cpfMotorista,
      placaVeiculo,
      previsaoEntrega,
      remetente,
      destinatario,
      recebedor,
      ordem
    } = request.body;

    try {
      // Criar ou encontrar o motorista
      const motorista = await prisma.motorista_ssw.upsert({
        where: { cpf: cpfMotorista },
        update: {},
        create: {
          nome: nomeMotorista,
          cpf: cpfMotorista,
        },
      });

      // Criar ou encontrar o remetente
      const remetenteEntity = await prisma.remetente.upsert({
        where: { cnpjCPF: remetente.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: remetente.cnpjCPF,
          tipo: remetente.tipo,
          nome: remetente.nome,
        },
      });

      // Criar ou encontrar o destinatário
      const destinatarioEntity = await prisma.destinatario.upsert({
        where: { cnpjCPF: destinatario.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: destinatario.cnpjCPF,
          tipo: destinatario.tipo,
          nome: destinatario.nome,
        },
      });

      // Criar ou encontrar o recebedor
      const recebedorEntity = await prisma.recebedor.upsert({
        where: { cnpjCPF: recebedor.cnpjCPF },
        update: {},
        create: {
          cnpjCPF: recebedor.cnpjCPF,
          tipo: recebedor.tipo,
          nome: recebedor.nome,
          endereco: recebedor.endereco,
          numero: recebedor.numero,
          bairro: recebedor.bairro,
          cep: recebedor.cep,
          cidade: recebedor.cidade,
          uf: recebedor.uf,
          foneContato: recebedor.foneContato,
        },
      });

      // Criar o CTe com o status
      const cte = await prisma.ctes.create({
        data: {
          chaveCTe,
          valorFrete,
          placaVeiculo,
          ordem,
          previsaoEntrega: previsaoEntrega,
          motoristaId: motorista.id,
          remetenteId: remetenteEntity.id,
          destinatarioId: destinatarioEntity.id,
          recebedorId: recebedorEntity.id,
          statusId: 1,
        },
      });

      reply.status(201).send(cte);
    } catch (error) {
      reply.status(500).send({ error: "Failed to create CTe" });
    }
  });

  // fastify.get("/quantidadeNaoEnviadoCtesPorUnidade", async (request, reply) => {
  //   try {
  //     const { unidade } = request.query as { unidade: string };
  //     let filtroData = {};

  //     const ultimoLog = await prisma.log.findFirst({
  //       where: {
  //         tp: `AGENDADOR-${unidade.toUpperCase()}`,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //     });

  //     const motoristasSalvos = await prisma.motorista.findMany({
  //       select: {
  //         placa: true,
  //       },
  //     });
  //     const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);

  //     if (ultimoLog && ultimoLog.createdAt) {
  //       const dtAlteracaoComMinutos = new Date(ultimoLog.createdAt);
  //       dtAlteracaoComMinutos.setMinutes(dtAlteracaoComMinutos.getMinutes());
  //       // Adicionar o filtro de data baseado no último log
  //       filtroData = {
  //         dt_alteracao: {
  //           gte: dtAlteracaoComMinutos, // Filtra os registros que foram alterados a partir do último log
  //         },
  //       };
  //     }

  //     // Buscar os CTe's com base nos filtros
  //     const ctes = await prisma.ctes.findMany({
  //       where: {
  //         codUltOco: 85,
  //         placaVeiculo: {
  //           in: placasSalvas, 
  //         },
  //         statusId: 1,
  //         Unidade: unidade.toUpperCase(),
  //         ...filtroData,
  //       },
  //       include: {
  //         motorista: true,
  //         remetente: true,
  //         destinatario: true,
  //         recebedor: true,
  //         status: true,
  //       },
  //     });


  //     const ctesEnriched = await Promise.all(
  //       ctes.map(async (cte) => {
  //         const remetenteCNPJ = cte.remetente?.cnpjCPF;
  //         const cnpjExists = await prisma.cnpjTb.findFirst({
  //           where: {
  //             CNPJ: remetenteCNPJ,
  //           },
  //         });
      
  //         return {
  //           ...cte,
  //           cnpjCorreios: !!cnpjExists,
  //         };
  //       })
  //     );

  //     const motoristasComCtes = motoristasSalvos
  //     .map((motorista) => {
  //       const ctesDoMotorista = ctesEnriched.filter(
  //         (cte) => cte.placaVeiculo === motorista.placa
  //       );

  //       const motoristaComNome = {
  //         ...motorista,
  //         nome: ctesDoMotorista[0]?.motorista?.nome || null, 
  //       };

  //       return ctesDoMotorista.length > 0
  //         ? {
  //             ...motoristaComNome,
  //             ctes: ctesDoMotorista,
  //           }
  //         : null;
  //     })
  //     .filter(Boolean); // Remove itens nulos


  //     reply.status(200).send(motoristasComCtes);
  //   } catch (error) {
  //     console.error(error);
  //     reply.status(500).send({ error: "Failed to list CTe" });
  //   }
  // });

  fastify.put("/CTES", async (request, reply) => {
    try {
      const { status, id } = request.body as { status: string; id: number };
      const ctes = await prisma.ctes.update({
        where: { id },
        data: { statusId: parseInt(status) },
      });
      reply.send(ctes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });

  fastify.get("/LOG", async (request, reply) => {
    try {
      const { tpLog } = request.query as { tpLog: string }; // Alterado para query

      const log = await prisma.log.findFirst({
        where: {
          tp: tpLog.toUpperCase(),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      reply.status(200).send(log);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });

  fastify.delete("/CTES", async (request, reply) => {
    try {
      await prisma.ctes.deleteMany();
      reply.code(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        reply.code(500).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Erro desconhecido" });
      }
    }
  });

  // rota para atualizar status dos cte's
  fastify.put("/cte/status", async (request, reply) => {
    const { status, chaveCTe, nroCTRC } = request.body as {
      status: number;
      chaveCTe: string;
      nroCTRC: number | null;
    };

    try {
      const existingCTe = await prisma.ctes.findFirst({
        where: {
          chaveCTe: chaveCTe,
          nroCTRC: nroCTRC,
        },
      });

      if (existingCTe) {
        await prisma.ctes.update({
          where: { id: existingCTe.id },
          data: { statusId: status },
        });
      }

      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: "Failed to update CTe" });
    }
  });

  fastify.get("/quantidadeCtesTotalPorStatus", async (request, reply) => {
    try {
      const { unidade, status } = request.query as { unidade: string, status: string };
      let filtroData = {};

      const ultimoLog = await prisma.log.findFirst({
        where: {
          tp: `AGENDADOR-${unidade.toUpperCase()}`,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const motoristasSalvos = await prisma.motorista.findMany({
        select: {
          idCircuit: true,
          placa: true,
        }
      });
      const statusFormatado = status ? parseInt(status) : 1;
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      
      if (ultimoLog && ultimoLog.createdAt) {
        const dtAlteracaoComMinutos = new Date(ultimoLog.createdAt);
        dtAlteracaoComMinutos.setMinutes(dtAlteracaoComMinutos.getMinutes());
        filtroData = {
          dt_alteracao: {
            gte: dtAlteracaoComMinutos,
          },
        };
      }
      
      // Buscar os CTe's com base nos filtros
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas,
          },
          statusId: statusFormatado,
          Unidade: unidade.toUpperCase(),
          ...filtroData,
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true,
        },
      });
      
      // Enriquecer os CTe's com informação de cnpjCorreios
      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ,
            },
          });
      
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists,
          };
        })
      );

      const motoristasComCtes = motoristasSalvos
      .map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa 
        );

        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null, 
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesDoMotorista.length > 0
          ? {
              ...motoristaComNome,
              ctes: statusFormatado ? ctesDoMotorista.filter((cte) => cte.statusId === statusFormatado) : ctesDoMotorista,
              ctesEnviados: ctesEnviados.length,
              ctesNaoEnviados: ctesNaoEnviados.length,
            } : null;
      })
      .filter(Boolean); // Remove itens nulos
        

      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });

  fastify.get("/ctesPorPlaca", async (request, reply) => {
    try {
      const { unidade, placa, statusId } = request.query as { unidade: string, placa: string, statusId: string };
      let filtroData = {};

      const ultimoLog = await prisma.log.findFirst({
        where: {
          tp: `AGENDADOR-${unidade.toUpperCase()}`,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const motoristasSalvos = await prisma.motorista.findMany({
        where: {
          placa: placa,
        },
        select: {
          idCircuit: true,
          placa: true,
        }
      });

      const statusFormatado = statusId ? parseInt(statusId) : 1;
      const placasSalvas = motoristasSalvos.map((motorista) => motorista.placa);
      
      if (ultimoLog && ultimoLog.createdAt) {
        const dtAlteracaoComMinutos = new Date(ultimoLog.createdAt);
        dtAlteracaoComMinutos.setMinutes(dtAlteracaoComMinutos.getMinutes());
        filtroData = {
          dt_alteracao: {
            gte: dtAlteracaoComMinutos,
          },
        };
      }
      // Buscar os CTe's com base nos filtros
      const ctes = await prisma.ctes.findMany({
        where: {
          codUltOco: 85,
          placaVeiculo: {
            in: placasSalvas,
          },
          // statusId: statusIdFormatado,
          ...filtroData,
        },
        include: {
          motorista: true,
          remetente: true,
          destinatario: true,
          recebedor: true,
          status: true,
          NotaFiscal: true,
        },
      });

      const ctesEnriched = await Promise.all(
        ctes.map(async (cte) => {
          const remetenteCNPJ = cte.remetente?.cnpjCPF;
          const cnpjExists = await prisma.cnpjTb.findFirst({
            where: {
              CNPJ: remetenteCNPJ,
            },
          });
      
          return {
            ...cte,
            cnpjCorreios: !!cnpjExists,
          };
        })
      );

      const motoristasComCtes = motoristasSalvos
      .map((motorista) => {
        const ctesDoMotorista = ctesEnriched.filter(
          (cte) => cte.placaVeiculo === motorista.placa
        );

        const motoristaComNome = {
          ...motorista,
          nome: ctesDoMotorista[0]?.motorista?.nome || null, 
        };
        const ctesEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 2);
        const ctesNaoEnviados = ctesDoMotorista.filter((cte) => cte.statusId === 1);
        return ctesDoMotorista.length > 0
          ? {
              ...motoristaComNome,
              ctes: statusFormatado ? ctesDoMotorista.filter((cte) => cte.statusId === statusFormatado) : ctesDoMotorista,
              ctesEnviados: ctesEnviados.length,
              ctesNaoEnviados: ctesNaoEnviados.length,
            }
          : null;
      })
      .filter(Boolean); // Remove itens nulos

      reply.status(200).send(motoristasComCtes);
    } catch (error) {
      reply.status(500).send({ error: "Failed to list CTe" });
    }
  });
}
