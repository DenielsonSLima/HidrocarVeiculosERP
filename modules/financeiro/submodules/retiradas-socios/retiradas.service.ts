
import { supabase } from '../../../../lib/supabase';
import { IRetirada, RetiradaTab, IRetiradaFiltros } from './retiradas.types';

const TABLE = 'fin_retiradas';

export const RetiradasService = {
  async getAll(tab: RetiradaTab, filtros: IRetiradaFiltros): Promise<IRetirada[]> {
    let query = supabase
      .from(TABLE)
      .select(`
        *,
        socio:config_socios(nome, cpf),
        conta_origem:fin_contas_bancarias(banco_nome, conta, titular)
      `);

    if (tab === 'MES_ATUAL') {
      const now = new Date();
      const primeiroDia = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      query = query.gte('data', primeiroDia).lte('data', ultimoDia);
    }

    if (filtros.busca) {
      query = query.ilike('descricao', `%${filtros.busca}%`);
    }
    if (filtros.socioId) query = query.eq('socio_id', filtros.socioId);
    if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
    if (filtros.dataInicio) query = query.gte('data', filtros.dataInicio);
    if (filtros.dataFim) query = query.lte('data', filtros.dataFim);

    const { data, error } = await query.order('data', { ascending: false });
    if (error) throw error;
    return data as IRetirada[];
  },

  async save(payload: Partial<IRetirada>): Promise<void> {
    const isNew = !payload.id;
    
    // 1. Salva a Retirada
    const { data: currentRetirada, error: errSave } = await supabase
      .from(TABLE)
      .upsert({ ...payload, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (errSave) throw errSave;

    // 2. Se for novo, abate do saldo da conta bancária e lança no extrato
    if (isNew) {
      // Ajuste de Saldo
      const { data: conta } = await supabase.from('fin_contas_bancarias').select('saldo_atual').eq('id', payload.conta_origem_id).single();
      await supabase.from('fin_contas_bancarias').update({ saldo_atual: (conta.saldo_atual - payload.valor!) }).eq('id', payload.conta_origem_id);

      // Lançamento no Extrato
      await supabase.from('fin_transacoes').insert({
        conta_origem_id: payload.conta_origem_id,
        valor: payload.valor,
        tipo: 'SAIDA',
        data_pagamento: payload.data,
        tipo_transacao: 'RETIRADA_SOCIO',
        descricao: `RETIRADA: ${payload.descricao}`
      });
    }
  },

  async delete(id: string): Promise<void> {
    const { data: old } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (old) {
      // Reverte saldo
      const { data: conta } = await supabase.from('fin_contas_bancarias').select('saldo_atual').eq('id', old.conta_origem_id).single();
      await supabase.from('fin_contas_bancarias').update({ saldo_atual: (conta.saldo_atual + old.valor) }).eq('id', old.conta_origem_id);
      
      // Remove do extrato
      await supabase.from('fin_transacoes').delete().match({ tipo_transacao: 'RETIRADA_SOCIO', valor: old.valor, data_pagamento: old.data });
    }

    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('fin_retiradas_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onUpdate())
      .subscribe();
  }
};
