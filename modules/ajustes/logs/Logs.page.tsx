import React from 'react';
import ModulePlaceholder from '../../ModulePlaceholder';

const LogsPage: React.FC = () => {
  return (
    <ModulePlaceholder 
      title="Logs e Eventos" 
      description="Trilha de auditoria completa para conformidade e segurança."
      submodules={[
        { label: 'Log de Acesso', status: 'desenvolvimento' },
        { label: 'Histórico de Alterações', status: 'desenvolvimento' },
        { label: 'Eventos Críticos', status: 'desenvolvimento' },
        { label: 'Auditoria por Usuário', status: 'desenvolvimento' },
        { label: 'Exportação de Logs', status: 'desenvolvimento' }
      ]}
      backPath="/ajustes"
    />
  );
};

export default LogsPage;