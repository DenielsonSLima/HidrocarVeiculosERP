
export enum TipoParceiro {
  CLIENTE = 'CLIENTE',
  FORNECEDOR = 'FORNECEDOR',
  AMBOS = 'AMBOS'
}

export enum PessoaTipo {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA'
}

export interface IParceiro {
  id: string;
  user_id?: string;
  pessoa_tipo: PessoaTipo;
  nome: string; // Nome ou Razão Social principal
  razao_social?: string; // Opcional se for PF
  documento: string; // CPF ou CNPJ
  inscricao_estadual?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  tipo: TipoParceiro;
  ativo: boolean;
  created_at: string;
  updated_at?: string;

  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
}

export type ParceiroTab = 'ativos' | 'clientes' | 'fornecedores' | 'inativos';

export interface IParceirosFilters {
  page: number;
  limit: number;
  search?: string;
  tab?: ParceiroTab;
}

export interface IParceirosResponse {
  data: IParceiro[];
  count: number;
  currentPage: number;
  totalPages: number;
}

export interface IParceirosStats {
  total: number;
  ativos: number;
  clientes: number;
  fornecedores: number;
  inativos: number;
}
