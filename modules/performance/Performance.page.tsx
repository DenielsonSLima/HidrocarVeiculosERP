import React, { useState } from 'react';
import { PerformanceTab } from './performance.types';
import StrategicDashboard from './components/StrategicDashboard';
import FinancialPerformance from './components/FinancialPerformance';
import InventoryPerformance from './components/InventoryPerformance';
import SalesPerformance from './components/SalesPerformance';
import PurchasingPerformance from './components/PurchasingPerformance';
import OperationalPerformance from './components/OperationalPerformance';

/**
 * Módulo de Performance & Business Intelligence
 * Centraliza os indicadores estratégicos e operacionais do sistema.
 * Removido: Fiscal e Alertas IA por solicitação do usuário.
 */
const PerformancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('STRATEGIC');

  const menuItems: { id: PerformanceTab; label: string; icon: string; color: string }[] = [
    { id: 'STRATEGIC', label: 'Estratégico (CEO)', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'indigo' },
    { id: 'FINANCIAL', label: 'Rentabilidade', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
    { id: 'SALES', label: 'Desempenho Vendas', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'rose' },
    { id: 'INVENTORY', label: 'Giro de Estoque', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'amber' },
    { id: 'PURCHASING', label: 'Compras & ROI', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', color: 'blue' },
    { id: 'OPERATIONAL', label: 'Eficiência Operacional', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'slate' },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Performance & BI</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Análise profunda de dados para tomada de decisão estratégica</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
           <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Nexus BI Engine Active</span>
        </div>
      </div>

      {/* Menu de Navegação Superior Reorganizado */}
      <div className="flex bg-white p-1.5 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide gap-1.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center px-6 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === item.id 
                ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className={`w-4 h-4 mr-3 ${activeTab === item.id ? 'text-white' : `text-${item.color}-500`}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </div>

      {/* Área de Renderização Dinâmica */}
      <div className="min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'STRATEGIC' && <StrategicDashboard />}
        {activeTab === 'FINANCIAL' && <FinancialPerformance />}
        {activeTab === 'INVENTORY' && <InventoryPerformance />}
        {activeTab === 'PURCHASING' && <PurchasingPerformance />}
        {activeTab === 'SALES' && <SalesPerformance />}
        {activeTab === 'OPERATIONAL' && <OperationalPerformance />}
      </div>
    </div>
  );
};

export default PerformancePage;