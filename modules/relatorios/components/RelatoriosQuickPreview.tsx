import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const RelatoriosQuickPreview: React.FC<Props> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex flex-col no-print animate-in fade-in duration-300">
      {/* Toolbar superior */}
      <div className="h-20 bg-slate-900 border-b border-white/10 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center space-x-4">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <div>
              <h3 className="text-white font-black uppercase text-sm tracking-widest">{title}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Documento Gerado pelo Sistema</p>
           </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Baixar PDF / Imprimir</span>
          </button>
          
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Área do Documento */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-slate-800/50">
        <div className="bg-white shadow-2xl rounded-sm w-full max-w-[210mm] min-h-[297mm] transform origin-top scale-95 md:scale-100 transition-transform">
           <div id="print-content">
             {children}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosQuickPreview;