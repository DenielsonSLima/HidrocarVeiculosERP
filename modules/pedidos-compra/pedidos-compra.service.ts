import { supabase } from '../../lib/supabase';
import { IPedidoCompra, IPedidoFiltros, IPedidoPagamento, IPedidoCompraResponse } from './pedidos-compra.types';
import { FinanceiroAutomationService } from '../financeiro/financeiro.automation';

const TABLE = 'cmp_pedidos';

export const PedidosCompraService = {
  async getAll(filtros: IPedidoFiltros, aba: string): Promise<IPedidoCompraResponse> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select(`
        *,
        fornecedor:parceiros(nome, documento, cidade, uf),
        corretor:cad_corretores(nome, sobrenome),
        veiculos:est_veiculos!est_veiculos_pedido_id_fkey(
          id,
          valor_custo,
          placa,
          fotos,
          socios,
          montadora:cad_montadoras(nome, logo_url),
          modelo:cad_modelos(nome),
          versao:cad_versoes(nome)
        )
      `, { count: 'exact' });

    // Filtros
    if (aba === 'RASCUNHO') query = query.eq('status', 'RASCUNHO');
    // Active orders include only Concluded
    if (aba === 'EFETIVADOS') query = query.eq('status', 'CONCLUIDO');

    if (filtros.dataInicio) query = query.gte('data_compra', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_compra', `${filtros.dataFim}T23:59:59`);
    if (filtros.corretorId) query = query.eq('corretor_id', filtros.corretorId);
    if (filtros.busca) query = query.ilike('numero_pedido', `%${filtros.busca}%`);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: (data || []) as IPedidoCompra[],
      count: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async getDashboardStats(filtros: IPedidoFiltros, aba: string): Promise<IPedidoCompra[]> {
    // Busca leve para KPIs
    let query = supabase
      .from(TABLE)
      .select(`
        id,
        valor_negociado,
        status,
        veiculos:est_veiculos!est_veiculos_pedido_id_fkey(
          valor_custo
        )
      `);

    // Aplica os mesmos filtros
    if (aba === 'RASCUNHO') query = query.eq('status', 'RASCUNHO');
    if (aba === 'EFETIVADOS') query = query.eq('status', 'CONCLUIDO');

    if (filtros.dataInicio) query = query.gte('data_compra', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_compra', `${filtros.dataFim}T23:59:59`);
    if (filtros.corretorId) query = query.eq('corretor_id', filtros.corretorId);
    if (filtros.busca) query = query.ilike('numero_pedido', `%${filtros.busca}%`);

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar stats:', error);
      return [];
    }
    return data as any;
  },

  async getById(id: string): Promise<IPedidoCompra | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *,
        fornecedor:parceiros(*),
        corretor:cad_corretores(*),
        forma_pagamento:cad_formas_pagamento(*),
        veiculos:est_veiculos!est_veiculos_pedido_id_fkey(
          *,
          montadora:cad_montadoras(*),
          modelo:cad_modelos(*),
          versao:cad_versoes(*),
          tipo_veiculo:cad_tipos_veiculos(*)
        ),
        pagamentos:cmp_pedidos_pagamentos(
          *,
          forma_pagamento:cad_formas_pagamento(nome),
          condicao:cad_condicoes_pagamento(nome)
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data as IPedidoCompra;
  },

  async save(payload: Partial<IPedidoCompra>): Promise<IPedidoCompra> {
    const { id, fornecedor, corretor, forma_pagamento, veiculos, pagamentos, ...rest } = payload as any;
    const dataToSave = { ...rest, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(id ? { id, ...dataToSave } : dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data as IPedidoCompra;
  },

  async savePayment(payment: Partial<IPedidoPagamento>): Promise<void> {
    const { error } = await supabase
      .from('cmp_pedidos_pagamentos')
      .upsert(payment);
    if (error) throw error;
  },

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('cmp_pedidos_pagamentos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async confirmOrder(params: {
    pedido: IPedidoCompra,
    condicao: any,
    contaBancariaId?: string
  }): Promise<void> {
    const { pedido, condicao, contaBancariaId } = params;

    const isConsignacao = pedido.forma_pagamento?.nome?.toLowerCase().includes('consignação') ||
      pedido.forma_pagamento?.nome?.toLowerCase().includes('consignacao');

    await FinanceiroAutomationService.processarFinanceiroPedido({
      tipo: isConsignacao ? 'RECEBER' : 'PAGAR',
      pedidoId: pedido.id,
      parceiroId: pedido.fornecedor_id!,
      formaPagamento: pedido.forma_pagamento!,
      condicao: condicao,
      valorTotal: isConsignacao ? 0 : pedido.valor_negociado,
      descricao: isConsignacao
        ? `COMISSÃO SOBRE CONSIGNAÇÃO: ${pedido.numero_pedido || pedido.id.substring(0, 8)}`
        : `AQUISIÇÃO: ${pedido.numero_pedido || pedido.id.substring(0, 8)}`,
      contaBancariaId
    });

    await supabase
      .from(TABLE)
      .update({ status: 'CONCLUIDO', updated_at: new Date().toISOString() })
      .eq('id', pedido.id);

    if (pedido.veiculos && pedido.veiculos.length > 0) {
      const vIds = pedido.veiculos.map(v => v.id);
      await supabase
        .from('est_veiculos')
        .update({
          status: 'DISPONIVEL',
          publicado_site: false,
          updated_at: new Date().toISOString()
        })
        .in('id', vIds);
    }
  },

  async reopenOrder(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({
        status: 'RASCUNHO',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao reabrir pedido:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async unlinkVehicle(veiculoId: string): Promise<void> {
    await supabase.from('est_veiculos').update({ pedido_id: null }).eq('id', veiculoId);
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('cmp_pedidos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cmp_pedidos_pagamentos' }, () => onUpdate())
      .subscribe();
  }
};