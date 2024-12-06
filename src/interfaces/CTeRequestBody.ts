interface Remetente {
  cnpjCPF: string;
  tipo?: 'PJ' | 'PF';
  nome: string;
}

interface Destinatario {
  cnpjCPF: string;
  tipo?: 'PJ' | 'PF';
  nome: string;
}

interface Recebedor {
  cnpjCPF: string;
  tipo?: 'PJ' | 'PF';
  nome: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  foneContato?: string;
}

export interface CTeRequestBody {
  chaveCTe: string;
  valorFrete: number;
  ordem: number;
  nomeMotorista: string;
  cpfMotorista: string;
  placaVeiculo: string;
  previsaoEntrega: string; // Consider using `Date` if you're parsing to a date
  remetente: Remetente;
  destinatario: Destinatario;
  recebedor: Recebedor;
}