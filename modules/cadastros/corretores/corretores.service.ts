
import { supabase } from '../../../lib/supabase';
import { ICorretor } from './corretores.types';

const TABLE = 'cad_corretores';

export const CorretoresService = {
  // Leitura direta do Banco (Sem Cache Local)
  async getAll(): Promise<ICorretor[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar corretores:', error);
      return [];
    }
    return data as ICorretor[];
  },

  async save(payload: Partial<ICorretor>): Promise<ICorretor> {
    const dataToSave = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    // Remove ID se for vazio para garantir insert correto
    if (!dataToSave.id) delete dataToSave.id;

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data as ICorretor;
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
      .update({ ativo: !currentStatus })
      .eq('id', id);

    if (error) throw error;
  },

  // Realtime: Escuta mudanças diretamente do canal do Supabase
  subscribe(onUpdate: (eventType: string) => void) {
    return supabase
      .channel('public:cad_corretores_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => onUpdate(payload.eventType)
      )
      .subscribe();
  }
};
