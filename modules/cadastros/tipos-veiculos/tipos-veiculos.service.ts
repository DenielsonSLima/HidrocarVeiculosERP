
import { supabase } from '../../../lib/supabase';
import { ITipoVeiculo } from './tipos-veiculos.types';

const TABLE = 'cad_tipos_veiculos';

export const TiposVeiculosService = {
  async getAll(): Promise<ITipoVeiculo[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tipos de veículos:', error);
      return [];
    }
    return data as ITipoVeiculo[];
  },

  async save(payload: Partial<ITipoVeiculo>): Promise<ITipoVeiculo> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ 
        ...payload, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    return data as ITipoVeiculo;
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
      .channel('public:cad_tipos_veiculos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
