
export interface ICombustivel {
  id: string;
  user_id?: string;
  nome: string; // Ex: Gasolina, Etanol, Diesel, Flex, Elétrico
  created_at: string;
  updated_at?: string;
}
