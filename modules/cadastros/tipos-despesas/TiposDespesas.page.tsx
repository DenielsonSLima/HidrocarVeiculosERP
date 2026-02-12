
import React from 'react';
import ExpenseManager from './components/ExpenseManager';

const TiposDespesasPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Tipos de Despesas</h1>
          <p className="text-slate-500 mt-1">Configure o plano de contas e centros de custo.</p>
        </div>
      </div>

      <ExpenseManager />
    </div>
  );
};

export default TiposDespesasPage;
