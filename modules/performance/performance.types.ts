export type PerformanceTab =
  | 'STRATEGIC'
  | 'FINANCIAL'
  | 'INVENTORY'
  | 'PURCHASING'
  | 'SALES'
  | 'OPERATIONAL';

export interface IStrategicKpis {
  lucro_liquido_mensal: number;
  margem_media_loja: number;
  roi_estoque: number;
  ponto_equilibrio: number;
  capital_imobilizado: number;
  crescimento_mensal: number;
  previsao_caixa_30d: number;
}

export interface IVehiclePerformance {
  id: string;
  modelo: string;
  placa: string;
  custo_aquisicao: number;
  custo_total: number;
  preco_venda: number;
  lucro_bruto: number;
  lucro_liquido: number;
  margem_percent: number;
  dias_estoque: number;
  custo_capital_parado: number;
}

export interface IInventoryAnalytics {
  giro_estoque: number;
  tempo_medio_venda: number;
  encalhados_30: number;
  encalhados_60: number;
  encalhados_90: number;
  custo_diario_parado: number;
}

export interface ISalesPerformance {
  vendedor_nome: string;
  qtd_vendida: number;
  ticket_medio: number;
  margem_media: number;
  taxa_desconto: number;
  comissao_paga: number;
  lucro_liquido_gerado: number;
}

export interface IIntelligentAlert {
  id: string;
  nivel: 'CRITICO' | 'ATENCAO' | 'INFO';
  titulo: string;
  mensagem: string;
  veiculo_id?: string;
}

export interface IPurchasingPerformance {
  label: string;
  roi: number;
  color: string;
}

export interface IOperationalPerformance {
  tempo_compra_venda: number;
  tempo_preparacao: number;
  custo_medio_reforma: number;
}