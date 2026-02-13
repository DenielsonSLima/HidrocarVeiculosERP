
import { supabase } from '../../../lib/supabase';

export const LogsService = {
  async fetchLogs() {
    // Logs geralmente são apenas leitura, consultamos direto mas mantendo o padrão de service
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};
