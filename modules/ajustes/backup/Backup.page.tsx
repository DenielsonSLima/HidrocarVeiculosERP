import React from 'react';
import ModulePlaceholder from '../../ModulePlaceholder';

const BackupPage: React.FC = () => {
  return (
    <ModulePlaceholder 
      title="Backup e Restauração" 
      description="Ferramentas de recuperação de desastres e exportação massiva."
      submodules={[
        { label: 'Snapshots do Banco', status: 'desenvolvimento' },
        { label: 'Download de JSON/CSV', status: 'desenvolvimento' },
        { label: 'Agendamento de Backup', status: 'desenvolvimento' },
        { label: 'Histórico de Restauros', status: 'desenvolvimento' }
      ]}
      backPath="/ajustes"
    />
  );
};

export default BackupPage;