import { Recebedor } from "@prisma/client";
import ExcelJS from "exceljs";

export async function convertToXlsxReturnBase64(enderecos: Recebedor[]) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Endereços");

	worksheet.columns = [
	  { header: "Nome", key: "nome", width: 30 },
	  { header: "Endereço", key: "endereco", width: 30 },
	  { header: "Número", key: "numero", width: 10 },
	  { header: "Bairro", key: "bairro", width: 20 },
	  { header: "CEP", key: "cep", width: 15 },
	  { header: "Cidade", key: "cidade", width: 20 },
	  { header: "UF", key: "uf", width: 5 },
	  { header: "Complemento", key: "complemento", width: 20 },
	];

	enderecos.forEach((recebedor: Recebedor) => {
	  worksheet.addRow(recebedor);
	});

	const buffer = await workbook.xlsx.writeBuffer();

	// (OPCIONAL) Salvar um arquivo temporário para testar manualmente
	// fs.writeFileSync('enderecos.xlsx', Buffer.from(buffer));

	const base64 = Buffer.from(buffer).toString("base64");
	return base64;
  }