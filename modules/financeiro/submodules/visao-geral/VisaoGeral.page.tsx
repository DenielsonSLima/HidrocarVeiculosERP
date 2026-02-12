import React from 'react';
import HeaderVisaoGeral from './components/HeaderVisaoGeral';
import CardSaldoContas from './components/CardSaldoContas';
import CardPendenciasUrgentes from './components/CardPendenciasUrgentes';

const VisaoGeralPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* 1. Identificação no Topo */}
      <HeaderVisaoGeral />

      {/* 2. Conteúdo em Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Principal: Resumo de Contas */}
        <div className="lg:col-span-8">
          <CardSaldoContas />
        </div>

        {/* Coluna Lateral: Alertas e Próximos Passos */}
        <div className="lg:col-span-4">
          <CardPendenciasUrgentes />
        </div>
      </div>
    </div>
  );
};

export default VisaoGeralPage;
