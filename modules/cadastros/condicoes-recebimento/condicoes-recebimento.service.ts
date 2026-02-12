
import { supabase } from '../../../lib/supabase';
import { ICondicaoRecebimento } from './condicoes-recebimento.types';

const TABLE = 'cad_condicoes_recebimento'; 

export const CondicoesRecebimentoService = {
  // Busca todas as regras de uma forma de pagamento específica (contexto de recebimento)
  async getByFormaPagamento(formaId: string): Promise<ICondicaoRecebimento[]> {
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
    return data as ICondicaoRecebimento[];
  },

  async save(payload: Partial<ICondicaoRecebimento>): Promise<ICondicaoRecebimento> {
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
    return data as ICondicaoRecebimento;
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
