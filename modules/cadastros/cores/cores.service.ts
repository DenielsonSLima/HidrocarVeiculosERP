
import { supabase } from '../../../lib/supabase';
import { ICor } from './cores.types';

const TABLE = 'cad_cores';

export const CoresService = {
  async getAll(): Promise<ICor[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar cores:', error);
      return [];
    }
    return data as ICor[];
  },

  async save(payload: Partial<ICor>): Promise<ICor> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ 
        ...payload, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    return data as ICor;
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
      .channel('public:cad_cores_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
