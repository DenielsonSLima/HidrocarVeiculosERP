
import { supabase } from '../../../lib/supabase';
import { ICaracteristica } from './caracteristicas.types';

const TABLE = 'cad_caracteristicas';

export const CaracteristicasService = {
  async getAll(): Promise<ICaracteristica[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar características:', error);
      return [];
    }
    return data as ICaracteristica[];
  },

  async save(payload: Partial<ICaracteristica>): Promise<ICaracteristica> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ 
        ...payload, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    return data as ICaracteristica;
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
      .channel('public:cad_caracteristicas_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
