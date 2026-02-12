import React from 'react';
import BaseReportLayout from '../BaseReportLayout';

interface Props {
  empresa: any;
  watermark: any;
  data: any;
}

const AuditoriaTemplate: React.FC<Props> = ({ empresa, watermark, data }) => {
  return (
    <BaseReportLayout 
      empresa={empresa} 
      watermark={watermark} 
      title="Relatório de Auditoria de Sistema"
      subtitle="Trilha de Ações e Modificações"
    >
      <div className="space-y-6">
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-6">
           <p className="text-xs text-amber-800 font-medium leading-relaxed italic">
             "Este documento contém o histórico detalhado de operações críticas realizadas no sistema no período selecionado."
           </p>
        </div>

        <div className="space-y-4">
           {(data.items || []).map((item: any, i: number) => (
             <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-slate-900 mt-2 shrink-0"></div>
                <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-black uppercase text-slate-900">{item.acao}</p>
                      <span className="text-[9px] font-mono text-slate-400">{item.data} - {item.hora}</span>
                   </div>
                   <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                      Efetuado por <span className="font-bold text-slate-900">{item.usuario}</span> no registro <span className="font-bold">{item.referencia}</span>.
                   </p>
                   {item.detalhes && (
                     <div className="mt-2 p-2 bg-white rounded border border-slate-100 text-[8px] font-mono text-slate-400">
                        {item.detalhes}
                     </div>
                   )}
                </div>
             </div>
           ))}
        </div>
      </div>
    </BaseReportLayout>
  );
};

export default AuditoriaTemplate;