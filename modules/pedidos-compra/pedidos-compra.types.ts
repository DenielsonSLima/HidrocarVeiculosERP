
import { IParceiro } from '../parceiros/parceiros.types';
import { IFormaPagamento } from '../cadastros/formas-pagamento/formas-pagamento.types';
import { ICondicaoPagamento } from '../cadastros/condicoes-pagamento/condicoes-pagamento.types';
import { ICorretor } from '../cadastros/corretores/corretores.types';
import { IVeiculo } from '../estoque/estoque.types';
import { IContaBancaria } from '../ajustes/contas-bancarias/contas.types';

export type StatusPedidoCompra = 'RASCUNHO' | 'CONCLUIDO' | 'CANCELADO';

export interface IPedidoPagamento {
  id: string;
  pedido_id: string;
  data_pagamento: string;
  forma_pagamento_id: string;
  condicao_id?: string;
  conta_bancaria_id?: string;
  valor: number;
  observacao?: string;
  created_at?: string;

  // Joins
  forma_pagamento?: IFormaPagamento;
  condicao?: ICondicaoPagamento;
  conta_bancaria?: IContaBancaria;
}

export interface IPedidoCompra {
  id: string;
  user_id?: string;
  data_compra: string;
  corretor_id?: string;
  fornecedor_id?: string;
  forma_pagamento_id?: string;

  endereco_igual_cadastro: boolean;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  complemento?: string;

  observacoes?: string;
  status: StatusPedidoCompra;
  created_at: string;
  updated_at?: string;

  numero_pedido?: string;
  descricao_veiculo?: string;
  valor_negociado: number;
  veiculo_id?: string;
  previsao_pagamento?: string;

  // Joins
  fornecedor?: IParceiro;
  corretor?: ICorretor;
  forma_pagamento?: IFormaPagamento;
  veiculos?: IVeiculo[];
  pagamentos?: IPedidoPagamento[];
}

export interface IPedidoFiltros {
  busca: string;
  dataInicio: string;
  dataFim: string;
  corretorId: string;
  socioId: string;
  page?: number;
  limit?: number;
}

export interface IPedidoCompraResponse {
  data: IPedidoCompra[];
  count: number;
  currentPage: number;
  totalPages: number;
}
