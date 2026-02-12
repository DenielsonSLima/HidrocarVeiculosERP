
import React from 'react';
import ModulePlaceholder from '../ModulePlaceholder';

const CadastrosPage: React.FC = () => {
  return (
    <ModulePlaceholder 
      title="Cadastros Gerais" 
      description="Gerencie a base de dados principal do seu ecossistema."
      submodules={[
        { label: 'Cidades e Estados', path: '/cadastros/cidades', status: 'pronto' },
        { label: 'Montadoras', path: '/cadastros/montadoras', status: 'pronto' },
        { label: 'Tipos de Veículos', path: '/cadastros/tipos-veiculos', status: 'pronto' },
        { label: 'Modelos de Veículos', path: '/cadastros/modelos', status: 'pronto' },
        { label: 'Versões Comerciais', path: '/cadastros/versoes', status: 'pronto' },
        { label: 'Características Técnicas', path: '/cadastros/caracteristicas', status: 'pronto' },
        { label: 'Opcionais e Acessórios', path: '/cadastros/opcionais', status: 'pronto' },
        
        { label: 'Motorização', path: '/cadastros/motorizacao', status: 'pronto' },
        { label: 'Combustível', path: '/cadastros/combustivel', status: 'pronto' },
        { label: 'Transmissão', path: '/cadastros/transmissao', status: 'pronto' },
        { label: 'Cores e Pintura', path: '/cadastros/cores', status: 'pronto' },

        // Financeiro Básico e Pessoas
        { label: 'Corretores', path: '/cadastros/corretores', status: 'desenvolvimento' },
        { label: 'Tipos de Despesas', path: '/cadastros/tipos-despesas', status: 'desenvolvimento' },
        { label: 'Formas de Pagamento', path: '/cadastros/formas-pagamento', status: 'desenvolvimento' },
        { label: 'Condição de Pagamento', path: '/cadastros/condicoes-pagamento', status: 'pronto' },
        { label: 'Condição de Recebimento', path: '/cadastros/condicoes-recebimento', status: 'pronto' }
      ]}
    />
  );
};

export default CadastrosPage;
