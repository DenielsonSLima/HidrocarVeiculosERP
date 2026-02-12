
import { supabase } from '../../../lib/supabase';
import { IOpcional } from './opcionais.types';

const TABLE = 'cad_opcionais';

export const OpcionaisService = {
  async getAll(): Promise<IOpcional[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar opcionais:', error);
      return [];
    }
    return data as IOpcional[];
  },

  async save(payload: Partial<IOpcional>): Promise<IOpcional> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ 
        ...payload, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    return data as IOpcional;
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
      .channel('public:cad_opcionais_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
