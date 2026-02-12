
export interface ICidade {
  id: string;
  user_id?: string;
  nome: string;
  uf: string;
  created_at: string;
}

export interface ICidadesAgrupadas {
  [uf: string]: ICidade[];
}
