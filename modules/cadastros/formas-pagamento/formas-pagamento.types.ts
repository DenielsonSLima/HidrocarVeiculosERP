
export type TipoMovimentacao = 'RECEBIMENTO' | 'PAGAMENTO' | 'AMBOS';

export type DestinoLancamento = 
  | 'CAIXA'           // Caixa Imediato
  | 'CONTAS_RECEBER'  // Contas a Receber
  | 'CONTAS_PAGAR'    // Contas a Pagar
  | 'ATIVO'           // Ativo / Estoque (Trocas entrando)
  | 'CONSIGNACAO'     // Veículo de terceiros (Pagar na venda)
  | 'NENHUM';         // Nada financeiro

export interface IFormaPagamento {
  id: string;
  user_id?: string;
  nome: string; // Ex: PIX, Dinheiro, Cartão Crédito
  
  // 1. Tipo de Movimentação (Entrada/Saída)
  tipo_movimentacao: TipoMovimentacao; 
  
  // 2. Destino do Lançamento (Substitui momento/gera financeiro)
  destino_lancamento: DestinoLancamento;
  
  // 3. Parcelamento
  permite_parcelamento: boolean;
  qtd_max_parcelas?: number;
  
  // 4. Observações
  observacoes?: string;
  
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}
