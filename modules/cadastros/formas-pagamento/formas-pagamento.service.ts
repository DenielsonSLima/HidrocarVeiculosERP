
import { supabase } from '../../../lib/supabase';
import { IFormaPagamento } from './formas-pagamento.types';

const TABLE = 'cad_formas_pagamento';

export const FormasPagamentoService = {
  async getAll(): Promise<IFormaPagamento[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      return [];
    }
    return data as IFormaPagamento[];
  },

  async save(payload: Partial<IFormaPagamento>): Promise<IFormaPagamento> {
    const dataToSave = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    // Remove campos undefined se existirem para evitar erro de tipo
    if (!dataToSave.id) delete dataToSave.id;

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(dataToSave)
      .select()
      .single();

    if (error) {
      // Tratamento específico para o erro de Check Constraint relatado
      if (error.message.includes('violates check constraint')) {
        throw new Error('O banco de dados rejeitou o tipo de lançamento. Atualize as Constraints no SQL Editor.');
      }
      throw error;
    }
    return data as IFormaPagamento;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('public:cad_formas_pagamento_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
