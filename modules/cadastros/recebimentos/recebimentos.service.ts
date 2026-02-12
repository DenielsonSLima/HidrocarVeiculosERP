
import { supabase } from '../../../lib/supabase';
import { ITipoRecebimento } from './recebimentos.types';

const TABLE = 'cad_tipos_recebimento';

/**
 * @deprecated Service vinculado a tabela legada 'cad_tipos_recebimento'. Não utilizado pelo módulo financeiro atual.
 */
export const RecebimentosService = {
  async getAll(): Promise<ITipoRecebimento[]> {
    console.warn('RecebimentosService is deprecated. Use FormasPagamentoService.');
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tipos de recebimento:', error);
      return [];
    }
    return data as ITipoRecebimento[];
  },

  async save(payload: Partial<ITipoRecebimento>): Promise<ITipoRecebimento> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as ITipoRecebimento;
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
      .channel('public:cad_tipos_recebimento_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
