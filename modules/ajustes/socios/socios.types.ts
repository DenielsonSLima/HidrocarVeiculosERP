
export interface IPatrimonio {
  id: string;
  descricao: string;
  valor: number;
  data: string;
}

export interface ISocio {
  id?: string; // Opcional na criação
  user_id?: string;
  nome: string;
  cpf: string;
  telefone?: string; // Mantido como opcional
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Endereço removido do cadastro simplificado, mas mantido opcional na tipagem caso venha do banco legado
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  complemento?: string;

  // Gestão de Compras/Patrimônio (JSONB no banco)
  patrimonio: IPatrimonio[];
}
