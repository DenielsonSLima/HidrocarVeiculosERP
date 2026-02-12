
export type TipoMacroDespesa = 'FIXA' | 'VARIAVEL';

export interface ICategoriaDespesa {
  id: string;
  grupo_id: string;
  nome: string;
  user_id?: string;
  created_at?: string;
}

export interface IGrupoDespesa {
  id: string;
  nome: string;
  tipo: TipoMacroDespesa;
  user_id?: string;
  created_at?: string;
  // Relacionamento (Front-only)
  categorias?: ICategoriaDespesa[];
}
