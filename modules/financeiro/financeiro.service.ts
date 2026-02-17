import { supabase } from '../../lib/supabase';
import { ITitulo, ITransacao, ICategoriaFinanceira, IFinanceiroKpis, IExtratoFiltros, IExtratoResponse, IExtratoTotals, IPendencias, IHistoricoFiltros, IHistoricoResponse, IHistoricoTotals, IHistoricoUnificado, OrigemHistorico, StatusHistorico } from './financeiro.types';
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
    if (valor <= 0) throw new Error('O valor de baixa deve ser maior que zero.');
    const saldoDevedor = titulo.valor_total - (titulo.valor_pago || 0);
    if (valor > saldoDevedor + 0.01) throw new Error(`Valor de baixa (${valor.toFixed(2)}) excede o saldo devedor (${saldoDevedor.toFixed(2)}).`);
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

    const { data: conta, error: errorConta } = await supabase
      .from('fin_contas_bancarias')
      .select('saldo_atual')
      .eq('id', contaId)
      .single();

    if (errorConta || !conta) throw new Error('Conta bancária não encontrada para atualização de saldo.');

    const multiplicador = titulo.tipo === 'PAGAR' ? -1 : 1;
    const novoSaldo = (Number(conta.saldo_atual) || 0) + (valor * multiplicador);

    const { error: errorSaldo } = await supabase
      .from('fin_contas_bancarias')
      .update({ saldo_atual: novoSaldo, updated_at: new Date().toISOString() })
      .eq('id', contaId);

    if (errorSaldo) throw new Error('Erro ao atualizar saldo da conta bancária.');
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

  // ─── HISTÓRICO GERAL UNIFICADO ─────────────────────────────────────
  // Consolida transações realizadas + títulos pendentes numa visão única

  async getHistoricoGeral(filtros: IHistoricoFiltros = {}): Promise<IHistoricoResponse> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 30;
    const hoje = new Date().toISOString().split('T')[0];

    // ── 1. Buscar TRANSAÇÕES realizadas (entradas, saídas, transferências) ──
    let queryTx = supabase
      .from('fin_transacoes')
      .select(`
        id, valor, data_pagamento, tipo, tipo_transacao, descricao,
        titulo:fin_titulos(id, descricao, pedido_id, tipo, parcela_numero, parcela_total,
          parceiro:parceiros(nome)),
        conta_origem:fin_contas_bancarias(banco_nome, conta),
        forma_pagamento:cad_formas_pagamento(nome)
      `);

    if (filtros.dataInicio) queryTx = queryTx.gte('data_pagamento', filtros.dataInicio);
    if (filtros.dataFim) queryTx = queryTx.lte('data_pagamento', filtros.dataFim + 'T23:59:59');

    if (filtros.tipo === 'ENTRADA') queryTx = queryTx.eq('tipo', 'ENTRADA');
    if (filtros.tipo === 'SAIDA') queryTx = queryTx.eq('tipo', 'SAIDA');
    if (filtros.tipo === 'TRANSFERENCIA') queryTx = queryTx.in('tipo_transacao', ['TRANSFERENCIA_SAIDA', 'TRANSFERENCIA_ENTRADA']);

    const { data: transacoes } = await queryTx.order('data_pagamento', { ascending: false });

    // ── 2. Buscar TÍTULOS pendentes (a pagar e a receber) ──
    let queryTit = supabase
      .from('fin_titulos')
      .select(`
        id, descricao, tipo, status, valor_total, valor_pago,
        data_emissao, data_vencimento, parcela_numero, parcela_total,
        pedido_id, despesa_veiculo_id,
        parceiro:parceiros(nome),
        categoria:fin_categorias(nome, natureza),
        forma_pagamento:cad_formas_pagamento(nome)
      `)
      .in('status', ['PENDENTE', 'PARCIAL', 'ATRASADO']);

    if (filtros.dataInicio) queryTit = queryTit.gte('data_vencimento', filtros.dataInicio);
    if (filtros.dataFim) queryTit = queryTit.lte('data_vencimento', filtros.dataFim);

    if (filtros.tipo === 'A_PAGAR') queryTit = queryTit.eq('tipo', 'PAGAR');
    if (filtros.tipo === 'A_RECEBER') queryTit = queryTit.eq('tipo', 'RECEBER');

    const { data: titulos } = await queryTit.order('data_vencimento', { ascending: false });

    // ── 3. Se temos pedido_ids, buscar referências de pedidos ──
    const pedidoIds = new Set<string>();
    (transacoes || []).forEach((t: any) => { if (t.titulo?.pedido_id) pedidoIds.add(t.titulo.pedido_id); });
    (titulos || []).forEach((t: any) => { if (t.pedido_id) pedidoIds.add(t.pedido_id); });

    let pedidoRefMap: Record<string, { ref: string; tipo: 'COMPRA' | 'VENDA' }> = {};
    if (pedidoIds.size > 0) {
      const ids = Array.from(pedidoIds);
      const [compras, vendas] = await Promise.all([
        supabase.from('cmp_pedidos').select('id, numero_pedido').in('id', ids),
        supabase.from('venda_pedidos').select('id, numero_venda').in('id', ids)
      ]);
      (compras.data || []).forEach((p: any) => { pedidoRefMap[p.id] = { ref: p.numero_pedido, tipo: 'COMPRA' }; });
      (vendas.data || []).forEach((p: any) => { pedidoRefMap[p.id] = { ref: p.numero_venda, tipo: 'VENDA' }; });
    }

    // ── 4. Mapear transações para IHistoricoUnificado ──
    const mapOrigemTx = (t: any): OrigemHistorico => {
      const tt = t.tipo_transacao || '';
      if (tt === 'SALDO_INICIAL') return 'SALDO_INICIAL';
      if (tt === 'RETIRADA_SOCIO') return 'RETIRADA';
      if (tt.includes('TRANSFERENCIA')) return 'TRANSFERENCIA';
      if (t.titulo?.pedido_id && pedidoRefMap[t.titulo.pedido_id]) return pedidoRefMap[t.titulo.pedido_id].tipo;
      if (tt === 'PAGAMENTO_TITULO') return 'MANUAL';
      if (tt === 'RECEBIMENTO_TITULO') return 'MANUAL';
      return 'MANUAL';
    };

    const historicoTx: IHistoricoUnificado[] = (transacoes || []).map((t: any) => {
      const pedidoId = t.titulo?.pedido_id;
      const pedidoInfo = pedidoId ? pedidoRefMap[pedidoId] : null;
      return {
        id: `tx_${t.id}`,
        data: t.data_pagamento,
        tipo_movimento: t.tipo as any,
        descricao: t.descricao || t.titulo?.descricao || 'Lançamento',
        valor: t.valor || 0,
        status: 'REALIZADO' as StatusHistorico,
        origem: mapOrigemTx(t),
        parceiro_nome: t.titulo?.parceiro?.nome,
        conta_nome: t.conta_origem?.banco_nome,
        forma_pagamento: t.forma_pagamento?.nome,
        parcela_info: t.titulo?.parcela_numero ? `${t.titulo.parcela_numero}/${t.titulo.parcela_total}` : undefined,
        pedido_ref: pedidoInfo?.ref,
        pedido_id: pedidoId,
        titulo_id: t.titulo?.id,
        source: 'TRANSACAO' as const,
      };
    });

    // ── 5. Mapear títulos pendentes para IHistoricoUnificado ──
    const historicoTit: IHistoricoUnificado[] = (titulos || []).map((t: any) => {
      const pedidoInfo = t.pedido_id ? pedidoRefMap[t.pedido_id] : null;
      const isAtrasado = t.data_vencimento < hoje && t.status !== 'PAGO';
      const statusMap: Record<string, StatusHistorico> = {
        'PENDENTE': isAtrasado ? 'ATRASADO' : 'PENDENTE',
        'PARCIAL': 'PARCIAL',
        'ATRASADO': 'ATRASADO',
      };
      const origemTit = (): OrigemHistorico => {
        if (pedidoInfo) return pedidoInfo.tipo;
        if (t.despesa_veiculo_id) return 'DESPESA_VEICULO';
        return 'MANUAL';
      };
      return {
        id: `tit_${t.id}`,
        data: t.data_vencimento,
        data_emissao: t.data_emissao,
        tipo_movimento: (t.tipo === 'PAGAR' ? 'A_PAGAR' : 'A_RECEBER') as any,
        descricao: t.descricao || 'Título financeiro',
        valor: t.valor_total || 0,
        valor_pago: t.valor_pago || 0,
        valor_restante: (t.valor_total || 0) - (t.valor_pago || 0),
        status: statusMap[t.status] || 'PENDENTE',
        origem: origemTit(),
        parceiro_nome: t.parceiro?.nome,
        forma_pagamento: t.forma_pagamento?.nome,
        parcela_info: t.parcela_numero ? `${t.parcela_numero}/${t.parcela_total}` : undefined,
        pedido_ref: pedidoInfo?.ref,
        pedido_id: t.pedido_id,
        titulo_id: t.id,
        source: 'TITULO' as const,
      };
    });

    // ── 6. Unificar, aplicar filtros adicionais, paginar ──
    let unificado = [...historicoTx, ...historicoTit];

    // Filtro por status
    if (filtros.status) {
      unificado = unificado.filter(h => h.status === filtros.status);
    }

    // Filtro por origem
    if (filtros.origem) {
      unificado = unificado.filter(h => h.origem === filtros.origem);
    }

    // Filtro por tipo (caso não tenha sido filtrado na query)
    if (filtros.tipo === 'A_PAGAR') {
      unificado = unificado.filter(h => h.tipo_movimento === 'A_PAGAR');
    } else if (filtros.tipo === 'A_RECEBER') {
      unificado = unificado.filter(h => h.tipo_movimento === 'A_RECEBER');
    } else if (filtros.tipo === 'ENTRADA') {
      unificado = unificado.filter(h => h.tipo_movimento === 'ENTRADA');
    } else if (filtros.tipo === 'SAIDA') {
      unificado = unificado.filter(h => h.tipo_movimento === 'SAIDA');
    }

    // Busca por texto
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      unificado = unificado.filter(h =>
        h.descricao?.toLowerCase().includes(termo) ||
        h.parceiro_nome?.toLowerCase().includes(termo) ||
        h.pedido_ref?.toLowerCase().includes(termo)
      );
    }

    // Ordenar por data desc
    unificado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const total = unificado.length;
    const from = (page - 1) * limit;
    const paginado = unificado.slice(from, from + limit);

    return {
      data: paginado,
      count: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getHistoricoTotals(filtros: IHistoricoFiltros = {}): Promise<IHistoricoTotals> {
    // ── Transações realizadas ──
    let queryTx = supabase.from('fin_transacoes').select('valor, tipo');
    if (filtros.dataInicio) queryTx = queryTx.gte('data_pagamento', filtros.dataInicio);
    if (filtros.dataFim) queryTx = queryTx.lte('data_pagamento', filtros.dataFim + 'T23:59:59');
    const { data: txData } = await queryTx;

    const entradas = (txData || []).filter(t => t.tipo === 'ENTRADA').reduce((acc, t) => acc + (t.valor || 0), 0);
    const saidas = (txData || []).filter(t => t.tipo === 'SAIDA').reduce((acc, t) => acc + (t.valor || 0), 0);

    // ── Títulos pendentes ──
    let queryPagar = supabase.from('fin_titulos').select('valor_total, valor_pago').eq('tipo', 'PAGAR').in('status', ['PENDENTE', 'PARCIAL', 'ATRASADO']);
    let queryReceber = supabase.from('fin_titulos').select('valor_total, valor_pago').eq('tipo', 'RECEBER').in('status', ['PENDENTE', 'PARCIAL', 'ATRASADO']);

    if (filtros.dataInicio) {
      queryPagar = queryPagar.gte('data_vencimento', filtros.dataInicio);
      queryReceber = queryReceber.gte('data_vencimento', filtros.dataInicio);
    }
    if (filtros.dataFim) {
      queryPagar = queryPagar.lte('data_vencimento', filtros.dataFim);
      queryReceber = queryReceber.lte('data_vencimento', filtros.dataFim);
    }

    const [{ data: pagarData }, { data: receberData }] = await Promise.all([queryPagar, queryReceber]);

    const aPagar = (pagarData || []).reduce((acc, t) => acc + ((t.valor_total || 0) - (t.valor_pago || 0)), 0);
    const aReceber = (receberData || []).reduce((acc, t) => acc + ((t.valor_total || 0) - (t.valor_pago || 0)), 0);

    return {
      entradas_realizadas: entradas,
      saidas_realizadas: saidas,
      a_pagar_pendente: aPagar,
      a_receber_pendente: aReceber,
      saldo_periodo: (entradas + aReceber) - (saidas + aPagar),
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