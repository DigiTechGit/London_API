"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/report.ts
var report_exports = {};
__export(report_exports, {
  convertToXlsxReturnBase64: () => convertToXlsxReturnBase64
});
module.exports = __toCommonJS(report_exports);
var import_exceljs = __toESM(require("exceljs"));
async function convertToXlsxReturnBase64(enderecos) {
  const workbook = new import_exceljs.default.Workbook();
  const worksheet = workbook.addWorksheet("Endere\xE7os");
  worksheet.columns = [
    { header: "Nome", key: "nome", width: 30 },
    { header: "Endere\xE7o", key: "endereco", width: 30 },
    { header: "N\xFAmero", key: "numero", width: 10 },
    { header: "Bairro", key: "bairro", width: 20 },
    { header: "CEP", key: "cep", width: 15 },
    { header: "Cidade", key: "cidade", width: 20 },
    { header: "UF", key: "uf", width: 5 },
    { header: "Complemento", key: "complemento", width: 20 }
  ];
  enderecos.forEach((recebedor) => {
    worksheet.addRow(recebedor);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return base64;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  convertToXlsxReturnBase64
});
