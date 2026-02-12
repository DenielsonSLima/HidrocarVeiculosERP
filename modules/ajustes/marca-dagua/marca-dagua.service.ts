
import { supabase } from '../../../lib/supabase';
import { IMarcaDaguaConfig } from './marca-dagua.types';

const TABLE = 'config_marca_dagua';

export const MarcaDaguaService = {
  /**
   * Busca a configuração única.
   */
  async getConfig(): Promise<IMarcaDaguaConfig | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // PGRST116: Nenhum resultado encontrado (normal para 1º acesso)
      if (error.code !== 'PGRST116') {
        console.error('Erro ao buscar config de marca d\'água:', error);
      }
      return null;
    }
    
    return data as IMarcaDaguaConfig;
  },

  /**
   * Salva ou atualiza a configuração (Singleton Pattern).
   */
  async saveConfig(payload: Partial<IMarcaDaguaConfig>): Promise<IMarcaDaguaConfig> {
    // 1. Tenta recuperar ID existente se não vier no payload
    let idToUpdate = payload.id;
    
    if (!idToUpdate) {
      const existing = await this.getConfig();
      if (existing) {
        idToUpdate = existing.id;
      }
    }

    const dataToSave = {
      ...payload,
      id: idToUpdate,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data as IMarcaDaguaConfig;
  },

  /**
   * Escuta mudanças em tempo real na tabela de configuração de marca d'água.
   */
  subscribe(onUpdate: () => void) {
    return supabase
      .channel('public:config_marca_dagua_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
