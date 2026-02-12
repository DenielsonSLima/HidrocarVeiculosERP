
import React, { useState, useEffect } from 'react';
import { ISocio } from '../socios.types';

interface FormSocioProps {
  initialData?: ISocio | null;
  onSubmit: (data: Partial<ISocio>) => void;
  onCancel: () => void;
}

const FormSocio: React.FC<FormSocioProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ISocio>>({
    nome: '',
    cpf: '',
    telefone: '',
    ativo: true,
    patrimonio: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        cpf: formatCPF(initialData.cpf || '')
      });
    }
  }, [initialData]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos novamente (para o segundo bloco de números)
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
      .replace(/(-\d{2})\d+?$/, '$1'); // Impede que sejam digitados mais de 11 dígitos
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else if (name === 'telefone') {
      setFormData(prev => ({ ...prev, [name]: formatTelefone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cpf) {
      alert("Nome e CPF são obrigatórios.");
      return;
    }
    // Remove formatação ao enviar, se necessário pelo backend, ou envia formatado.
    // O Supabase geralmente aceita string, vamos enviar formatado para leitura fácil.
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 mb-8 shadow-xl animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
            {initialData ? 'Editar Sócio' : 'Novo Investidor'}
          </h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Cadastro simplificado para composição de cotas.
          </p>
        </div>
        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nome Completo</label>
            <input 
              type="text" 
              name="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800" 
              placeholder="Ex: João Silva"
              required 
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">CPF</label>
            <input 
              type="text" 
              name="cpf" 
              value={formData.cpf} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono font-bold tracking-wide" 
              placeholder="000.000.000-00" 
              maxLength={14}
              required 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Telefone (Opcional)</label>
            <input 
              type="text" 
              name="telefone" 
              value={formData.telefone} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              placeholder="(00) 00000-0000" 
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-8 py-4 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="px-10 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            {initialData ? 'Salvar Alterações' : 'Cadastrar Sócio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormSocio;
