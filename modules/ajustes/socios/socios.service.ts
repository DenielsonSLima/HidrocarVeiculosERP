
import { supabase } from '../../../lib/supabase';
import { ISocio } from './socios.types';

const TABLE = 'config_socios';

export const SociosService = {
  /**
   * Busca todos os sócios ordenados por nome.
   */
  async getAll(): Promise<ISocio[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar sócios:', error);
      return [];
    }
    return data as ISocio[];
  },

  /**
   * Salva (Insere ou Atualiza) um sócio.
   */
  async save(socio: Partial<ISocio>): Promise<ISocio> {
    const dataToSave = {
      ...socio,
      updated_at: new Date().toISOString()
    };

    // Se for novo registro, removemos o ID undefined para o banco gerar
    if (!dataToSave.id) {
      delete dataToSave.id;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data as ISocio;
  },

  /**
   * Remove um sócio pelo ID.
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Alterna o status ativo/inativo.
   */
  async toggleStatus(id: string, currentStatus: boolean): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE)
      .update({ ativo: !currentStatus })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Inscreve para receber atualizações em tempo real da tabela de sócios.
   */
  subscribe(onUpdate: () => void) {
    return supabase
      .channel('public:config_socios_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
