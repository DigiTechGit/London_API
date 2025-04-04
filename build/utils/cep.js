"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/cep.ts
var cep_exports = {};
__export(cep_exports, {
  buscarCep: () => buscarCep
});
module.exports = __toCommonJS(cep_exports);
var buscarCep = async (cep) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error("Erro ao buscar CEP");
    }
    const data = await response.json();
    if (data.erro) {
      throw new Error("CEP n\xE3o encontrado");
    }
    return data.logradouro;
  } catch (error) {
    console.error(error);
    return "";
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buscarCep
});
