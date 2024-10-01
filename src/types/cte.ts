// src/types/Cte.ts
export interface Cte {
  chaveCTe: string;
  serCTRC: string;
  nroCTRC: number;
  valorFrete: number;
  valorImpostoCTRC: number;
  nomeMotorista: string;
  cpfMotorista: string;
  placaVeiculo: string;
  previsaoEntrega: string; // ou Date, dependendo de como você irá manipulá-la
  ordem: number;
  setor: string;
  especie: number;
  codUltOco: number;
  desUltOco: string;
  entregaAgendada: string;
  prevChegada: string;
  remetente: {
    cnpjCPF: string;
    tipo: string;
    nome: string;
  };
  destinatario: {
    cnpjCPF: string;
    tipo: string;
    nome: string;
  };
  recebedor: {
    cnpjCPF: string;
    tipo: string;
    nome: string;
    endereco: string;
    numero: string;
    bairro: string;
    cep: number;
    cidade: string;
    uf: string;
    foneContato: string;
  };
  notasFiscais: {
    chave_nfe: string;
    serNF: string;
    nroNF: number;
    nroPedido: string;
    qtdeVolumes: number;
    volumes: string[];
    pesoReal: number;
    metragemCubica: number;
    valorMercadoria: number;
  }[];
}
