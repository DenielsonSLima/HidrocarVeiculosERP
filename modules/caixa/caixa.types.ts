import { IContaBancaria } from '../ajustes/contas-bancarias/contas.types';
import { ITransacao } from '../financeiro/financeiro.types';

export interface ISocioStockStats {
  socio_id: string;
  nome: string;
  valor_investido: number; // Capital no estoque (Exposição)
  porcentagem_estoque: number;
  quantidade_carros: number;
  lucro_periodo: number; // Lucro nas vendas do mês
  veiculos: {
    id: string;
    modelo: string;
    placa: string;
    valor: number;
    imagem?: string;
  }[];
}

export interface ICaixaDashboardData {
  // KPIs Principais
  patrimonio_liquido: number;
  saldo_disponivel: number;
  total_ativos_estoque: number;
  total_recebiveis: number;
  total_passivo_circulante: number;

  // Detalhamento
  contas: IContaBancaria[];
  investimento_socios: ISocioStockStats[];
  transacoes: ITransacao[];

  // Resultados do Período
  total_compras: number;
  total_vendas: number;
  lucro_mensal: number;
}

export interface IForecastMes {
  mes: string; // ex: 'Mar/2026'
  mesNum: number;
  ano: number;
  contas_pagar: number;
  contas_receber: number;
  lucro_projetado: number; // receber - pagar
}

export type CaixaTab = 'MES_ATUAL' | 'ANTERIORES';
