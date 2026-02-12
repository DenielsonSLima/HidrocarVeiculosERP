
export interface ICondicaoRecebimento {
  id: string;
  user_id?: string;
  
  forma_pagamento_id: string; // Vínculo correto com a tabela cad_formas_pagamento
  
  nome: string; // Ex: 30/60/90, A Vista
  
  qtd_parcelas: number;
  dias_primeira_parcela: number; // 0 = A vista
  dias_entre_parcelas: number;
  
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}
