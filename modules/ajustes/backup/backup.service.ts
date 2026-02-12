
import { AjustesCentralService } from '../ajustes.service';

export const BackupService = {
  async triggerBackup() {
    await AjustesCentralService.logEvent('BACKUP_REQUESTED', { timestamp: new Date() });
    // Lógica simulada de backup
    return { status: 'success', message: 'Backup iniciado' };
  }
};
