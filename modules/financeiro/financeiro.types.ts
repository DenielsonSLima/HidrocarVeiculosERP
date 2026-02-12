import { IContaBancaria } from '../ajustes/contas-bancarias/contas.types';
import { IParceiro } from '../parceiros/parceiros.types';
import { IFormaPagamento } from '../cadastros/formas-pagamento/formas-pagamento.types';

export type TipoTitulo = 'PAGAR' | 'RECEBER';
export type StatusTitulo = 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
export type TipoCategoria = 'FIXA' | 'VARIAVEL' | 'OUTROS';

export interface ICategoriaFinanceira {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  natureza: 'ENTRADA' | 'SAIDA';
}

// Fix: Adding IFinanceiroKpis interface to satisfy imports in Financeiro.page.tsx
export interface IFinanceiroKpis {
  saldo_total: number;
  pagar_mes: number;
  receber_mes: number;
  balanco_projetado: number;
}

export interface ITitulo {
  id: string;
  parceiro_id?: string;
  categoria_id?: string;
  descricao: string;
  tipo: TipoTitulo;
  status: StatusTitulo;
  valor_total: number;
  valor_pago: number;
  data_emissao: string;
  data_vencimento: string;
  parcela_numero: number;
  parcela_total: number;
  grupo_id?: string;
  documento_ref?: string;
  created_at: string;

  // Joins
  parceiro?: IParceiro;
  categoria?: ICategoriaFinanceira;
}

export interface ITransacao {
  id: string;
  titulo_id?: string;
  conta_origem_id?: string;
  conta_destino_id?: string;
  valor: number;
  data_pagamento: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';
  tipo_transacao?: string; // Added to match service usage
  forma_pagamento_id?: string;
  comprovante_url?: string;
  descricao?: string; // Added to match service usage

  // Joins
  titulo?: ITitulo;
  conta_origem?: IContaBancaria;
  forma_pagamento?: IFormaPagamento;
}

export interface IExtratoFiltros {
  dataInicio?: string;
  dataFim?: string;
  tipo?: string;
  page?: number;
  limit?: number;
}

export interface IExtratoResponse {
  data: ITransacao[];
  count: number;
  currentPage: number;
  totalPages: number;
}