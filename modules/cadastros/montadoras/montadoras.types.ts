
export interface IMontadora {
  id: string;
  user_id?: string;
  nome: string;
  logo_url: string;
  created_at: string;
  updated_at?: string;
}

export interface IMontadoraResponse {
  data: IMontadora[];
  count: number;
  currentPage: number;
  totalPages: number;
}

export interface IMontadoraFiltros {
  search?: string;
  page?: number;
  limit?: number;
}

export interface IMontadorasKpis {
  total: number;
  recentes: number;
}
