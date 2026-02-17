import { supabase } from '../../lib/supabase';
import {
  IPerformanceData,
  IPerformanceResumo,
  IPerformanceVenda,
  IPerformanceCompra,
  IPerformanceTitulo,
  IPerformanceDespesaVeiculo,
  IPerformanceRetirada,
  IPerformanceEstoque,
  IPerformanceConta,
} from './performance.types';

export const PerformanceService = {

  /**
   * Busca TODOS os dados da empresa para um período (startDate..endDate).
   * Usado tanto pela aba "Mês Atual" quanto "Outros Meses".
   */
  async getPerformanceData(startDate: string, endDate: string): Promise<IPerformanceData> {
    const [
      vendas,
      compras,
      titulosPagar,
      titulosReceber,
      despesasVeiculos,
      retiradas,
      estoque,
      contasBancarias,
      transacoesEntrada,
      transacoesSaida,
    ] = await Promise.all([
      this.getVendas(startDate, endDate),
      this.getCompras(startDate, endDate),
      this.getTitulos('PAGAR', startDate, endDate),
      this.getTitulos('RECEBER', startDate, endDate),
      this.getDespesasVeiculos(startDate, endDate),
      this.getRetiradas(startDate, endDate),
      this.getEstoqueAtual(),
      this.getContasBancarias(),
      this.getTransacoesTotal('ENTRADA', startDate, endDate),
      this.getTransacoesTotal('SAIDA', startDate, endDate),
    ]);

    // ---- Calcular KPIs ----
    const total_vendas_valor = vendas.reduce((s, v) => s + v.valor_venda, 0);
    const total_vendas_qtd = vendas.length;
    const total_compras_valor = compras.reduce((s, c) => s + c.valor_negociado, 0);
    const total_compras_qtd = compras.length;
    const lucro_bruto = vendas.reduce((s, v) => s + v.lucro_bruto, 0);

    let margemSum = 0;
    let margemCount = 0;
    vendas.forEach(v => {
      if (v.custo_veiculo > 0) {
        margemSum += v.margem_percent;
        margemCount++;
      }
    });

    const margem_media = margemCount > 0 ? margemSum / margemCount : 0;
    const ticket_medio_venda = total_vendas_qtd > 0 ? total_vendas_valor / total_vendas_qtd : 0;
    const despesas_veiculos_total = despesasVeiculos.reduce((s, d) => s + d.valor_total, 0);
    const retiradas_total = retiradas.reduce((s, r) => s + r.valor, 0);

    const contas_pagar_pendente = titulosPagar.filter(t => t.status !== 'PAGO' && t.status !== 'CANCELADO').reduce((s, t) => s + (t.valor_total - t.valor_pago), 0);
    const contas_receber_pendente = titulosReceber.filter(t => t.status !== 'PAGO' && t.status !== 'CANCELADO').reduce((s, t) => s + (t.valor_total - t.valor_pago), 0);
    const contas_pagar_pago = titulosPagar.filter(t => t.status === 'PAGO').reduce((s, t) => s + t.valor_total, 0);
    const contas_receber_pago = titulosReceber.filter(t => t.status === 'PAGO').reduce((s, t) => s + t.valor_total, 0);

    const saldo_contas_bancarias = contasBancarias.reduce((s, c) => s + c.saldo_atual, 0);

    const resumo: IPerformanceResumo = {
      total_vendas_valor,
      total_vendas_qtd,
      total_compras_valor,
      total_compras_qtd,
      lucro_bruto,
      margem_media,
      ticket_medio_venda,
      despesas_veiculos: despesas_veiculos_total,
      retiradas_socios: retiradas_total,
      contas_pagar_pendente,
      contas_receber_pendente,
      contas_pagar_pago,
      contas_receber_pago,
      saldo_contas_bancarias,
      total_entradas: transacoesEntrada,
      total_saidas: transacoesSaida,
    };

    return {
      resumo,
      vendas,
      compras,
      titulos_pagar: titulosPagar,
      titulos_receber: titulosReceber,
      despesas_veiculos: despesasVeiculos,
      retiradas,
      estoque,
      contas_bancarias: contasBancarias,
    };
  },

  // ===================== VENDAS =====================
  async getVendas(startDate: string, endDate: string): Promise<IPerformanceVenda[]> {
    const { data } = await supabase
      .from('venda_pedidos')
      .select(`
        id, numero_venda, data_venda, valor_venda, status,
        cliente:parceiros(nome),
        veiculo:est_veiculos(placa, valor_custo, valor_custo_servicos, modelo:cad_modelos(nome))
      `)
      .eq('status', 'CONCLUIDO')
      .gte('data_venda', startDate)
      .lte('data_venda', endDate)
      .order('data_venda', { ascending: false });

    return (data || []).map((s: any) => {
      const custoVeiculo = s.veiculo?.valor_custo || 0;
      const custoServicos = s.veiculo?.valor_custo_servicos || 0;
      const custoTotal = custoVeiculo + custoServicos;
      const lucro = s.valor_venda - custoTotal;
      const margem = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;

      return {
        id: s.id,
        numero_venda: s.numero_venda || '-',
        data_venda: s.data_venda,
        cliente_nome: s.cliente?.nome || 'N/D',
        veiculo_modelo: s.veiculo?.modelo?.nome || 'N/D',
        veiculo_placa: s.veiculo?.placa || '-',
        valor_venda: s.valor_venda,
        custo_veiculo: custoVeiculo,
        custo_servicos: custoServicos,
        lucro_bruto: lucro,
        margem_percent: margem,
      };
    });
  },

  // ===================== COMPRAS =====================
  async getCompras(startDate: string, endDate: string): Promise<IPerformanceCompra[]> {
    const { data } = await supabase
      .from('cmp_pedidos')
      .select(`
        id, numero_pedido, data_compra, valor_negociado, status,
        fornecedor:parceiros(nome),
        veiculos:est_veiculos(placa, modelo:cad_modelos(nome))
      `)
      .eq('status', 'CONCLUIDO')
      .gte('data_compra', startDate)
      .lte('data_compra', endDate)
      .order('data_compra', { ascending: false });

    return (data || []).map((c: any) => {
      const veiculo = Array.isArray(c.veiculos) ? c.veiculos[0] : c.veiculos;
      return {
        id: c.id,
        numero_pedido: c.numero_pedido || '-',
        data_compra: c.data_compra,
        fornecedor_nome: c.fornecedor?.nome || 'N/D',
        veiculo_modelo: veiculo?.modelo?.nome || 'N/D',
        veiculo_placa: veiculo?.placa || '-',
        valor_negociado: c.valor_negociado,
      };
    });
  },

  // ===================== TÍTULOS FINANCEIROS =====================
  async getTitulos(tipo: 'PAGAR' | 'RECEBER', startDate: string, endDate: string): Promise<IPerformanceTitulo[]> {
    const { data } = await supabase
      .from('fin_titulos')
      .select(`
        id, tipo, descricao, valor_total, valor_pago, data_vencimento, status,
        parceiro:parceiros(nome),
        categoria:fin_categorias(nome)
      `)
      .eq('tipo', tipo)
      .gte('data_vencimento', startDate)
      .lte('data_vencimento', endDate)
      .neq('status', 'CANCELADO')
      .order('data_vencimento', { ascending: true });

    return (data || []).map((t: any) => ({
      id: t.id,
      tipo: t.tipo,
      descricao: t.descricao || '-',
      valor_total: t.valor_total || 0,
      valor_pago: t.valor_pago || 0,
      data_vencimento: t.data_vencimento,
      status: t.status,
      parceiro_nome: t.parceiro?.nome || '-',
      categoria_nome: t.categoria?.nome || '-',
    }));
  },

  // ===================== DESPESAS DE VEÍCULOS =====================
  async getDespesasVeiculos(startDate: string, endDate: string): Promise<IPerformanceDespesaVeiculo[]> {
    const { data } = await supabase
      .from('est_veiculos_despesas')
      .select(`
        id, descricao, valor_total, data, status_pagamento,
        veiculo:est_veiculos(placa, modelo:cad_modelos(nome))
      `)
      .gte('data', startDate)
      .lte('data', endDate)
      .order('data', { ascending: false });

    return (data || []).map((d: any) => ({
      id: d.id,
      veiculo_modelo: d.veiculo?.modelo?.nome || 'N/D',
      veiculo_placa: d.veiculo?.placa || '-',
      descricao: d.descricao || '-',
      valor_total: d.valor_total || 0,
      data: d.data,
      status_pagamento: d.status_pagamento || '-',
    }));
  },

  // ===================== RETIRADAS SÓCIOS =====================
  async getRetiradas(startDate: string, endDate: string): Promise<IPerformanceRetirada[]> {
    const { data } = await supabase
      .from('fin_retiradas')
      .select(`
        id, valor, data, tipo, descricao,
        socio:config_socios(nome)
      `)
      .gte('data', startDate)
      .lte('data', endDate)
      .order('data', { ascending: false });

    return (data || []).map((r: any) => ({
      id: r.id,
      socio_nome: r.socio?.nome || 'N/D',
      valor: r.valor || 0,
      data: r.data,
      tipo: r.tipo || '-',
      descricao: r.descricao || '-',
    }));
  },

  // ===================== ESTOQUE ATUAL =====================
  async getEstoqueAtual(): Promise<IPerformanceEstoque[]> {
    const { data } = await supabase
      .from('est_veiculos')
      .select(`
        id, placa, valor_custo, valor_custo_servicos, valor_venda, status, created_at,
        modelo:cad_modelos(nome)
      `)
      .in('status', ['DISPONIVEL', 'RESERVADO', 'PREPARACAO'])
      .order('created_at', { ascending: true });

    const now = Date.now();

    return (data || []).map((v: any) => {
      const custoTotal = (v.valor_custo || 0) + (v.valor_custo_servicos || 0);
      const margem = custoTotal > 0 ? ((v.valor_venda - custoTotal) / custoTotal) * 100 : 0;
      const dias = Math.floor((now - new Date(v.created_at).getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: v.id,
        modelo: v.modelo?.nome || 'N/D',
        placa: v.placa || '-',
        valor_custo: v.valor_custo || 0,
        valor_custo_servicos: v.valor_custo_servicos || 0,
        valor_venda: v.valor_venda || 0,
        margem_percent: margem,
        dias_estoque: dias,
        status: v.status,
      };
    });
  },

  // ===================== CONTAS BANCÁRIAS =====================
  async getContasBancarias(): Promise<IPerformanceConta[]> {
    const { data } = await supabase
      .from('fin_contas_bancarias')
      .select('id, banco_nome, tipo, saldo_atual')
      .eq('ativo', true)
      .order('banco_nome');

    return (data || []).map(c => ({
      id: c.id,
      banco_nome: c.banco_nome || '-',
      tipo: c.tipo || '-',
      saldo_atual: c.saldo_atual || 0,
    }));
  },

  // ===================== TRANSAÇÕES TOTAL =====================
  async getTransacoesTotal(tipo: 'ENTRADA' | 'SAIDA', startDate: string, endDate: string): Promise<number> {
    const { data } = await supabase
      .from('fin_transacoes')
      .select('valor')
      .eq('tipo', tipo)
      .gte('data_pagamento', startDate)
      .lte('data_pagamento', endDate);

    return (data || []).reduce((sum, t) => sum + (t.valor || 0), 0);
  },
};
