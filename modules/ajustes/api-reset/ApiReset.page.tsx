import React from 'react';
import ModulePlaceholder from '../../ModulePlaceholder';

const ApiResetPage: React.FC = () => {
  return (
    <ModulePlaceholder 
      title="API e Reset" 
      description="Configurações de desenvolvedor e manutenção de dados."
      submodules={[
        { label: 'API Keys', status: 'desenvolvimento' },
        { label: 'Webhooks', status: 'desenvolvimento' },
        { label: 'Limpeza de Dados (Reset)', status: 'desenvolvimento' },
        { label: 'Reset de Fábrica', status: 'desenvolvimento' },
        { label: 'Documentação Técnica', status: 'desenvolvimento' }
      ]}
      backPath="/ajustes"
    />
  );
};

export default ApiResetPage;