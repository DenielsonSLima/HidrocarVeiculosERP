import React from 'react';
import ModulePlaceholder from '../ModulePlaceholder';

const EditorSitePage: React.FC = () => {
  return (
    <ModulePlaceholder 
      title="Editor de Site & Catálogo" 
      description="Crie sua presença digital integrada diretamente com seu estoque."
      submodules={[
        { label: 'Design do Site', status: 'desenvolvimento' },
        { label: 'Catálogo Digital', status: 'desenvolvimento' },
        { label: 'Domínios', status: 'desenvolvimento' },
        { label: 'SEO Config', status: 'desenvolvimento' },
        { label: 'Banner Manager', status: 'desenvolvimento' }
      ]}
    />
  );
};

export default EditorSitePage;