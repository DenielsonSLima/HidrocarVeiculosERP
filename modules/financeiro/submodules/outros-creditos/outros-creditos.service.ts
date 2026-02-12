import { supabase } from '../../../../lib/supabase';
import { ITituloCredito, CreditosTab, ICreditoFiltros } from './outros-creditos.types';

const TABLE = 'fin_titulos';

export const OutrosCreditosService = {
  async getAll(tab: CreditosTab, filtros: ICreditoFiltros): Promise<ITituloCredito[]> {
    let query = supabase
      .from(TABLE)
      .select(`
        *,
        parceiro:parceiros(nome),
        categoria:fin_categorias!inner(nome, tipo),
        conta_bancaria:fin_contas_bancarias(banco_nome, conta)
      `)
      .eq('tipo', 'RECEBER')
      .eq('fin_categorias.tipo', 'OUTROS');

    if (tab === 'MES_ATUAL') {
      const now = new Date();
      const primeiroDia = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      query = query.gte('data_vencimento', primeiroDia).lte('data_vencimento', ultimoDia);
    }

    if (filtros.busca) {
      query = query.or(`descricao.ilike.%${filtros.busca}%, documento_ref.ilike.%${filtros.busca}%`);
    }
    if (filtros.dataInicio) query = query.gte('data_vencimento', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_vencimento', filtros.dataFim);

    const { data, error } = await query.order('data_vencimento', { ascending: false });
    
    if (error) throw error;
    return data as any as ITituloCredito[];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('fin_outros_creditos_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onUpdate())
      .subscribe();
  }
};
