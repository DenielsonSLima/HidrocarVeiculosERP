
export interface ICondicaoPagamento {
  id: string;
  user_id?: string;
  forma_pagamento_id: string;
  
  nome: string; // Ex: 30/60/90, 3x Cartão
  
  qtd_parcelas: number;
  dias_primeira_parcela: number; // 0 = A vista
  dias_entre_parcelas: number;
  
  taxa_juros_mensal?: number;
  multa_atraso?: number;
  
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}
