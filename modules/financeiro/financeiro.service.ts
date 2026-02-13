import { supabase } from '../../lib/supabase';
import { ITitulo, ITransacao, ICategoriaFinanceira, IFinanceiroKpis, IExtratoFiltros, IExtratoResponse, IExtratoTotals, IPendencias } from './financeiro.types';
import { IContaBancaria } from '../ajustes/contas-bancarias/contas.types';

export const FinanceiroService = {
  async getTitulos(filtros: { tipo?: 'PAGAR' | 'RECEBER', status?: string }): Promise<ITitulo[]> {
    // Otimização: Selecionando colunas essenciais
    let query = supabase
      .from('fin_titulos')
      .select('id, descricao, tipo, status, valor_total, valor_pago, data_emissao, data_vencimento, parcela_numero, parcela_total, parceiro_id, categoria_id, parceiro:parceiros(nome), categoria:fin_categorias(nome)');

    if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
    if (filtros.status) query = query.eq('status', filtros.status);

    const { data, error } = await query.order('data_vencimento', { ascending: true });
    if (error) throw error;
    return data as unknown as ITitulo[];
  },

  async baixarTitulo(titulo: ITitulo, valor: number, contaId: string, formaId: string): Promise<void> {
    const novoValorPago = (titulo.valor_pago || 0) + valor;
    const novoStatus = novoValorPago >= titulo.valor_total ? 'PAGO' : 'PARCIAL';

    const { error: errorTitulo } = await supabase
      .from('fin_titulos')
      .update({
        valor_pago: novoValorPago,
        status: novoStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', titulo.id);

    if (errorTitulo) throw errorTitulo;

    const { error: errorTransacao } = await supabase
      .from('fin_transacoes')
      .insert({
        titulo_id: titulo.id,
        conta_origem_id: contaId,
        valor: valor,
        data_pagamento: new Date().toISOString(),
        tipo: titulo.tipo === 'PAGAR' ? 'SAIDA' : 'ENTRADA',
        forma_pagamento_id: formaId,
        descricao: `LIQUIDAÇÃO: ${titulo.descricao}`,
        tipo_transacao: titulo.tipo === 'PAGAR' ? 'PAGAMENTO_TITULO' : 'RECEBIMENTO_TITULO'
      });

    if (errorTransacao) throw errorTransacao;

    const { data: conta } = await supabase
      .from('fin_contas_bancarias')
      .select('saldo_atual')
      .eq('id', contaId)
      .single();

    const multiplicador = titulo.tipo === 'PAGAR' ? -1 : 1;
    const novoSaldo = (conta?.saldo_atual || 0) + (valor * multiplicador);

    await supabase
      .from('fin_contas_bancarias')
      .update({ saldo_atual: novoSaldo })
      .eq('id', contaId);
  },

  async getExtrato(filtros: IExtratoFiltros = {}): Promise<IExtratoResponse> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 20; // Extrato can be denser
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let queryTransacoes = supabase
      .from('fin_transacoes')
      .select(`
        id,
        valor,
        data_pagamento,
        tipo,
        tipo_transacao,
        descricao,
        titulo:fin_titulos(descricao),
        conta_origem:fin_contas_bancarias(banco_nome, conta),
        forma_pagamento:cad_formas_pagamento(nome)
      `, { count: 'exact' });

    if (filtros.dataInicio) queryTransacoes = queryTransacoes.gte('data_pagamento', filtros.dataInicio);
    if (filtros.dataFim) queryTransacoes = queryTransacoes.lte('data_pagamento', filtros.dataFim);

    // Filter by type if provided (optional optimization)
    if (filtros.tipo) queryTransacoes = queryTransacoes.eq('tipo', filtros.tipo);

    const { data: transacoes, error: errT, count } = await queryTransacoes
      .order('data_pagamento', { ascending: false })
      .range(from, to);

    if (errT) throw errT;

    return {
      data: (transacoes || []) as unknown as ITransacao[],
      count: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async getExtratoTotals(filtros: IExtratoFiltros = {}): Promise<IExtratoTotals> {
    let query = supabase
      .from('fin_transacoes')
      .select('valor, tipo');

    if (filtros.dataInicio) query = query.gte('data_pagamento', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_pagamento', filtros.dataFim);

    // Filter by type if provided (optional optimization)
    if (filtros.tipo) query = query.eq('tipo', filtros.tipo);

    const { data, error } = await query;
    if (error) throw error;

    const entradas = (data || []).filter(t => t.tipo === 'ENTRADA').reduce((acc, t) => acc + (t.valor || 0), 0);
    const saidas = (data || []).filter(t => t.tipo === 'SAIDA').reduce((acc, t) => acc + (t.valor || 0), 0);

    return {
      entradas,
      saidas,
      balanco: entradas - saidas
    };
  },

  async realizarTransferencia(payload: { origem: string, destino: string, valor: number, obs?: string }): Promise<void> {
    const { data: transf, error: errorTransf } = await supabase
      .from('fin_transferencias')
      .insert({
        conta_origem_id: payload.origem,
        conta_destino_id: payload.destino,
        valor: payload.valor,
        descricao: payload.obs || 'Transferência Interna'
      })
      .select()
      .single();

    if (errorTransf) throw errorTransf;

    await supabase.from('fin_transacoes').insert([
      {
        transferencia_id: transf.id,
        conta_origem_id: payload.origem,
        valor: payload.valor,
        tipo: 'SAIDA',
        data_pagamento: new Date().toISOString(),
        tipo_transacao: 'TRANSFERENCIA_SAIDA',
        descricao: `[SAÍDA] ${payload.obs || 'Transferência entre contas'}`
      },
      {
        transferencia_id: transf.id,
        conta_origem_id: payload.destino,
        valor: payload.valor,
        tipo: 'ENTRADA',
        data_pagamento: new Date().toISOString(),
        tipo_transacao: 'TRANSFERENCIA_ENTRADA',
        descricao: `[ENTRADA] ${payload.obs || 'Transferência entre contas'}`
      }
    ]);
  },

  async getKpis(): Promise<IFinanceiroKpis> {
    const { data: contas } = await supabase.from('fin_contas_bancarias').select('saldo_atual');
    const saldoTotal = (contas || []).reduce((acc, c) => acc + (c.saldo_atual || 0), 0);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data: pagar } = await supabase.from('fin_titulos')
      .select('valor_total, valor_pago')
      .eq('tipo', 'PAGAR').neq('status', 'CANCELADO')
      .gte('data_vencimento', firstDay).lte('data_vencimento', lastDay);

    const { data: receber } = await supabase.from('fin_titulos')
      .select('valor_total, valor_pago')
      .eq('tipo', 'RECEBER').neq('status', 'CANCELADO')
      .gte('data_vencimento', firstDay).lte('data_vencimento', lastDay);

    const totalPagar = (pagar || []).reduce((acc, t) => acc + (t.valor_total - t.valor_pago), 0);
    const totalReceber = (receber || []).reduce((acc, t) => acc + (t.valor_total - t.valor_pago), 0);

    return {
      saldo_total: saldoTotal,
      pagar_mes: totalPagar,
      receber_mes: totalReceber,
      balanco_projetado: saldoTotal + totalReceber - totalPagar
    };
  },

  async getCategorias(): Promise<ICategoriaFinanceira[]> {
    const { data, error } = await supabase.from('fin_categorias').select('id, nome, tipo, natureza').order('nome');
    if (error) throw error;
    return data as ICategoriaFinanceira[];
  },

  async getContasBancarias(): Promise<IContaBancaria[]> {
    const { data, error } = await supabase
      .from('fin_contas_bancarias')
      .select('*')
      .eq('ativo', true)
      .order('banco_nome');
    if (error) throw error;
    return data as IContaBancaria[];
  },

  async getPendencias(): Promise<IPendencias> {
    const hoje = new Date().toISOString().split('T')[0];

    // Atrasados (Pagar)
    const { data: atrasados } = await supabase
      .from('fin_titulos')
      .select('valor_total, valor_pago')
      .eq('tipo', 'PAGAR')
      .lt('data_vencimento', hoje)
      .neq('status', 'PAGO')
      .neq('status', 'CANCELADO');

    // Vencendo Hoje (Pagar)
    const { data: hojePagar } = await supabase
      .from('fin_titulos')
      .select('valor_total, valor_pago')
      .eq('tipo', 'PAGAR')
      .eq('data_vencimento', hoje)
      .neq('status', 'PAGO')
      .neq('status', 'CANCELADO');

    const totalAtrasado = (atrasados || []).reduce((acc, t) => acc + (t.valor_total - (t.valor_pago || 0)), 0);
    const countAtrasado = (atrasados || []).length;

    const totalHoje = (hojePagar || []).reduce((acc, t) => acc + (t.valor_total - (t.valor_pago || 0)), 0);
    const countHoje = (hojePagar || []).length;

    return {
      atrasado: { total: totalAtrasado, count: countAtrasado },
      hoje: { total: totalHoje, count: countHoje }
    };
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('financeiro_global_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fin_titulos' }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fin_transacoes' }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fin_transferencias' }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fin_retiradas' }, () => onUpdate())
      .subscribe();
  }
};