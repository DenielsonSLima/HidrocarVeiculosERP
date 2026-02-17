import { supabase } from '../../../../lib/supabase';
import { ITituloFixa, FixasTab, IFixasFiltros } from './despesas-fixas.types';

const TABLE = 'fin_titulos';

export const DespesasFixasService = {
  async getAll(tab: FixasTab, filtros: IFixasFiltros): Promise<ITituloFixa[]> {
    let query = supabase
      .from(TABLE)
      .select(`
        *,
        parceiro:parceiros(nome),
        categoria:fin_categorias!inner(id, nome, tipo)
      `)
      .eq('tipo', 'PAGAR')
      .eq('fin_categorias.tipo', 'FIXA');

    const hoje = new Date().toISOString().split('T')[0];
    
    if (tab === 'MES_ATUAL') {
      const now = new Date();
      const primeiroDia = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      query = query.gte('data_vencimento', primeiroDia).lte('data_vencimento', ultimoDia);
    } else if (tab === 'ATRASADOS') {
      query = query.lt('data_vencimento', hoje).neq('status', 'PAGO').neq('status', 'CANCELADO');
    }

    if (filtros.busca) {
      query = query.or(`descricao.ilike.%${filtros.busca}%, documento_ref.ilike.%${filtros.busca}%`);
    }
    if (filtros.categoriaId) query = query.eq('categoria_id', filtros.categoriaId);
    if (filtros.status) query = query.eq('status', filtros.status);
    if (filtros.dataInicio) query = query.gte('data_vencimento', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data_vencimento', filtros.dataFim);

    const { data, error } = await query.order('data_vencimento', { ascending: true });
    
    if (error) throw error;
    return data as any as ITituloFixa[];
  },

  async save(payload: {
    descricao: string;
    valor_total: number;
    data_vencimento: string;
    categoria_id: string;
    parceiro_id?: string;
    documento_ref?: string;
  }): Promise<void> {
    const { error } = await supabase.from(TABLE).insert({
      descricao: payload.descricao,
      valor_total: payload.valor_total,
      valor_pago: 0,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: payload.data_vencimento,
      tipo: 'PAGAR',
      status: 'PENDENTE',
      categoria_id: payload.categoria_id,
      parceiro_id: payload.parceiro_id || null,
      documento_ref: payload.documento_ref || null,
      parcela_numero: 1,
      parcela_total: 1,
    });
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('fin_despesas_fixas_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onUpdate())
      .subscribe();
  }
};
