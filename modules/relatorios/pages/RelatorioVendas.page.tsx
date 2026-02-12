import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RelatoriosQuickPreview from '../components/RelatoriosQuickPreview';
import VendasTemplate from '../templates/vendas/VendasTemplate';
import { EmpresaService } from '../../ajustes/empresa/empresa.service';
import { MarcaDaguaService } from '../../ajustes/marca-dagua/marca-dagua.service';

const RelatorioVendasPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [empresa, setEmpresa] = useState<any>(null);
  const [watermark, setWatermark] = useState<any>(null);

  // Mock de dados para o relatório (em um cenário real, viria do service com filtros)
  const reportData = {
    periodo: '01/05/2024 - 31/05/2024',
    totalVendas: 450000.00,
    ticketMedio: 150000.00,
    lucroBruto: 52000.00,
    margemMedia: 11.5,
    items: [
      { data: '12/05/2024', veiculo: 'Toyota Corolla XEI 2.0', cliente: 'João Silva', custo: 125000, venda: 142000, lucro: 17000 },
      { data: '15/05/2024', veiculo: 'Honda Civic Touring', cliente: 'Maria Oliveira', custo: 138000, venda: 155000, lucro: 17000 },
      { data: '22/05/2024', veiculo: 'Jeep Compass Limited', cliente: 'Carlos Santos', custo: 135000, venda: 153000, lucro: 18000 },
    ]
  };

  useEffect(() => {
    EmpresaService.getDadosEmpresa().then(setEmpresa);
    MarcaDaguaService.getConfig().then(setWatermark);
  }, []);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/relatorios')}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
        >
          <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
           <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Relatórios / Comercial</p>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Vendas Detalhadas</h1>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm min-h-[500px]">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 items-end">
            <div className="md:col-span-2">
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Período</label>
               <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                  <input type="date" className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold focus:ring-0 outline-none" />
                  <span className="text-slate-300 font-black text-[9px] uppercase">até</span>
                  <input type="date" className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold focus:ring-0 outline-none" />
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Vendedor</label>
               <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                  <option value="">Todos</option>
               </select>
            </div>
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               <span>Gerar Relatório</span>
            </button>
         </div>

         <div className="border-2 border-dashed border-slate-100 rounded-[2rem] py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">Aguardando seleção de filtros para processar dados</p>
         </div>
      </div>

      {/* QUICK PREVIEW MODAL */}
      <RelatoriosQuickPreview 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        title="Pré-visualização do Relatório"
      >
        <VendasTemplate 
          empresa={empresa} 
          watermark={watermark} 
          data={reportData} 
        />
      </RelatoriosQuickPreview>
    </div>
  );
};

export default RelatorioVendasPage;