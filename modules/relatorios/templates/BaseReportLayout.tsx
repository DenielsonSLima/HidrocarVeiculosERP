import React from 'react';

interface Props {
  empresa: any;
  watermark: any;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const BaseReportLayout: React.FC<Props> = ({ empresa, watermark, title, subtitle, children }) => {
  return (
    <div className="relative p-12 bg-white text-slate-900 min-h-[297mm] flex flex-col font-sans">
      {/* Marca d'água */}
      {watermark?.logo_url && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-10">
          <img 
            src={watermark.logo_url} 
            style={{ 
              opacity: watermark.opacidade / 100, 
              transform: `scale(${watermark.tamanho / 100})`,
              maxWidth: '60%'
            }} 
            alt="" 
          />
        </div>
      )}

      {/* Cabeçalho */}
      <header className="relative z-10 border-b-2 border-slate-900 pb-8 mb-10 flex justify-between items-end">
        <div className="flex items-center gap-6">
          {empresa?.logo_url && <img src={empresa.logo_url} className="h-16 w-auto object-contain" alt="Logo" />}
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">{empresa?.nome_fantasia || 'HCV Veículos'}</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{empresa?.razao_social}</p>
            <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase">CNPJ: {empresa?.cnpj} • {empresa?.cidade}/{empresa?.uf}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-indigo-600 leading-none">{title}</h2>
          {subtitle && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{subtitle}</p>}
          <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </header>

      {/* Conteúdo do Relatório */}
      <main className="relative z-10 flex-1">
        {children}
      </main>

      {/* Rodapé do Documento */}
      <footer className="relative z-10 mt-10 pt-6 border-t border-slate-100 flex justify-between items-end">
        <div className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Nexus Operating System • Protocolo Digital de Gestão
        </div>
        <div className="text-right">
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Página 1 de 1</p>
        </div>
      </footer>
    </div>
  );
};

export default BaseReportLayout;