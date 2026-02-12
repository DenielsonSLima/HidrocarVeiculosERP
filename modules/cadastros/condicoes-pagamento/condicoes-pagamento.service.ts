
import { supabase } from '../../../lib/supabase';
import { ICondicaoPagamento } from './condicoes-pagamento.types';

const TABLE = 'cad_condicoes_pagamento';

export const CondicoesPagamentoService = {
  // Busca todas as regras de uma forma de pagamento específica
  async getByFormaPagamento(formaId: string): Promise<ICondicaoPagamento[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('forma_pagamento_id', formaId)
      .order('qtd_parcelas', { ascending: true })
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar condições:', error);
      return [];
    }
    return data as ICondicaoPagamento[];
  },

  async save(payload: Partial<ICondicaoPagamento>): Promise<ICondicaoPagamento> {
    const dataToSave = {
      ...payload,
      updated_at: new Date().toISOString()
    };
    if (!dataToSave.id) delete dataToSave.id;

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data as ICondicaoPagamento;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async toggleStatus(id: string, currentStatus: boolean): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ 
        ativo: !currentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Escuta apenas as mudanças relacionadas à forma de pagamento aberta
  subscribe(formaId: string, onUpdate: () => void) {
    return supabase
      .channel(`public:${TABLE}:${formaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE, filter: `forma_pagamento_id=eq.${formaId}` },
        () => onUpdate()
      )
      .subscribe();
  }
};
