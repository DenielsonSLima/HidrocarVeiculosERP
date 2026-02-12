
export interface ITipoRecebimento {
  id: string;
  user_id?: string;
  nome: string; // Ex: Dinheiro, PIX, Cartão de Crédito, Boleto
  created_at: string;
  updated_at?: string;
}
