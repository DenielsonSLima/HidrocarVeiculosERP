import { supabase } from '../../lib/supabase';
import { IPedidoVenda, IVendaFiltros, IVendaPagamento, VendaTab, IPedidoVendaResponse } from './pedidos-venda.types';
import { FinanceiroAutomationService } from '../financeiro/financeiro.automation';

const TABLE = 'venda_pedidos';
const PAYMENTS_TABLE = 'venda_pedidos_pagamentos';

export const PedidosVendaService = {
  async getAll(filtros: IVendaFiltros, tab: VendaTab): Promise<IPedidoVendaResponse> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select(`
        *,
        cliente:parceiros(nome, documento, cidade, uf),
        veiculo:est_veiculos(
          id,
          valor_custo,
          valor_custo,
          placa,
          fotos,
          socios,
          montadora:cad_montadoras(nome, logo_url),
          modelo:cad_modelos(nome),
          versao:cad_versoes(nome)
        )
      `, { count: 'exact' });

    // Filtros por Aba
    if (tab === 'RASCUNHO') {
      query = query.eq('status', 'RASCUNHO');
    } else if (tab === 'MES_ATUAL') {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      query = query.eq('status', 'CONCLUIDO').gte('data_venda', first);
    }

    // Filtros Avançados
    if (filtros.busca) query = query.ilike('numero_venda', `%${filtros.busca}%`);
    if (filtros.dataInicio) query = query.gte('data_venda', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_venda', `${filtros.dataFim}T23:59:59`);
    if (filtros.status) query = query.eq('status', filtros.status);
    if (filtros.corretorId) query = query.eq('corretor_id', filtros.corretorId);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: (data || []) as IPedidoVenda[],
      count: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async getDashboardStats(filtros: IVendaFiltros, tab: VendaTab): Promise<IPedidoVenda[]> {
    let query = supabase
      .from(TABLE)
      .select(`
        id,
        valor_venda,
        status,
        veiculo:est_veiculos(valor_custo)
      `);

    // Mesma lógica de filtros
    if (tab === 'RASCUNHO') {
      query = query.eq('status', 'RASCUNHO');
    } else if (tab === 'MES_ATUAL') {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      query = query.eq('status', 'CONCLUIDO').gte('data_venda', first);
    }

    if (filtros.busca) query = query.ilike('numero_venda', `%${filtros.busca}%`);
    if (filtros.dataInicio) query = query.gte('data_venda', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_venda', `${filtros.dataFim}T23:59:59`);
    if (filtros.status) query = query.eq('status', filtros.status);
    if (filtros.corretorId) query = query.eq('corretor_id', filtros.corretorId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching stats:', error);
      return [];
    }
    return data as any;
  },

  async getById(id: string): Promise<IPedidoVenda | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *,
        cliente:parceiros(*),
        veiculo:est_veiculos(
          *, 
          montadora:cad_montadoras(*), 
          modelo:cad_modelos(*), 
          versao:cad_versoes(*),
          pedido_compra:cmp_pedidos(id, forma_pagamento:cad_formas_pagamento(id, nome))
        ),
        forma_pagamento:cad_formas_pagamento(*),
        pagamentos:venda_pedidos_pagamentos(
          *,
          forma_pagamento:cad_formas_pagamento(nome),
          condicao:cad_condicoes_recebimento(nome),
          conta_bancaria:fin_contas_bancarias(banco_nome, conta)
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data as IPedidoVenda;
  },

  async save(payload: Partial<IPedidoVenda>): Promise<IPedidoVenda> {
    const { id, cliente, veiculo, forma_pagamento, pagamentos, ...rest } = payload as any;
    const dataToSave = { ...rest, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(id ? { id, ...dataToSave } : dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data as IPedidoVenda;
  },

  async savePayment(payment: Partial<IVendaPagamento>): Promise<void> {
    const { error } = await supabase
      .from(PAYMENTS_TABLE)
      .upsert(payment);
    if (error) throw error;
  },

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from(PAYMENTS_TABLE)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async confirmSale(params: {
    pedido: IPedidoVenda,
    condicao: any,
    contaBancariaId?: string
  }): Promise<void> {
    const { pedido, condicao, contaBancariaId } = params;

    const isConsignacao = pedido.forma_pagamento?.nome?.toLowerCase().includes('consignação') ||
      pedido.forma_pagamento?.nome?.toLowerCase().includes('consignacao');

    await FinanceiroAutomationService.processarFinanceiroPedido({
      tipo: 'RECEBER',
      pedidoId: pedido.id,
      parceiroId: pedido.cliente_id,
      formaPagamento: pedido.forma_pagamento!,
      condicao: condicao,
      // Mesmo em consignação, o valor do pedido de venda é a comissão a receber
      valorTotal: pedido.valor_venda,
      descricao: isConsignacao
        ? `COMISSÃO CONSIGNAÇÃO: ${pedido.numero_venda || pedido.id.substring(0, 8)}`
        : `VENDA: ${pedido.numero_venda || pedido.id.substring(0, 8)}`,
      contaBancariaId
    });

    await supabase.from(TABLE).update({ status: 'CONCLUIDO', updated_at: new Date().toISOString() }).eq('id', pedido.id);

    if (pedido.veiculo_id) {
      await supabase.from('est_veiculos').update({
        status: 'VENDIDO',
        publicado_site: false,
        updated_at: new Date().toISOString()
      }).eq('id', pedido.veiculo_id);
    }
  },

  async delete(id: string): Promise<void> {
    await supabase.from(TABLE).delete().eq('id', id);
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('venda_pedidos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: PAYMENTS_TABLE }, () => onUpdate())
      .subscribe();
  }
};