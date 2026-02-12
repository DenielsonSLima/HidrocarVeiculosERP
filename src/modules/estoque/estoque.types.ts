
export interface IVeiculoFoto {
  id: string; // uuid
  url: string;
  ordem: number;
  is_capa: boolean;
}

export interface IVeiculo {
  id: string;
  user_id?: string;
  
  // Relacionamentos Cadastrais
  montadora_id: string;
  tipo_veiculo_id: string;
  modelo_id: string;
  versao_id: string;
  cor_id: string;
  
  // Dados Técnicos
  placa: string;
  chassi: string;
  renavam?: string;
  km: number;
  ano_fabricacao: number;
  ano_modelo: number;
  combustivel: string; // Texto livre ou ID se quiser normalizar estritamente
  transmissao: string; // Texto livre ou ID
  motorizacao: string; // Texto livre ou ID
  portas: number;

  // Financeiro
  valor_custo: number;
  valor_venda: number;
  valor_promocional?: number;

  // Status
  status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'PREPARACAO';
  
  // Metadados
  fotos: IVeiculoFoto[];
  
  // Arrays de IDs para N:N (Relacionamentos)
  caracteristicas_ids: string[];
  opcionais_ids: string[];
  
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}
