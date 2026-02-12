
import { AjustesCentralService } from '../ajustes.service';

export const ApiResetService = {
  async rotateApiKey() {
    await AjustesCentralService.logEvent('API_KEY_ROTATED', {});
    return { key: 'new-simulated-key' };
  },
  async resetData() {
    await AjustesCentralService.logEvent('SYSTEM_RESET', { warning: 'All data cleared' });
    return { status: 'reset_complete' };
  }
};
