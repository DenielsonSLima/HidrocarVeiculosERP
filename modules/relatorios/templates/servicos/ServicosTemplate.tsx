import React from 'react';
import BaseReportLayout from '../BaseReportLayout';

interface Props {
  empresa: any;
  watermark: any;
  data: any;
}

const ServicosTemplate: React.FC<Props> = ({ empresa, watermark, data }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <BaseReportLayout 
      empresa={empresa} 
      watermark={watermark} 
      title="Relatório de Gastos com Serviços"
      subtitle="Custos de Manutenção e Preparação de Veículos"
    >
      <div className="space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Veículos Analisados</p>
              <p className="text-lg font-black text-slate-900">{data.totalVeiculos || 0}</p>
           </div>
           <div className="bg-amber-50 p-4 rounded-xl border border-amber-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Total Despesas</p>
              <p className="text-lg font-black text-amber-700">{data.totalDespesas || 0}</p>
           </div>
           <div className="bg-rose-50 p-4 rounded-xl border border-rose-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Custo Total Serviços</p>
              <p className="text-lg font-black text-rose-700">{formatCur(data.custoTotalServicos || 0)}</p>
           </div>
           <div className="bg-slate-900 p-4 rounded-xl text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Custo Médio / Veículo</p>
              <p className="text-lg font-black">{formatCur(data.custoMedio || 0)}</p>
           </div>
        </div>

        {/* Visão por Status de Pagamento */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Despesas Pagas</p>
                  <p className="text-[7px] font-bold text-emerald-500">{data.despesasPagas || 0} lançamentos</p>
                </div>
                <p className="text-base font-black text-emerald-700">{formatCur(data.totalPago || 0)}</p>
              </div>
           </div>
           <div className="bg-amber-50 p-4 rounded-xl border border-amber-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Despesas Pendentes</p>
                  <p className="text-[7px] font-bold text-amber-500">{data.despesasPendentes || 0} lançamentos</p>
                </div>
                <p className="text-base font-black text-amber-700">{formatCur(data.totalPendente || 0)}</p>
              </div>
           </div>
        </div>

        {/* Detalhamento por Veículo */}
        {(data.veiculos || []).map((veiculo: any, idx: number) => (
          <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden break-inside-avoid">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-black text-[9px] rounded-lg" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-[10px] font-[900] uppercase text-slate-800">{veiculo.modelo}</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                    Placa: {veiculo.placa} • {veiculo.despesas?.length || 0} serviço{(veiculo.despesas?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-slate-400 uppercase">Custo Serviços</p>
                <p className="text-xs font-[900] text-rose-600">{formatCur(veiculo.custoServicos || 0)}</p>
              </div>
            </div>

            {(veiculo.despesas || []).length > 0 ? (
              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-white">
                    <th className="px-3 py-2 font-black uppercase text-slate-400 text-[8px]">Data</th>
                    <th className="px-3 py-2 font-black uppercase text-slate-400 text-[8px]">Descrição</th>
                    <th className="px-3 py-2 font-black uppercase text-slate-400 text-[8px]">Categoria</th>
                    <th className="px-3 py-2 font-black uppercase text-slate-400 text-[8px]">Status</th>
                    <th className="px-3 py-2 font-black uppercase text-slate-400 text-[8px] text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(veiculo.despesas || []).map((d: any, di: number) => (
                    <tr key={di}>
                      <td className="px-3 py-1.5">{d.data}</td>
                      <td className="px-3 py-1.5 font-bold uppercase text-slate-700">{d.descricao}</td>
                      <td className="px-3 py-1.5 text-slate-500">{d.categoria}</td>
                      <td className="px-3 py-1.5">
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                          d.status === 'PAGO' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>{d.status}</span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-black text-slate-900">{formatCur(d.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-3 text-center">
                <p className="text-[9px] text-slate-300 italic uppercase">Sem despesas registradas</p>
              </div>
            )}
          </div>
        ))}

        {(data.veiculos || []).length === 0 && (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Nenhum veículo com serviços encontrado</p>
          </div>
        )}
      </div>
    </BaseReportLayout>
  );
};

export default ServicosTemplate;
