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
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Eventos</p>
              <p className="text-lg font-black text-slate-900">{data.totalEventos || 0}</p>
           </div>
           <div className="bg-rose-50 p-4 rounded-xl border border-rose-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Eventos Críticos</p>
              <p className="text-lg font-black text-rose-700">{data.criticos || 0}</p>
           </div>
           <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Informativos</p>
              <p className="text-lg font-black text-emerald-700">{data.informativos || 0}</p>
           </div>
        </div>

        {/* Aviso Legal */}
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
           <p className="text-[9px] text-amber-800 font-medium leading-relaxed italic">
             "Este documento contém o histórico detalhado de operações críticas realizadas no sistema. Todos os registros são imutáveis e rastreáveis."
           </p>
        </div>

        {/* Timeline de Eventos */}
        <div className="space-y-3">
           {(data.items || []).map((item: any, i: number) => (
             <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  item.nivel === 'CRITICAL' || item.nivel === 'ERROR' ? 'bg-rose-500' : 
                  item.nivel === 'WARNING' ? 'bg-amber-500' : 'bg-slate-400'
                }`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-[10px] font-black uppercase text-slate-900 truncate">{item.acao}</p>
                        {(item.nivel === 'CRITICAL' || item.nivel === 'ERROR') && (
                          <span className="text-[7px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>{item.nivel}</span>
                        )}
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 shrink-0">{item.data} - {item.hora}</span>
                   </div>
                   <p className="text-[9px] text-slate-600 leading-relaxed font-medium">
                      Efetuado por <span className="font-bold text-slate-900">{item.usuario}</span> no registro <span className="font-bold">{item.referencia}</span>.
                   </p>
                   {item.detalhes && (
                     <div className="mt-2 p-2 bg-white rounded border border-slate-100 text-[8px] font-mono text-slate-400 break-all">
                        {typeof item.detalhes === 'object' ? JSON.stringify(item.detalhes, null, 2).substring(0, 200) : String(item.detalhes).substring(0, 200)}
                     </div>
                   )}
                </div>
             </div>
           ))}
           {(data.items || []).length === 0 && (
             <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl">
               <p className="text-[9px] text-slate-400 font-bold uppercase">Nenhum evento encontrado no período</p>
             </div>
           )}
        </div>
      </div>
    </BaseReportLayout>
  );
};

export default AuditoriaTemplate;