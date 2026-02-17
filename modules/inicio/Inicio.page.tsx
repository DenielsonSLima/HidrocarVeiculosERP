
import React, { useState, useEffect } from 'react';
import { InicioService } from './inicio.service';
import { IDashboardStats } from './inicio.types';

// Cards
import WelcomeHeader from './components/WelcomeHeader';
import GeneralKpis from './components/GeneralKpis';
import RecentStockMini from './components/RecentStockMini';
import QuickShortcuts from './components/QuickShortcuts';

const InicioPage: React.FC = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Pequeno delay artificial para garantir transição suave se o banco for instantâneo
      const minDelay = new Promise(resolve => setTimeout(resolve, 800));

      try {
        const [s, r] = await Promise.all([
          InicioService.getDashboardStats(),
          InicioService.getRecentArrivals(),
          minDelay
        ]);
        setStats(s);
        setRecent(r);
      } catch (err) {
        console.error("Erro ao sincronizar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center -mt-20">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-8 text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">Sincronizando Nexus Core...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Card Identificação no Topo */}
      <WelcomeHeader />

      {/* 2. KPIs Gerais */}
      {stats && <GeneralKpis stats={stats} />}

      {/* 3. Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full">

        {/* Lado Esquerdo: Atividade Recente */}
        <div className="lg:col-span-8 min-h-[400px]">
          <RecentStockMini veiculos={recent} />
        </div>

        {/* Lado Direito: Atalhos de Sistema */}
        <div className="lg:col-span-4 min-h-[400px]">
          <QuickShortcuts />
        </div>

      </div>
    </div>
  );
};

export default InicioPage;
