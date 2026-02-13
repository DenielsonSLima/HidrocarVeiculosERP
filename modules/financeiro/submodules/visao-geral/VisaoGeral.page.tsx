import React, { useEffect, useState } from 'react';
import HeaderVisaoGeral from './components/HeaderVisaoGeral';
import CardSaldoContas from './components/CardSaldoContas';
import CardPendenciasUrgentes from './components/CardPendenciasUrgentes';
import { FinanceiroService } from '../../financeiro.service';
import { IContaBancaria } from '../../../ajustes/contas-bancarias/contas.types';
import { IPendencias } from '../../financeiro.types';

const VisaoGeralPage: React.FC = () => {
  const [contas, setContas] = useState<IContaBancaria[]>([]);
  const [pendencias, setPendencias] = useState<IPendencias>({
    atrasado: { total: 0, count: 0 },
    hoje: { total: 0, count: 0 }
  });

  useEffect(() => {
    loadData();
    const sub = FinanceiroService.subscribe(() => loadData());
    return () => { sub.unsubscribe(); };
  }, []);

  async function loadData() {
    try {
      const [contasData, pendenciasData] = await Promise.all([
        FinanceiroService.getContasBancarias(),
        FinanceiroService.getPendencias()
      ]);
      setContas(contasData || []);
      if (pendenciasData) setPendencias(pendenciasData);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros", error);
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Identificação no Topo */}
      <HeaderVisaoGeral />

      {/* 2. Conteúdo em Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Principal: Resumo de Contas */}
        <div className="lg:col-span-8">
          <CardSaldoContas contas={contas} />
        </div>

        {/* Coluna Lateral: Alertas e Próximos Passos */}
        <div className="lg:col-span-4">
          <CardPendenciasUrgentes pendencias={pendencias} />
        </div>
      </div>
    </div>
  );
};

export default VisaoGeralPage;
