
export interface IDashboardStats {
  totalEstoque: number;
  valorGlobalEstoque: number;
  totalParceiros: number;
  vendasMesAtual: number;
  lucroProjetado: number;
}

export interface IRecentActivity {
  id: string;
  tipo: 'ESTOQUE' | 'PARCEIRO' | 'FINANCEIRO';
  descricao: string;
  data: string;
}
