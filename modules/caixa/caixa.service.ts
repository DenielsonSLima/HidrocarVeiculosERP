
import { supabase } from '../../lib/supabase';
import { ICaixaDashboardData, ISocioStockStats } from './caixa.types';
import { FinanceiroService } from '../financeiro/financeiro.service';

export const CaixaService = {
  async getDashboardData(periodo: 'atual' | 'anteriores'): Promise<ICaixaDashboardData> {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // 1. Parallelize all independent database calls
    const [
      { data: contas },
      { data: veiculosNoPatio },
      { data: titulosPagar },
      { data: titulosReceber },
    ] = await Promise.all([
      // Saldos Bancários
      supabase.from('fin_contas_bancarias').select('*').order('banco_nome'),
      // Ativos (Estoque Físico)
      supabase.from('est_veiculos')
        .select('id, modelo, placa, valor_custo, valor_custo_servicos, socios, status, fotos')
        .in('status', ['DISPONIVEL', 'PREPARACAO', 'RESERVADO']),
      // Passivos (Contas a Pagar em Aberto)
      supabase.from('fin_titulos')
        .select('valor_total, valor_pago')
        .eq('tipo', 'PAGAR')
        .neq('status', 'PAGO')
        .neq('status', 'CANCELADO'),
      // Ativos Recebíveis (Contas a Receber em Aberto)
      supabase.from('fin_titulos')
        .select('valor_total, valor_pago')
        .eq('tipo', 'RECEBER')
        .neq('status', 'PAGO')
        .neq('status', 'CANCELADO'),
    ]);

    // 2. Parallelize more dependent queries that need periodo
    let queryVendas = supabase.from('venda_pedidos')
      .select(`
        valor_venda, 
        status, 
        data_venda,
        veiculo:est_veiculos(valor_custo, valor_custo_servicos)
      `)
      .eq('status', 'CONCLUIDO');

    if (periodo === 'atual') {
      queryVendas = queryVendas.gte('data_venda', firstDay).lte('data_venda', lastDay);
    } else {
      queryVendas = queryVendas.lt('data_venda', firstDay);
    }

    let queryCompras = supabase.from('cmp_pedidos')
      .select('valor_negociado')
      .eq('status', 'CONCLUIDO');

    if (periodo === 'atual') {
      queryCompras = queryCompras.gte('created_at', firstDay).lte('created_at', lastDay);
    }

    const [
      { data: vendas },
      { data: compras },
      extratoRes
    ] = await Promise.all([
      queryVendas,
      queryCompras,
      FinanceiroService.getExtrato({
        dataInicio: periodo === 'atual' ? firstDay : undefined,
        dataFim: periodo === 'atual' ? lastDay : firstDay,
        limit: 50
      })
    ]);

    // calculations...
    const saldoDisponivel = (contas || []).reduce((acc, c) => acc + (Number(c.saldo_atual) || 0), 0);
    const totalAtivos = (veiculosNoPatio || []).reduce((acc, v) => {
      const custoBase = Number(v.valor_custo) || 0;
      const custoExtras = Number(v.valor_custo_servicos) || 0;
      return acc + custoBase + custoExtras;
    }, 0);

    const socioMap = new Map<string, ISocioStockStats>();
    (veiculosNoPatio || []).forEach(v => {
      const sociosArray = Array.isArray(v.socios) ? v.socios : [];
      const custoTotalVeiculo = (Number(v.valor_custo) || 0) + (Number(v.valor_custo_servicos) || 0);

      sociosArray.forEach((s: any) => {
        if (!s.socio_id) return;
        const current = socioMap.get(s.socio_id) || {
          socio_id: s.socio_id, nome: s.nome, valor_investido: 0,
          porcentagem_estoque: 0, quantidade_carros: 0, lucro_periodo: 0,
          veiculos: []
        };
        const valorRealSocio = (Number(s.valor) > 0)
          ? Number(s.valor)
          : (custoTotalVeiculo * (Number(s.porcentagem) / 100));
        const capa = (v.fotos && Array.isArray(v.fotos) && v.fotos.length > 0) ? v.fotos[0] : undefined;
        socioMap.set(s.socio_id, {
          ...current,
          valor_investido: current.valor_investido + valorRealSocio,
          quantidade_carros: current.quantidade_carros + 1,
          veiculos: [...current.veiculos, {
            id: v.id,
            modelo: v.modelo || 'Sem Modelo',
            placa: v.placa || 'SEM-PLACA',
            valor: valorRealSocio,
            imagem: capa
          }]
        });
      });
    });

    const totalVendasVal = (vendas || []).reduce((acc, v) => acc + (Number(v.valor_venda) || 0), 0);
    const lucroDoPeriodo = (vendas || []).reduce((acc, v: any) => {
      const receita = Number(v.valor_venda) || 0;
      const custoVeiculo = (Number(v.veiculo?.valor_custo) || 0) + (Number(v.veiculo?.valor_custo_servicos) || 0);
      return acc + (receita - custoVeiculo);
    }, 0);

    const totalPassivo = (titulosPagar || []).reduce((acc, t) => acc + (Number(t.valor_total) - (Number(t.valor_pago) || 0)), 0);
    const totalRecebivel = (titulosReceber || []).reduce((acc, t) => acc + (Number(t.valor_total) - (Number(t.valor_pago) || 0)), 0);
    const investimentoSocios = Array.from(socioMap.values()).map(s => ({
      ...s,
      porcentagem_estoque: totalAtivos > 0 ? (s.valor_investido / totalAtivos) * 100 : 0
    })).sort((a, b) => b.valor_investido - a.valor_investido);
    const totalComprasVal = (compras || []).reduce((acc, c) => acc + (Number(c.valor_negociado) || 0), 0);

    return {
      patrimonio_liquido: (saldoDisponivel + totalAtivos + totalRecebivel) - totalPassivo,
      saldo_disponivel: saldoDisponivel,
      total_ativos_estoque: totalAtivos,
      total_passivo_circulante: totalPassivo,
      contas: (contas || []) as any,
      investimento_socios: investimentoSocios,
      total_compras: totalComprasVal,
      total_vendas: totalVendasVal,
      lucro_mensal: lucroDoPeriodo,
      transacoes: extratoRes.data
    };
  }
};
