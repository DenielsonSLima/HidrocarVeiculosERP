export interface IVeiculoFoto {
  id: string;
  url: string;
  ordem: number;
  is_capa: boolean;
}

export interface IVeiculoSocio {
  socio_id: string;
  nome: string;
  valor: number;
  porcentagem: number;
}

export interface IVeiculoDespesa {
  id: string;
  veiculo_id: string;
  data: string;
  data_vencimento?: string;
  status_pagamento: 'PAGO' | 'PENDENTE';
  tipo: 'VARIAVEL';
  categoria_id: string;
  categoria_nome?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  forma_pagamento_id: string;
  conta_bancaria_id?: string;
  created_at?: string;
}

export interface IVeiculo {
  id: string;
  user_id?: string;
  montadora_id: string;
  tipo_veiculo_id: string;
  modelo_id: string;
  versao_id: string;
  cor_id: string;
  placa: string;
  chassi: string;
  renavam?: string;
  km: number;
  ano_fabricacao: number;
  ano_modelo: number;
  combustivel: string;
  transmissao: string;
  motorizacao: string;
  portas: number;
  valor_custo: number;
  valor_custo_servicos: number;
  valor_venda: number;
  valor_promocional?: number;
  status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'PREPARACAO';
  pedido_id?: string; // ID do pedido de compra de origem
  publicado_site: boolean; // Controle de visibilidade externa
  fotos: IVeiculoFoto[];
  socios: IVeiculoSocio[];
  despesas?: IVeiculoDespesa[];
  caracteristicas_ids: string[];
  opcionais_ids: string[];
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IEstoqueResponse {
  data: IVeiculo[];
  count: number;
  currentPage: number;
  totalPages: number;
}

export interface IEstoqueFilters {
  page: number;
  limit: number;
  search?: string;
  montadoraId?: string;
  tipoId?: string;
  statusTab?: 'DISPONIVEL' | 'RASCUNHO' | 'TODOS';
}