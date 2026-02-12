import { IContaBancaria } from '../../../ajustes/contas-bancarias/contas.types';

export interface ITransferencia {
  id: string;
  user_id?: string;
  data: string;
  descricao: string;
  valor: number;
  conta_origem_id: string;
  conta_destino_id: string;
  created_at: string;
  
  // Joins
  conta_origem?: IContaBancaria;
  conta_destino?: IContaBancaria;
}

export type TransferenciaTab = 'MES_ATUAL' | 'TODOS';
