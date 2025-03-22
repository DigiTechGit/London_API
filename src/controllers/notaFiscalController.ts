import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { buscarCep } from "../utils/cep";

const headers = new Headers();
headers.append("Content-Type", "application/json");

const PDFDocument = require("pdfkit");
const bwipjs = require("bwip-js");
const QRCode = require("qrcode");

export default function notaFiscalController(
  fastify: FastifyInstance,
  prisma: PrismaClient,
) {
  fastify.get(
    "/notaFiscal/listarPorPlaca",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { placa } = request.query as { placa: string };

        const ctesMotorista = await prisma.ctes.findMany({
          where: {
            placaVeiculo: placa,
            listarCTE: true,
            codUltOco: 85,
          },
          include: {
            motorista: true,
            NotaFiscal: true,
            remetente: true,
            destinatario: true,
            recebedor: true,
          },
        });
        let motorista: any = "";

        const CNPJ_CEP = await prisma.cnpjTb.findMany({
          where: { idAtivo: true },
        });

        const nFEs = await Promise.all(
          ctesMotorista.map(async (cte) => {
            if (motorista == "") {
              motorista = {
                ...cte.motorista,
                placa: placa,
              };
            }

            if (CNPJ_CEP.some((item) => item.CNPJ === cte.remetente.cnpjCPF)) {
              cte.recebedor.endereco = await buscarCep(cte.recebedor.cep);
            }
            const objNFe = cte.NotaFiscal.map((nfe: any) => ({
              chaveCte: cte.chaveCTe,
              chaveNFe: nfe.chaveNFe,
              nrNfre: nfe.nroNF,
              qtdeVolumes: nfe.qtdeVolumes,
              remetente: cte.remetente.nome,
              prevEntrega: cte.previsaoEntrega,
              destinatario: cte.destinatario.nome,
              bairro: cte.recebedor.bairro,
              cep: cte.recebedor.cep,
              endereco: cte.recebedor.endereco,
              numero: cte.recebedor.numero,
              cidade: cte.recebedor.cidade,
              telefone: cte.recebedor.foneContato,
              celular: cte.recebedor.celularContato,
              uf: cte.recebedor.uf,
              complemento: cte.recebedor.complemento,
              ctesPorParada: ctesMotorista.filter(
                (ctePorParada: any) => ctePorParada.cte === cte.id,
              ),
            }));
            return objNFe;
          }),
        );

        const nFEsOrdenadas = nFEs.sort((a, b) => {
          if (a[0].cep < b[0].cep) return -1; // `a` vem antes de `b`
          if (a[0].cep > b[0].cep) return 1; // `a` vem depois de `b`
          return 0; // `a` e `b` são iguais
        });

        const res = {
          motorista: motorista,
          Nfes: nFEsOrdenadas,
        };

        const base64PDF = await generatePDF(res);

        reply.code(200).send({ pdfBase64: base64PDF });
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );
  const generatePDF = async (data: any) => {
    const doc = new PDFDocument({ margins: { top: 20, bottom: 0, left: 30, right: 30 } });
    let buffers: any = [];
    const motorista = data.motorista;
    const Nfes = data.Nfes;
    let currentPage = 1;
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
        console.log("PDF gerado");
    });

    doc.fontSize(7).text(`PLACA: ${motorista.placa}`, { continued: true, align: "left" })
        .text(` CPF: ${cpfMask(data.motorista.cpf)}`, { continued: true, align: "left" })
        .text(` NOME: ${data.motorista.nome}`, { align: "left" });
    doc.moveDown(1);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(1);

    for (let i = 0; i < Nfes.length; i++) {
        const indice = i + 1;
        const stops = Nfes[i];
        const quebraPagina = indice % 4 === 0;

        for (const stop of stops) {
            doc.fontSize(7).text(`NF: ${stop.nrNfre}`, { continued: true, align: "left" })
                .text(` REMETENTE: ${stop.remetente}`, { continued: true, align: "center" })
                .text(` PREVISÃO ENTREGA: ${stop.prevEntrega}`, { align: "right" });
            doc.moveDown(0.5);
            doc.fontSize(7).text(`QTD VOLUMES: ${stop.qtdeVolumes}`, { align: "left" });
            doc.fontSize(7).text(`DESTINATÁRIO: ${stop.destinatario}`);
            doc.moveDown(0.5);
            doc.fontSize(7).text(`TELEFONE: ${stop.telefone || "N INF."} / ${stop.celular || "N INF."}`);
            doc.moveDown(0.5);
            doc.fontSize(7).text(`BAIRRO: ${stop.bairro}`, { align: "left" });

            if (stop.chaveNFe || stop.chaveCTe) {
                const chave = stop.chaveNFe && stop.chaveNFe.trim() !== "" ? stop.chaveNFe : stop.chaveCTe;
                const qrCodeBuffer = await generateQRCode(chave);
                doc.image(qrCodeBuffer, doc.page.width - doc.page.margins.right - 300, doc.y - 30, { fit: [60, 60] });
                const barcodeBuffer = await generateBarcode(chave);
                doc.image(barcodeBuffer, doc.page.width - doc.page.margins.right - 170, doc.y - 20, { fit: [170, 60] });
            }

            doc.moveDown(0.5);
            doc.fontSize(7).text(`CEP: ${stop.cep}`, { continued: true, align: "left" })
                .text(` ${stop.cidade} / ${stop.uf}`);
            doc.moveDown(0.5);
            doc.fontSize(7).text(`ENDEREÇO: ${stop.endereco} ${stop.numero}`);
            doc.moveDown(0.5);
            doc.fontSize(7).text(`COMPL.: ${stop.complemento || ""}`);
            doc.moveDown(2);

            const lineWidth = 100;
            doc.moveTo(doc.page.width - doc.page.margins.right - lineWidth, doc.y - 2)
                .lineTo(doc.page.width - doc.page.margins.right, doc.y - 2).stroke();
            doc.fontSize(7).text(`DATA`, { align: "right" });
            doc.moveDown(2);

            const lineWidthRecebedor = 120;
            doc.moveTo(doc.page.margins.left, doc.y - 2)
                .lineTo(doc.page.margins.left + lineWidthRecebedor, doc.y - 2).stroke();
            doc.fontSize(7).text(`RECEBEDOR`, { continued: true, align: "left" });

            const lineWidthDocumento = 120;
            const offset = 20;
            doc.moveTo(doc.page.width / 2 - lineWidthDocumento / 2 + offset, doc.y - 2)
                .lineTo(doc.page.width / 2 + lineWidthDocumento / 2 + offset, doc.y - 2).stroke();
            doc.fontSize(7).text(`DOCUMENTO`, { continued: true, align: "center" });

            const lineWidthParentesco = 120;
            doc.moveTo(doc.page.width - doc.page.margins.right - lineWidthParentesco, doc.y - 2)
                .lineTo(doc.page.width - doc.page.margins.right, doc.y - 2).stroke();
            doc.fontSize(7).text(`GRAU DE PARENTESCO`, { align: "right" });


            if(!quebraPagina){
              doc.moveDown(4);
              doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
              doc.moveDown(3);
            } else {
              doc.fontSize(7).text(`Página ${currentPage}`, { align: "center" });
              if (indice < Nfes.length) doc.addPage();
                currentPage++;
            }
        }
    }

    doc.end();

    return new Promise((resolve, reject) => {
        doc.on("end", () => {
            const pdfBuffer = Buffer.concat(buffers);
            const base64PDF = pdfBuffer.toString("base64");
            resolve(base64PDF);
        });
        doc.on("error", reject);
    });
};

  // const generatePDF = async (data: any) => {
  //   const doc = new PDFDocument({ margin: 30 });
  //   let buffers: any = [];
  //   const motorista = data.motorista;
  //   const Nfes = data.Nfes;
  //   let currentPage = 1;
  //   // Adiciona buffers para armazenar o conteúdo do PDF
  //   doc.on("data", buffers.push.bind(buffers));

  //   // Finaliza o PDF e concatena os buffers
  //   doc.on("end", () => {
  //     console.log("PDF gerado");
  //   });

  //   doc
  //     .fontSize(7)
  //     .text(`PLACA: ${motorista.placa}`, { continued: true, align: "left" })
  //     .text(` CPF: ${cpfMask(data.motorista.cpf)}`, {
  //       continued: true,
  //       align: "left",
  //     })
  //     .text(` NOME: ${data.motorista.nome}`, {
  //       align: "left",
  //     });
  //   doc.moveDown(0.5); // Espaço extra após a linha
  //   doc
  //     .moveTo(doc.page.margins.left, doc.y)
  //     .lineTo(doc.page.width - doc.page.margins.right, doc.y)
  //     .stroke();
  //   doc.moveDown(0.5); // Espaço extra após a linha
  //   // Loop pelas paradas
  //   for (let i = 0; i < Nfes.length; i++) {
  //     const indice = i + 1;
  //     const stops = Nfes[i];
  //     const quebraPagina = indice % 4 === 0;
  //     for (const stop of stops) {
  //       // Título
  //       // if (currentPage > 1) doc.moveDown(2);
  //       doc
  //         // .moveTo(doc.page.margins.left, doc.y)
  //         .fontSize(7)
  //         .text(`NF: ${stop.nrNfre}`, { continued: true, align: "left" })
  //         .fontSize(7)
  //         .text(` REMETENTE: ${stop.remetente}`, {
  //           continued: true,
  //           align: "center",
  //         })
  //         .fontSize(7)
  //         .text(` PREVISÃO ENTREGA: ${stop.prevEntrega}`, { align: "right" });
  //       doc.moveDown(0.2);
  //       doc
  //         .fontSize(7)
  //         .text(`QTD VOLUMES: ${stop.qtdeVolumes}`, { align: "left" });

  //       doc.fontSize(7).text(`DESTINATÁRIO: ${stop.destinatario}`);
  //       doc.moveDown(0.2);

  //       doc
  //         .fontSize(7)
  //         .text(
  //           `TELEFONE: ${stop.telefone || "N INF."} / ${
  //             stop.celular || "N INF."
  //           }`,
  //         );
  //       doc.moveDown(0.2);

  //       doc.fontSize(7).text(`BAIRRO: ${stop.bairro}`, { align: "left" });
  //       if (stop.chaveNFe || stop.chaveCTe) {
  //         const chave = stop.chaveNFe && stop.chaveNFe.trim() !== "" ? stop.chaveNFe : stop.chaveCTe;
  //         const qrCodeBuffer = await generateQRCode(chave);
  //         doc.image(
  //           qrCodeBuffer,
  //           doc.page.width - doc.page.margins.right - 300,
  //           doc.y - 30,
  //           {
  //             fit: [60, 60], // Tamanho do QR Code
  //             align: "center",
  //             valign: "top",
  //           },
  //         );

  //         const barcodeBuffer = await generateBarcode(chave);
  //         doc.image(
  //           barcodeBuffer,
  //           doc.page.width - doc.page.margins.right - 170,
  //           doc.y - 20,
  //           {
  //             fit: [170, 60], // Novo tamanho do código de barras
  //             align: "right", // Mantém à direita
  //             valign: "top", // Alinha no topo
  //           },
  //         );
  //       }
  //       doc.moveDown(0.2);

  //       doc
  //         .fontSize(7)
  //         .text(`CEP: ${stop.cep}`, { continued: true, align: "left" })
  //         .fontSize(7)
  //         .text(` ${stop.cidade} / ${stop.uf}`);
  //       doc.moveDown(0.2);

  //       doc.fontSize(7).text(`ENDEREÇO: ${stop.endereco} ${stop.numero}`);
  //       doc.moveDown(0.2);

  //       doc.fontSize(7).text(`COMPL.: ${stop.complemento || ""}`);
  //       doc.moveDown(0.5);

  //       // Reduz o tamanho da linha, deixando-a mais curta
  //       const lineWidth = 100; // Largura da linha menor
  //       doc
  //         .moveTo(
  //           doc.page.width - doc.page.margins.right - lineWidth,
  //           doc.y - 2,
  //         )
  //         .lineTo(doc.page.width - doc.page.margins.right, doc.y - 2)
  //         .stroke();
  //       doc.fontSize(7).text(`DATA`, { align: "right" });
  //       doc.moveDown(2);

  //       const lineWidthRecebedor = 120; // Defina o tamanho desejado da linha
  //       doc
  //         .moveTo(doc.page.margins.left, doc.y - 2)
  //         .lineTo(doc.page.margins.left + lineWidthRecebedor, doc.y - 2)
  //         .stroke();
  //       doc.fontSize(7).text(`RECEBEDOR`, { continued: true, align: "left" });

  //       // Linha e texto para "DOCUMENTO"
  //       const lineWidthDocumento = 120; // Defina o tamanho desejado da linha
  //       const offset = 20; // Ajuste para mover o traço à direita
  //       doc
  //         .moveTo(
  //           doc.page.width / 2 - lineWidthDocumento / 2 + offset,
  //           doc.y - 2,
  //         ) // Centraliza e ajusta para a direita
  //         .lineTo(
  //           doc.page.width / 2 + lineWidthDocumento / 2 + offset,
  //           doc.y - 2,
  //         )
  //         .stroke();
  //       doc.fontSize(7).text(`DOCUMENTO`, { continued: true, align: "center" });

  //       // Linha e texto para "GRAU DE PARENTESCO"
  //       const lineWidthParentesco = 120; // Defina o tamanho desejado da linha
  //       doc
  //         .moveTo(
  //           doc.page.width - doc.page.margins.right - lineWidthParentesco,
  //           doc.y - 2,
  //         )
  //         .lineTo(doc.page.width - doc.page.margins.right, doc.y - 2)
  //         .stroke();
  //       doc.fontSize(7).text(`GRAU DE PARENTESCO`, { align: "right" });

  //       doc.moveDown(quebraPagina ? 2 : 5); // Espaço extra após a linha
  //       if (!quebraPagina) {
  //         doc
  //           .moveTo(doc.page.margins.left, doc.y)
  //           .lineTo(doc.page.width - doc.page.margins.right, doc.y)
  //           .stroke();
  //         doc.moveDown(5); // Espaço extra após a linha
  //       }
  //     }

  //     if (quebraPagina) {
  //       doc.fontSize(7).text(`Página ${currentPage}`, {
  //         align: "center",
  //         baseline: "bottom",
  //       });
  //       if (indice < Nfes.length) doc.addPage();

  //       currentPage++;
  //     }
  //   }

  //   // Finalizar o documento
  //   doc.end();

  //   // Retorna o PDF como base64
  //   return new Promise((resolve, reject) => {
  //     doc.on("end", () => {
  //       const pdfBuffer = Buffer.concat(buffers);
  //       const base64PDF = pdfBuffer.toString("base64");
  //       resolve(base64PDF);
  //     });

  //     doc.on("error", reject);
  //   });
  // };

  const generateBarcode = async (text: any) => {
    return new Promise((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid: "code128", // Tipo de código de barras
          text: text, // Texto para codificar
          scale: 2, // Escala do código de barras
          height: 10, // Altura
          includetext: true, // Incluir texto abaixo
          textxalign: "center", // Centralizar texto
        },
        (err: any, png: any) => {
          if (err) return reject(err);
          resolve(png);
        },
      );
    });
  };

  const cpfMask = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  async function generateQRCode(chaveNFe: any) {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(chaveNFe);
      return qrCodeBuffer;
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      throw error;
    }
  }

  fastify.get(
    "/notaFiscal/listarObjPorPlaca",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { placa } = request.query as { placa: string };

        const ctesMotorista = await prisma.ctes.findMany({
          where: {
            placaVeiculo: placa,
            listarCTE: true,
            codUltOco: 85,
          },
          include: {
            motorista: true,
            NotaFiscal: true,
            remetente: true,
            destinatario: true,
            recebedor: true,
          },
        });
        let motorista: any = "";

        const CNPJ_CEP = await prisma.cnpjTb.findMany({
          where: { idAtivo: true },
        });

        const nFEs = await Promise.all(
          ctesMotorista.map(async (cte) => {
            if (motorista == "") {
              motorista = {
                ...cte.motorista,
                placa: placa,
              };
            }

            if (CNPJ_CEP.some((item) => item.CNPJ === cte.remetente.cnpjCPF)) {
              cte.recebedor.endereco = await buscarCep(cte.recebedor.cep);
            }
            const objNFe = cte.NotaFiscal.map((nfe: any) => ({
              chaveCte: cte.chaveCTe,
              chaveNFe: nfe.chaveNFe,
              nrNfre: nfe.nroNF,
              qtdeVolumes: nfe.qtdeVolumes,
              remetente: cte.remetente.nome,
              prevEntrega: cte.previsaoEntrega,
              destinatario: cte.destinatario.nome,
              bairro: cte.recebedor.bairro,
              cep: cte.recebedor.cep,
              endereco: cte.recebedor.endereco,
              numero: cte.recebedor.numero,
              cidade: cte.recebedor.cidade,
              telefone: cte.recebedor.foneContato,
              celular: cte.recebedor.celularContato,
              uf: cte.recebedor.uf,
              complemento: cte.recebedor.complemento,
              ctesPorParada: ctesMotorista.filter(
                (ctePorParada: any) => ctePorParada.cte === cte.id,
              ),
            }));
            return objNFe;
          }),
        );

        const nFEsOrdenadas = nFEs.sort((a, b) => {
          if (a[0].cep < b[0].cep) return -1; // `a` vem antes de `b`
          if (a[0].cep > b[0].cep) return 1; // `a` vem depois de `b`
          return 0; // `a` e `b` são iguais
        });

        const res = {
          motorista: motorista,
          Nfes: nFEsOrdenadas,
        };

        return res;
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

  fastify.get(
    "/notaFiscal/listarPorCte",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.query as { id: number };

        const cte = await prisma.ctes.findMany({
          where: {
            id: Number(id),
          },
          include: {
            motorista: true,
            NotaFiscal: true,
            remetente: true,
            destinatario: true,
            recebedor: true,
          },
        });
        let motorista: any = "";

        const CNPJ_CEP = await prisma.cnpjTb.findMany({
          where: { idAtivo: true },
        });

        const nFEs = await Promise.all(
          cte.map(async (cte) => {
            if (motorista == "") {
              motorista = {
                ...cte.motorista,
              };
            }

            if (CNPJ_CEP.some((item) => item.CNPJ === cte.remetente.cnpjCPF)) {
              cte.recebedor.endereco = await buscarCep(cte.recebedor.cep);
            }
            const objNFe = cte.NotaFiscal.map((nfe: any) => ({
              chaveCte: cte.chaveCTe,
              chaveNFe: nfe.chaveNFe,
              nrNfre: nfe.nroNF,
              qtdeVolumes: nfe.qtdeVolumes,
              remetente: cte.remetente.nome,
              prevEntrega: cte.previsaoEntrega,
              destinatario: cte.destinatario.nome,
              bairro: cte.recebedor.bairro,
              cep: cte.recebedor.cep,
              endereco: cte.recebedor.endereco,
              numero: cte.recebedor.numero,
              cidade: cte.recebedor.cidade,
              telefone: cte.recebedor.foneContato,
              celular: cte.recebedor.celularContato,
              uf: cte.recebedor.uf,
              complemento: cte.recebedor.complemento,
              ctesPorParada: cte,
            }));
            return objNFe;
          }),
        );

        const nFEsOrdenadas = nFEs.sort((a, b) => {
          if (a[0].cep < b[0].cep) return -1; // `a` vem antes de `b`
          if (a[0].cep > b[0].cep) return 1; // `a` vem depois de `b`
          return 0; // `a` e `b` são iguais
        });

        const res = {
          motorista: motorista,
          Nfes: nFEsOrdenadas,
        };

        return res;
      } catch (error: any) {
        reply.code(500).send({ error: error.message });
      }
    },
  );

}
