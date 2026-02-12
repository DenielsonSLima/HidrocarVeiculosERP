import { ITitulo } from '../../financeiro.types';

export type PagarTab = 'MES_ATUAL' | 'ATRASADOS' | 'OUTROS';

export interface IPagarFiltros {
  busca?: string;
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IPagarResponse {
  data: ITituloPagar[];
  count: number;
  currentPage: number;
  totalPages: number;
}

// Fix: Interface 'ITituloPagar' incorrectly extends interface 'ITitulo' due to partial join objects.
// Usando Omit para permitir a redefinição de 'parceiro' e 'categoria' com a estrutura simplificada vinda do Supabase .select().
export interface ITituloPagar extends Omit<ITitulo, 'parceiro' | 'categoria'> {
  parceiro?: {
    nome: string;
    documento: string;
  };
  categoria?: {
    nome: string;
  };
  pedido_compra?: {
    id: string;
    numero_pedido: string;
  };
}
