
import { supabase } from '../../lib/supabase';
import { IStrategicKpis, IVehiclePerformance, IInventoryAnalytics, ISalesPerformance, IIntelligentAlert, IPurchasingPerformance, IOperationalPerformance } from './performance.types';

export const PerformanceService = {
  async getStrategicKpis(): Promise<IStrategicKpis> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString();

    // 1. Capital Imobilizado (Estoque Disponível)
    const { data: stockData } = await supabase
      .from('est_veiculos')
      .select('valor_custo')
      .eq('status', 'DISPONIVEL');

    const capital_imobilizado = (stockData || []).reduce((acc, curr) =>
      acc + (curr.valor_custo || 0), 0);

    // 2. Vendas do Mês Atual (Lucro Líquido Realizado)
    const { data: salesData } = await supabase
      .from('venda_pedidos')
      .select(`
        valor_venda,
        veiculo:est_veiculos(valor_custo)
      `)
      .eq('status', 'CONCLUIDO')
      .gte('data_venda', startOfMonth);

    let lucro_liquido_mensal = 0;
    (salesData || []).forEach((sale: any) => {
      const custo = (sale.veiculo?.valor_custo || 0);
      lucro_liquido_mensal += (sale.valor_venda - custo);
    });

    // 3. Vendas do Mês Anterior (para crescimento)
    const { data: lastMonthSales } = await supabase
      .from('venda_pedidos')
      .select('valor_venda, veiculo:est_veiculos(valor_custo)')
      .eq('status', 'CONCLUIDO')
      .gte('data_venda', startOfLastMonth)
      .lte('data_venda', endOfLastMonth);

    let lucro_last_month = 0;
    (lastMonthSales || []).forEach((sale: any) => {
      const custo = (sale.veiculo?.valor_custo || 0);
      lucro_last_month += (sale.valor_venda - custo);
    });

    const crescimento_mensal = lucro_last_month > 0
      ? ((lucro_liquido_mensal - lucro_last_month) / lucro_last_month) * 100
      : 0;

    // 4. Margem Média da Loja (All Time - ou último ano)
    const { data: totalSales } = await supabase
      .from('venda_pedidos')
      .select('valor_venda, veiculo:est_veiculos(valor_custo)')
      .eq('status', 'CONCLUIDO')
      .limit(100); // Amostra para performance

    let totalMargem = 0;
    let countMargem = 0;

    (totalSales || []).forEach((sale: any) => {
      const custo = (sale.veiculo?.valor_custo || 0);
      if (custo > 0) {
        totalMargem += ((sale.valor_venda - custo) / custo) * 100;
        countMargem++;
      }
    });

    const margem_media_loja = countMargem > 0 ? totalMargem / countMargem : 0;

    // 5. Previsão de Caixa (Contas a Receber próximas)
    const { data: receberData } = await supabase
      .from('fin_contas_receber')
      .select('valor_total')
      .eq('status', 'PENDENTE')
      .lt('data_vencimento', new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString());

    const previsao_caixa_30d = (receberData || []).reduce((acc, curr) => acc + (curr.valor_total || 0), 0);

    return {
      lucro_liquido_mensal,
      margem_media_loja,
      roi_estoque: 18.5, // Mantido fixo ou calcular baseado em lucro anual / estoque medio
      ponto_equilibrio: 85000, // Valor fixo de exemplo ou pegar de configurações
      capital_imobilizado,
      crescimento_mensal,
      previsao_caixa_30d
    };
  },

  async getVehiclesPerformance(): Promise<IVehiclePerformance[]> {
    const { data } = await supabase
      .from('est_veiculos')
      .select(`
        id, placa, valor_custo, valor_venda, created_at, status,
        modelo:cad_modelos(nome)
      `)
      .neq('status', 'VENDIDO'); // Focando em estoque atual? Ou vendidos? O original misturava. Vamos trazer todos.

    return (data || []).map(v => {
      const custoTotal = (v.valor_custo || 0);
      const margem = custoTotal > 0 ? ((v.valor_venda - custoTotal) / custoTotal) * 100 : 0;
      const dias = Math.floor((new Date().getTime() - new Date(v.created_at).getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: v.id,
        modelo: (v as any).modelo?.nome || 'N/D',
        placa: v.placa,
        custo_aquisicao: v.valor_custo,
        custo_total: custoTotal,
        preco_venda: v.valor_venda,
        lucro_bruto: v.valor_venda - custoTotal,
        lucro_liquido: (v.valor_venda - custoTotal) * 0.90, // Estimativa simples
        margem_percent: margem,
        dias_estoque: dias,
        custo_capital_parado: custoTotal * 0.00033 * dias
      };
    });
  },

  async getInventoryAnalytics(): Promise<IInventoryAnalytics> {
    const { data } = await supabase
      .from('est_veiculos')
      .select('created_at, status, valor_custo')
      .eq('status', 'DISPONIVEL');

    const totalVehicles = (data || []).length;
    let daysSum = 0;
    let encalhados30 = 0;
    let encalhados60 = 0;
    let encalhados90 = 0;
    let custoTotalParado = 0;

    const now = new Date().getTime();

    (data || []).forEach(v => {
      const diffTime = Math.abs(now - new Date(v.created_at).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysSum += diffDays;
      custoTotalParado += (v.valor_custo || 0);

      if (diffDays > 90) encalhados90++;
      else if (diffDays > 60) encalhados60++;
      else if (diffDays > 30) encalhados30++;
    });

    const tempo_medio_venda = totalVehicles > 0 ? Math.floor(daysSum / totalVehicles) : 0;
    // Custo capital diário (ex: 0.05% ao dia)
    const custo_diario_parado = custoTotalParado * 0.0005;

    return {
      giro_estoque: 1.2, // Difícil calcular sem histórico de vendas completo, mantendo fixo por ora
      tempo_medio_venda,
      encalhados_30: encalhados30,
      encalhados_60: encalhados60,
      encalhados_90: encalhados90,
      custo_diario_parado
    };
  },

  async getSalesPerformance(): Promise<ISalesPerformance[]> {
    const { data } = await supabase
      .from('venda_pedidos')
      .select(`
            valor_venda,
            user_id,
            veiculo:est_veiculos(valor_custo)
        `)
      .eq('status', 'CONCLUIDO');

    const salesByUser: Record<string, { nome: string, qtd: number, total: number, lucro: number }> = {};

    // Need to fetch user names if possible, but map is hard without FK.
    // Trying to fetch profiles map if possible, otherwise just use IDs or "Vendedor X"
    // Simplest: Use 'user_id' for now, improving later if requested.
    // Actually, let's fetch profiles separately to map names.
    const userIds = [...new Set((data || []).map(d => d.user_id).filter(Boolean))];

    let userMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email') // Assuming email or name exists
        .in('id', userIds);

      (profiles || []).forEach(p => {
        userMap[p.id] = p.email || 'Desconhecido';
      });
    }

    (data || []).forEach((sale: any) => {
      const userId = sale.user_id || 'unknown';
      const userName = userMap[userId] || 'Vendedor ' + userId.slice(0, 4);

      if (!salesByUser[userId]) {
        salesByUser[userId] = { nome: userName, qtd: 0, total: 0, lucro: 0 };
      }

      const custo = (sale.veiculo?.valor_custo || 0);
      salesByUser[userId].qtd += 1;
      salesByUser[userId].total += sale.valor_venda;
      salesByUser[userId].lucro += (sale.valor_venda - custo);
    });

    return Object.values(salesByUser).map(s => ({
      vendedor_nome: s.nome,
      qtd_vendida: s.qtd,
      ticket_medio: s.qtd > 0 ? s.total / s.qtd : 0,
      margem_media: s.total > 0 ? (s.lucro / s.total) * 100 : 0,
      taxa_desconto: 0,
      comissao_paga: s.lucro * 0.10,
      lucro_liquido_gerado: s.lucro
    }));
  },

  async getPurchasingPerformance(): Promise<IPurchasingPerformance[]> {
    // Mocked for now as we don't have 'origem' column confirmed yet.
    // In future: Aggregate est_veiculos by origin/type
    return [
      { label: 'Particular', roi: 18.5, color: 'emerald' },
      { label: 'Leilão', roi: 32.1, color: 'indigo' },
      { label: 'Troca na Venda', roi: 14.8, color: 'blue' },
      { label: 'Repasse', roi: 22.4, color: 'amber' },
    ];
  },

  async getOperationalPerformance(): Promise<IOperationalPerformance> {
    const { data: salesData } = await supabase
      .from('venda_pedidos')
      .select('data_venda, veiculo:est_veiculos(created_at)') // removed valor_custo_servicos
      .eq('status', 'CONCLUIDO')
      .limit(50); // Sample

    let totalDays = 0;
    let count = 0;

    (salesData || []).forEach((sale: any) => {
      if (sale.veiculo) {
        const bought = new Date(sale.veiculo.created_at).getTime();
        const sold = new Date(sale.data_venda).getTime();
        const diff = (sold - bought) / (1000 * 60 * 60 * 24);
        if (diff > 0) totalDays += diff;
        count++;
      }
    });

    return {
      tempo_compra_venda: count > 0 ? Math.floor(totalDays / count) : 32, // Fallback
      tempo_preparacao: 6.5, // Hard to calc without status history
      custo_medio_reforma: 1850 // Mocked since column missing
    };
  },

  async getIntelligentAlerts(): Promise<IIntelligentAlert[]> {
    return [
      { id: '1', nivel: 'CRITICO', titulo: 'Risco de Prejuízo', mensagem: 'Toyota Corolla (ABC-1234) com margem projetada negativa após serviços.' },
      { id: '2', nivel: 'ATENCAO', titulo: 'Estoque Parado', mensagem: 'Honda Civic parado há mais de 45 dias. Sugestão: Baixar 2% no preço.' },
      { id: '3', nivel: 'ATENCAO', titulo: 'Desconto Excessivo', mensagem: 'Vendedor Marcos concedeu 8% de desconto médio esta semana.' }
    ];
  }
};
