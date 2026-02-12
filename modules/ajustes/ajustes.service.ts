
/**
 * Service central do módulo de Ajustes.
 * Configurado temporariamente para LocalStorage para garantir performance instantânea.
 */
export const AjustesCentralService = {
  // Removido o modificador 'private' pois não é permitido em métodos de objetos literais no TypeScript
  getStorageKey(table: string) {
    return `nexus_erp_config_${table}`;
  },

  async getSettings(table: string) {
    try {
      const key = this.getStorageKey(table);
      const cachedData = localStorage.getItem(key);
      
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      return null;
    } catch (error) {
      console.error(`Erro ao buscar configurações locais (${table}):`, error);
      return null;
    }
  },

  async updateSettings(table: string, payload: any) {
    try {
      const key = this.getStorageKey(table);
      const dataToSave = { 
        ...payload, 
        updated_at: new Date().toISOString() 
      };
      
      localStorage.setItem(key, JSON.stringify(dataToSave));
      
      // Registra o evento no log local
      await this.logEvent(`UPDATE_${table.toUpperCase()}`, { success: true });
      
      return dataToSave;
    } catch (error) {
      console.error(`Erro ao salvar configurações locais (${table}):`, error);
      throw error;
    }
  },

  async logEvent(event: string, details: any) {
    try {
      const logsKey = 'nexus_erp_system_logs';
      const existingLogs = JSON.parse(localStorage.getItem(logsKey) || '[]');
      
      const newLog = {
        id: crypto.randomUUID(),
        event,
        details,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem(logsKey, JSON.stringify([newLog, ...existingLogs].slice(0, 100)));
    } catch (error) {
      console.error('Erro ao registrar log local:', error);
    }
  }
};
