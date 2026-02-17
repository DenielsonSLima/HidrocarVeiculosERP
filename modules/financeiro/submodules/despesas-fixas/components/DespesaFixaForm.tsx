
import React, { useState, useEffect } from 'react';
import { FinanceiroService } from '../../../financeiro.service';
import { DespesasFixasService } from '../despesas-fixas.service';
import { ICategoriaFinanceira } from '../../../financeiro.types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const DespesaFixaForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [categorias, setCategorias] = useState<ICategoriaFinanceira[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [valorFormatado, setValorFormatado] = useState('R$ 0,00');

  const [formData, setFormData] = useState({
    data_vencimento: new Date().toISOString().split('T')[0],
    descricao: '',
    valor_total: 0,
    categoria_id: '',
    documento_ref: '',
  });

  useEffect(() => {
    FinanceiroService.getCategorias().then(data => {
      setCategorias(data.filter(c => c.tipo === 'FIXA'));
    });
  }, []);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    const numericValue = Number(value) / 100;
    setValorFormatado(
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue)
    );
    setFormData(prev => ({ ...prev, valor_total: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria_id || formData.valor_total <= 0 || !formData.descricao) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      await DespesasFixasService.save(formData);
      onSuccess();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-slate-100">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 bg-slate-900 text-white">
          <h3 className="text-xl font-black uppercase tracking-tighter">Lançar Custo Fixo</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
            Custos recorrentes e manutenção estrutural
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Data + Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={formData.data_vencimento}
                onChange={e => setFormData({ ...formData, data_vencimento: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
                Valor
              </label>
              <input
                type="text"
                value={valorFormatado}
                onChange={handleCurrencyChange}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3.5 text-lg font-black text-slate-800 outline-none focus:border-slate-500 text-center"
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
              Categoria
            </label>
            <select
              required
              value={formData.categoria_id}
              onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Selecione a categoria...</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
              Descrição / Motivo
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Aluguel, Internet, Contador, Seguros..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>

          {/* Documento Referência */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
              Documento / Referência <span className="text-slate-300">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.documento_ref}
              onChange={e => setFormData({ ...formData, documento_ref: e.target.value })}
              placeholder="Ex: NF-1234, Boleto-5678..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-slate-500 font-black text-xs uppercase bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center"
            >
              {isSaving ? 'Gravando...' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DespesaFixaForm;
