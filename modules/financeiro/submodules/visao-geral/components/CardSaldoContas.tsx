import React from 'react';

const CardSaldoContas: React.FC = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm h-full">
      <div className="flex justify-between items-center mb-8">
         <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Disponibilidade por Carteira</h3>
         <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Gerenciar Contas</button>
      </div>

      <div className="space-y-4">
         {[
           { banco: 'Itaú Unibanco', conta: 'Ag 0001 CC 12345-6', saldo: 45200.50, cor: 'orange-500' },
           { banco: 'Banco do Brasil', conta: 'Ag 1234 CC 98765-4', saldo: 12800.00, cor: 'yellow-400' },
           { banco: 'Caixa Interno (Espécie)', conta: 'Cofre Principal', saldo: 3450.00, cor: 'emerald-500' }
         ].map((item, i) => (
           <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all group">
              <div className="flex items-center space-x-4">
                 <div className={`w-2 h-10 rounded-full bg-${item.cor}`}></div>
                 <div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{item.banco}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{item.conta}</p>
                 </div>
              </div>
              <p className="text-lg font-black text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.saldo)}
              </p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default CardSaldoContas;
