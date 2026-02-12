
import { supabase } from '../../lib/supabase';

export const CadastrosMasterService = {
  getStorageKey(submodule: string) {
    return `nexus_cadastros_${submodule}`;
  },

  async getFromDB(table: string) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Erro ao buscar dados de ${table}:`, error);
      return [];
    }
    return data;
  },

  async saveToDB(table: string, payload: any) {
    const { data, error } = await supabase
      .from(table)
      .upsert({ ...payload, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      console.error(`Erro ao salvar em ${table}:`, error);
      throw error;
    }
    return data;
  },

  async deleteFromDB(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao deletar de ${table}:`, error);
      throw error;
    }
    return true;
  }
};
