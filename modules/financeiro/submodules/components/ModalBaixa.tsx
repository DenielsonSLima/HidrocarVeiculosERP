import React, { useState, useEffect } from 'react';
import { ITitulo } from '../../financeiro.types';
import { FinanceiroService } from '../../financeiro.service';
import { ContasBancariasService } from '../../../ajustes/contas-bancarias/contas.service';
import { FormasPagamentoService } from '../../../cadastros/formas-pagamento/formas-pagamento.service';

interface Props {
  titulo: ITitulo;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalBaixa: React.FC<Props> = ({ titulo, onClose, onSuccess }) => {
  const [contas, setContas] = useState<any[]>([]);
  const [formas, setFormas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [valorPago, setValorPago] = useState(titulo.valor_total - titulo.valor_pago);
  const [contaId, setContaId] = useState('');
  const [formaId, setFormaId] = useState('');

  useEffect(() => {
    async function loadData() {
      const [cData, fData] = await Promise.all([
        ContasBancariasService.getAll(),
        FormasPagamentoService.getAll()
      ]);
      setContas(cData.filter(c => c.ativo));
      setFormas(fData.filter(f => f.ativo));
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaId || !formaId || valorPago <= 0) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    setIsSaving(true);
    try {
      await FinanceiroService.baixarTitulo(titulo, valorPago, contaId, formaId);
      onSuccess();
    } catch (e: any) {
      alert("Erro ao processar baixa: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        <div className={`p-6 text-white ${titulo.tipo === 'PAGAR' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
           <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Confirmar Liquidação</p>
           <h3 className="text-xl font-black uppercase tracking-tighter mt-1">{titulo.descricao}</h3>
           <div className="mt-4 flex justify-between items-end">
              <div>
                <p className="text-[8px] font-black uppercase opacity-60">Saldo Devedor</p>
                <p className="text-lg font-black">{formatCurrency(titulo.valor_total - titulo.valor_pago)}</p>
              </div>
              <p className="text-[10px] font-black bg-black/20 px-2 py-1 rounded-lg">PARCELA {titulo.parcela_numero}/{titulo.parcela_total}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Quanto está sendo {titulo.tipo === 'PAGAR' ? 'pago' : 'recebido'}?</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                 <input 
                  type="number" 
                  step="0.01"
                  value={valorPago} 
                  onChange={e => setValorPago(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 pl-12 text-2xl font-black text-slate-800 outline-none focus:border-indigo-500 transition-all" 
                 />
              </div>
              {valorPago < (titulo.valor_total - titulo.valor_pago) && (
                <p className="text-[9px] text-amber-600 font-bold uppercase mt-2 ml-1">💡 Atenção: Baixa parcial detectada.</p>
              )}
           </div>

           <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Conta Bancária / Caixa</label>
                <select 
                  required
                  value={contaId} 
                  onChange={e => setContaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">Selecione a conta...</option>
                  {contas.map(c => <option key={c.id} value={c.id}>{c.banco_nome} - {c.conta}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Forma de Movimentação</label>
                <select 
                  required
                  value={formaId} 
                  onChange={e => setFormaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">Selecione a forma...</option>
                  {formas.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
           </div>

           <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-black text-xs uppercase bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">Cancelar</button>
              <button 
                type="submit" 
                disabled={isSaving}
                className={`flex-1 py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 ${
                  titulo.tipo === 'PAGAR' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSaving ? 'Processando...' : 'Confirmar Baixa'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBaixa;
