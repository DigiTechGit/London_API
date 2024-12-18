export interface CTES {
  chaveCTe:         string;
  serCTRC:          string;
  nroCTRC:          number;
  valorFrete:       number;
  valorImpostoCTRC: number;
  nomeMotorista:    string;
  cpfMotorista:     string;
  placaVeiculo:     string;
  previsaoEntrega:  string;
  ordem:            number;
  setor:            string;
  especie:          number;
  codUltOco:        number;
  desUltOco:        string;
  entregaAgendada:  string;
  prevChegada:      string;
  remetente:        Destinatario;
  destinatario:     Destinatario;
  recebedor:        Recebedor;
  notasFiscais:     NotasFiscai[];
}

export interface Destinatario {
  cnpjCPF: string;
  tipo:    string;
  nome:    string;
}

export interface NotasFiscai {
  chave_nfe:       string;
  serNF:           string;
  nroNF:           number;
  nroPedido:       string;
  qtdeVolumes:     number;
  volumes:         string[];
  pesoReal:        number;
  metragemCubica:  number;
  valorMercadoria: number;
}

export interface Recebedor {
  cnpjCPF:     string;
  tipo:        string;
  nome:        string;
  endereco:    string;
  numero:      string;
  bairro:      string;
  cep:         number;
  cidade:      string;
  uf:          string;
  foneContato: string;
}
