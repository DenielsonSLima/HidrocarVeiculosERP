
import { supabase } from '../../../lib/supabase';
import { ICombustivel } from './combustivel.types';

const TABLE = 'cad_combustivel';

export const CombustivelService = {
  async getAll(): Promise<ICombustivel[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar combustíveis:', error);
      return [];
    }
    return data as ICombustivel[];
  },

  async save(payload: Partial<ICombustivel>): Promise<ICombustivel> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ 
        ...payload, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    return data as ICombustivel;
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
      .channel('public:cad_combustivel_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
