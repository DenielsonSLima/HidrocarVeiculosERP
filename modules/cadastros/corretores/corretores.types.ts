
export interface ICorretor {
  id: string;
  user_id?: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}
