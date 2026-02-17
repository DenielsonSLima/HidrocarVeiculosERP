import { ITitulo } from '../../financeiro.types';

export type ReceberTab = 'MES_ATUAL' | 'ATRASADOS' | 'OUTROS';

export interface IReceberFiltros {
  busca?: string;
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IReceberResponse {
  data: ITituloReceber[];
  count: number;
  currentPage: number;
  totalPages: number;
}

export interface ITituloReceber extends Omit<ITitulo, 'parceiro' | 'categoria'> {
  parceiro?: {
    nome: string;
    documento: string;
  };
  categoria?: {
    nome: string;
  };
}
