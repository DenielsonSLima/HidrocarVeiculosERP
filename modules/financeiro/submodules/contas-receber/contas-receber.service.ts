import { supabase } from '../../../../lib/supabase';
import { ITituloReceber, ReceberTab, IReceberFiltros, IReceberResponse } from './contas-receber.types';

const TABLE = 'fin_titulos';

export const ContasReceberService = {
  async getAll(tab: ReceberTab, filtros: IReceberFiltros): Promise<IReceberResponse> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select(`
        *,
        parceiro:parceiros(nome, documento),
        categoria:fin_categorias(nome),
        pedido_venda:venda_pedidos(id, numero_venda)
      `, { count: 'exact' })
      .eq('tipo', 'RECEBER');

    const hoje = new Date().toISOString().split('T')[0];

    if (tab === 'MES_ATUAL') {
      const now = new Date();
      const primeiroDia = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      query = query.gte('data_vencimento', primeiroDia).lte('data_vencimento', ultimoDia);
    } else if (tab === 'ATRASADOS') {
      query = query.lt('data_vencimento', hoje).neq('status', 'PAGO');
    }

    if (filtros.busca) {
      query = query.or(`descricao.ilike.%${filtros.busca}%, documento_ref.ilike.%${filtros.busca}%`);
    }
    if (filtros.categoriaId) query = query.eq('categoria_id', filtros.categoriaId);
    if (filtros.status) query = query.eq('status', filtros.status);
    if (filtros.dataInicio) query = query.gte('data_vencimento', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_vencimento', filtros.dataFim);

    const { data, error, count } = await query
      .order('data_vencimento', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return {
      data: (data || []) as ITituloReceber[],
      count: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('fin_contas_receber_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onUpdate())
      .subscribe();
  }
};
