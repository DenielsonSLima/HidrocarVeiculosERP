
import React from 'react';
import { IVeiculo } from '../estoque.types';

interface Props {
  formData: Partial<IVeiculo>;
  onChange: (updates: Partial<IVeiculo>) => void;
}

const FormCardObservations: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in slide-in-from-bottom-6">
       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Notas & Observações Internas</h3>
       <textarea 
         value={formData.observacoes || ''} 
         onChange={e => onChange({ observacoes: e.target.value })} 
         rows={5} 
         className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
         placeholder="Relatório sobre pneus, lataria, revisões pendentes, etc..." 
       />
    </div>
  );
};

export default FormCardObservations;
