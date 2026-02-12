import React from 'react';
import { ITitulo } from '../../financeiro.types';

interface Props {
  titulo: ITitulo;
  onPagar: () => void;
}

const TituloCard: React.FC<Props> = ({ titulo, onPagar }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

  const progresso = (titulo.valor_pago / titulo.valor_total) * 100;
  const isPagar = titulo.tipo === 'PAGAR';

  return (
    <div className={`bg-white border rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${titulo.status === 'PAGO' ? 'border-emerald-100 opacity-75' : 'border-slate-200'}`}>
      
      {/* Indicador de Status lateral */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
        titulo.status === 'PAGO' ? 'bg-emerald-500' : 
        titulo.status === 'PARCIAL' ? 'bg-amber-400' :
        titulo.status === 'ATRASADO' ? 'bg-rose-500' : 'bg-slate-300'
      }`}></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{titulo.categoria?.nome || 'Diversos'} • {titulo.parcela_numero}/{titulo.parcela_total}</p>
          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter truncate max-w-[180px]">{titulo.descricao}</h4>
        </div>
        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
           titulo.status === 'PAGO' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {titulo.status}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">Vencimento</p>
              <p className="text-sm font-bold text-slate-700">{formatDate(titulo.data_vencimento)}</p>
           </div>
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase">Valor Total</p>
              <p className={`text-xl font-black ${isPagar ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(titulo.valor_total)}
              </p>
           </div>
        </div>

        {/* Barra de Progresso Parcial */}
        {titulo.status === 'PARCIAL' && (
          <div className="space-y-1.5">
             <div className="flex justify-between text-[8px] font-black uppercase">
                <span className="text-slate-400">Saldo Pago</span>
                <span className="text-amber-600">{formatCurrency(titulo.valor_pago)} ({progresso.toFixed(0)}%)</span>
             </div>
             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${progresso}%` }}></div>
             </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
           <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[140px]">
             {titulo.parceiro?.nome || 'Consumidor Final'}
           </p>
           
           {titulo.status !== 'PAGO' && (
             <button 
               onClick={onPagar}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 isPagar ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
               }`}
             >
               {isPagar ? 'Pagar' : 'Receber'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default TituloCard;
