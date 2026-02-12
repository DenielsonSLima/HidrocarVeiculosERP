
export interface IMarcaDaguaConfig {
  id?: string;
  user_id?: string;
  logo_url: string;
  opacidade: number; // 0 to 100
  tamanho: number; // 10 to 100 (escala em %)
  created_at?: string;
  updated_at?: string;
}
