import React, { useState, useEffect } from 'react';
import { CaixaService } from './caixa.service';
import { ICaixaDashboardData, CaixaTab, IForecastMes } from './caixa.types';
import { EmpresaService } from '../ajustes/empresa/empresa.service';
import { MarcaDaguaService } from '../ajustes/marca-dagua/marca-dagua.service';

// Componentes
import CaixaKpis from './components/CaixaKpis';
import AccountsOverview from './components/AccountsOverview';
import SocioStockOverview from './components/SocioStockOverview';
import SocioInvestimentoCards from './components/SocioInvestimentoCards';
import MonthlyPerformance from './components/MonthlyPerformance';
import ForecastChart from './components/ForecastChart';
import QuickPreviewModal from './components/QuickPreviewModal';
import CaixaPrint from './components/CaixaPrint';

const CaixaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CaixaTab>('MES_ATUAL');
  const [data, setData] = useState<ICaixaDashboardData | null>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [watermark, setWatermark] = useState<any>(null);
  const [forecast, setForecast] = useState<IForecastMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      const [res, empRes, watRes, forecastRes] = await Promise.all([
        CaixaService.getDashboardData(activeTab === 'MES_ATUAL' ? 'atual' : 'anteriores'),
        EmpresaService.getDadosEmpresa(),
        MarcaDaguaService.getConfig(),
        CaixaService.getForecast()
      ]);
      setData(res);
      setEmpresa(empRes);
      setWatermark(watRes);
      setForecast(forecastRes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const formattedPeriod = activeTab === 'MES_ATUAL'
    ? `${new Date().toLocaleString('pt-BR', { month: 'long' })}/${new Date().getFullYear()}`
    : 'Períodos Anteriores';

  const handlePrint = () => {
    window.print();
  };

  const { entradasTotal, saidasTotal, transacoesEntrada, transacoesSaida } = React.useMemo(() => {
    if (!data?.transacoes) return { entradasTotal: 0, saidasTotal: 0, transacoesEntrada: [], transacoesSaida: [] };

    const entradas = data.transacoes.filter(t => t.tipo === 'ENTRADA');
    const saidas = data.transacoes.filter(t => t.tipo === 'SAIDA');

    return {
      transacoesEntrada: entradas,
      transacoesSaida: saidas,
      entradasTotal: entradas.reduce((acc, t) => acc + (t.valor || 0), 0),
      saidasTotal: saidas.reduce((acc, t) => acc + (t.valor || 0), 0)
    };
  }, [data?.transacoes]);

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Fluxo de Caixa & Patrimônio</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Consolidação de ativos, passivos e lucros</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPreview(true)}
            disabled={loading || !data}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            <span>Relatório PDF</span>
          </button>

          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('MES_ATUAL')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MES_ATUAL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mês Atual
            </button>
            <button
              onClick={() => setActiveTab('ANTERIORES')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ANTERIORES' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Anterior (Acumulado)
            </button>
          </div>
        </div>
      </div>

      {data && (
        <>
          <CaixaKpis data={data} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SocioStockOverview socios={data.investimento_socios} />
            </div>
            <div className="space-y-6">
              <AccountsOverview contas={data.contas} />
            </div>
          </div>

          <SocioInvestimentoCards socios={data.investimento_socios} />

          <MonthlyPerformance
            vendas={data.total_vendas}
            compras={data.total_compras}
            lucro={data.lucro_mensal}
          />

          <ForecastChart forecast={forecast} />

          {/* MOVIMENTAÇÕES SEPARADAS POR TIPO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ENTRADAS */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden h-fit">
              <div className="px-5 py-3 border-b border-emerald-100 bg-emerald-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <h3 className="font-bold text-emerald-900 text-sm">Entradas (Crédito)</h3>
                </div>
                <span className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entradasTotal)}
                </span>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-slate-500">Data/Desc</th>
                      <th className="px-4 py-2 font-semibold text-slate-500 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {transacoesEntrada.map((t) => (
                      <tr key={t.id} className="hover:bg-emerald-50/30">
                        <td className="px-4 py-2 text-slate-600">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{t.descricao || 'Sem descrição'}</span>
                            <span className="text-[10px] text-slate-400">{new Date(t.data_pagamento).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 font-bold text-right text-emerald-600">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}
                        </td>
                      </tr>
                    ))}
                    {transacoesEntrada.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-slate-400 italic text-xs">
                          Nenhuma entrada registrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SAÍDAS */}
            <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden h-fit">
              <div className="px-5 py-3 border-b border-rose-100 bg-rose-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                  <h3 className="font-bold text-rose-900 text-sm">Saídas (Débito)</h3>
                </div>
                <span className="text-[10px] font-black text-rose-600/50 uppercase tracking-widest">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saidasTotal)}
                </span>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-slate-500">Data/Desc</th>
                      <th className="px-4 py-2 font-semibold text-slate-500 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {transacoesSaida.map((t) => (
                      <tr key={t.id} className="hover:bg-rose-50/30">
                        <td className="px-4 py-2 text-slate-600">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{t.descricao || 'Sem descrição'}</span>
                            <span className="text-[10px] text-slate-400">{new Date(t.data_pagamento).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 font-bold text-right text-rose-600">
                          -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}
                        </td>
                      </tr>
                    ))}
                    {transacoesSaida.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-slate-400 italic text-xs">
                          Nenhuma saída registrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          <QuickPreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            onDownload={handlePrint}
            title="Relatório Financeiro"
          >
            <CaixaPrint
              data={data}
              empresa={empresa}
              watermark={watermark}
              periodo={formattedPeriod}
              forecast={forecast}
            />
          </QuickPreviewModal>

          <div className="hidden print:block">
            <CaixaPrint
              data={data}
              empresa={empresa}
              watermark={watermark}
              periodo={formattedPeriod}
              forecast={forecast}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CaixaPage;
