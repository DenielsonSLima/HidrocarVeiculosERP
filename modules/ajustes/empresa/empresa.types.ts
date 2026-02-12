
export interface IEmpresa {
  id?: string;
  user_id?: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  inscricao_estadual?: string;
  email?: string;
  telefone?: string;
  website?: string;
  
  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IBrasilAPICNPJ {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  municipio: string;
  ddd_telefone_1: string;
  email: string;
}
