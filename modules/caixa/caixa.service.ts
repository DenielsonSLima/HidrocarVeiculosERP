
import { supabase } from '../../lib/supabase';
import { ICaixaDashboardData, ISocioStockStats, IForecastMes } from './caixa.types';
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
      // Ativos (Estoque Físico) — o status do veículo é a fonte de verdade.
      // Veículos com status DISPONIVEL/PREPARACAO/RESERVADO estão no pátio.
      // Ao finalizar uma venda, o status é atualizado para VENDIDO automaticamente.
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
        veiculo:est_veiculos(valor_custo, valor_custo_servicos, socios)
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

    // Calcular lucro por sócio a partir das vendas concluídas no período
    (vendas || []).forEach((v: any) => {
      const sociosVeiculo = Array.isArray(v.veiculo?.socios) ? v.veiculo.socios : [];
      if (sociosVeiculo.length === 0) return;

      const receita = Number(v.valor_venda) || 0;
      const custoVeiculo = (Number(v.veiculo?.valor_custo) || 0) + (Number(v.veiculo?.valor_custo_servicos) || 0);
      const lucroVenda = receita - custoVeiculo;

      sociosVeiculo.forEach((s: any) => {
        if (!s.socio_id) return;
        const porcentagemSocio = Number(s.porcentagem) || 0;
        const lucroSocio = lucroVenda * (porcentagemSocio / 100);

        const current = socioMap.get(s.socio_id) || {
          socio_id: s.socio_id, nome: s.nome, valor_investido: 0,
          porcentagem_estoque: 0, quantidade_carros: 0, lucro_periodo: 0,
          veiculos: []
        };
        socioMap.set(s.socio_id, {
          ...current,
          lucro_periodo: current.lucro_periodo + lucroSocio
        });
      });
    });

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
      total_recebiveis: totalRecebivel,
      total_passivo_circulante: totalPassivo,
      contas: (contas || []) as any,
      investimento_socios: investimentoSocios,
      total_compras: totalComprasVal,
      total_vendas: totalVendasVal,
      lucro_mensal: lucroDoPeriodo,
      transacoes: extratoRes.data
    };
  },

  /**
   * Busca previsão financeira dos próximos 4 meses
   * baseado em títulos a pagar e receber com vencimento futuro
   */
  async getForecast(): Promise<IForecastMes[]> {
    const now = new Date();
    const meses: IForecastMes[] = [];

    // Gerar os 4 meses futuros
    for (let i = 1; i <= 4; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
      const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const nomeMes = targetDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      const nomeCapitalizado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

      meses.push({
        mes: `${nomeCapitalizado}/${targetDate.getFullYear()}`,
        mesNum: targetDate.getMonth(),
        ano: targetDate.getFullYear(),
        contas_pagar: 0,
        contas_receber: 0,
        lucro_projetado: 0,
        _firstDay: firstDay,
        _lastDay: lastDay
      } as any);
    }

    // Buscar todos os títulos em aberto com vencimento nos próximos 4 meses
    const primeiroDia = (meses[0] as any)._firstDay;
    const ultimoDia = (meses[meses.length - 1] as any)._lastDay;

    const [{ data: titulosPagar }, { data: titulosReceber }] = await Promise.all([
      supabase.from('fin_titulos')
        .select('valor_total, valor_pago, data_vencimento')
        .eq('tipo', 'PAGAR')
        .neq('status', 'PAGO')
        .neq('status', 'CANCELADO')
        .gte('data_vencimento', primeiroDia)
        .lte('data_vencimento', ultimoDia),
      supabase.from('fin_titulos')
        .select('valor_total, valor_pago, data_vencimento')
        .eq('tipo', 'RECEBER')
        .neq('status', 'PAGO')
        .neq('status', 'CANCELADO')
        .gte('data_vencimento', primeiroDia)
        .lte('data_vencimento', ultimoDia),
    ]);

    // Distribuir títulos por mês
    (titulosPagar || []).forEach((t: any) => {
      const venc = new Date(t.data_vencimento);
      const saldo = (Number(t.valor_total) || 0) - (Number(t.valor_pago) || 0);
      const mesIdx = meses.findIndex(m => m.mesNum === venc.getMonth() && m.ano === venc.getFullYear());
      if (mesIdx >= 0) meses[mesIdx].contas_pagar += saldo;
    });

    (titulosReceber || []).forEach((t: any) => {
      const venc = new Date(t.data_vencimento);
      const saldo = (Number(t.valor_total) || 0) - (Number(t.valor_pago) || 0);
      const mesIdx = meses.findIndex(m => m.mesNum === venc.getMonth() && m.ano === venc.getFullYear());
      if (mesIdx >= 0) meses[mesIdx].contas_receber += saldo;
    });

    // Calcular lucro projetado
    meses.forEach(m => {
      m.lucro_projetado = m.contas_receber - m.contas_pagar;
      // limpar campos internos
      delete (m as any)._firstDay;
      delete (m as any)._lastDay;
    });

    return meses;
  }
};
