
import { ISocio } from '../../../ajustes/socios/socios.types';
import { IContaBancaria } from '../../../ajustes/contas-bancarias/contas.types';

export type TipoRetirada = 'PRO_LABORE' | 'DISTRIBUICAO_LUCRO' | 'REEMBOLSO' | 'OUTROS';
export type RetiradaTab = 'MES_ATUAL' | 'OUTROS';
export type GroupByRetirada = 'nenhum' | 'mes' | 'socio';

export interface IRetirada {
  id: string;
  user_id?: string;
  data: string;
  socio_id: string;
  conta_origem_id: string;
  valor: number;
  descricao: string;
  tipo: TipoRetirada;
  created_at: string;
  
  // Joins
  socio?: ISocio;
  conta_origem?: IContaBancaria;
}

export interface IRetiradaFiltros {
  busca: string;
  dataInicio: string;
  dataFim: string;
  socioId: string;
  tipo: string;
}
