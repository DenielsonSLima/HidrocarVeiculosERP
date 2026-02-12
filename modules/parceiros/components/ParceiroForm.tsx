
import React, { useState, useEffect } from 'react';
import { IParceiro, TipoParceiro, PessoaTipo } from '../parceiros.types';
import { ParceirosService } from '../parceiros.service';

interface FormProps {
  initialData: IParceiro | null;
  onClose: () => void;
  onSubmit: (data: Partial<IParceiro>) => void;
}

const ParceiroForm: React.FC<FormProps> = ({ initialData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<IParceiro>>({
    pessoa_tipo: PessoaTipo.JURIDICA,
    nome: '',
    documento: '',
    tipo: TipoParceiro.CLIENTE,
    ativo: true,
    email: '',
    telefone: '',
    whatsapp: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    ...initialData
  });

  const [isConsulting, setIsConsulting] = useState(false);

  // Formata o documento ao carregar dados iniciais
  useEffect(() => {
    if (initialData?.documento) {
      setFormData(prev => ({
        ...prev,
        documento: formatDocumento(initialData.documento!, initialData.pessoa_tipo)
      }));
    }
  }, [initialData]);

  const formatDocumento = (value: string, tipo: PessoaTipo) => {
    const v = value.replace(/\D/g, '');
    
    if (tipo === PessoaTipo.FISICA) {
      // CPF: 000.000.000-00
      return v
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      // CNPJ: 00.000.000/0000-00
      return v
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (name === 'documento') {
      val = formatDocumento(val as string, formData.pessoa_tipo || PessoaTipo.JURIDICA);
    }

    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleTypeChange = (newType: PessoaTipo) => {
    setFormData(prev => ({ 
      ...prev, 
      pessoa_tipo: newType, 
      documento: '' // Limpa o documento para evitar máscaras incorretas
    }));
  };

  const handleCnpjLookup = async () => {
    const cleanCnpj = formData.documento?.replace(/\D/g, '');
    if (cleanCnpj?.length !== 14) {
      alert('Por favor, insira um CNPJ válido com 14 dígitos.');
      return;
    }

    setIsConsulting(true);
    const data = await ParceirosService.consultarCNPJ(cleanCnpj);
    if (data) {
      setFormData(prev => ({
        ...prev,
        nome: data.nome_fantasia || data.razao_social,
        razao_social: data.razao_social,
        email: data.email,
        telefone: data.ddd_telefone_1,
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.municipio,
        uf: data.uf
      }));
    } else {
      alert('Não foi possível encontrar dados para este CNPJ.');
    }
    setIsConsulting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {initialData ? 'Editar Parceiro' : 'Novo Parceiro'}
              </h2>
              <p className="text-slate-500 text-xs">Configure os dados de identificação e localização.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all text-slate-400 hover:text-rose-500 shadow-sm border border-transparent hover:border-slate-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="flex-1 overflow-y-auto p-10 space-y-10">
          {/* Tipo de Pessoa Toggle */}
          <div className="flex justify-center">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full max-w-sm">
              <button
                type="button"
                onClick={() => handleTypeChange(PessoaTipo.FISICA)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  formData.pessoa_tipo === PessoaTipo.FISICA 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Pessoa Física
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(PessoaTipo.JURIDICA)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  formData.pessoa_tipo === PessoaTipo.JURIDICA 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Pessoa Jurídica
              </button>
            </div>
          </div>

          {/* Seção Identificação */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center">
              <span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center mr-2 text-indigo-400">01</span>
              Dados de Identificação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">
                  {formData.pessoa_tipo === PessoaTipo.FISICA ? 'CPF' : 'CNPJ'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    maxLength={formData.pessoa_tipo === PessoaTipo.FISICA ? 14 : 18}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono font-bold"
                    placeholder={formData.pessoa_tipo === PessoaTipo.FISICA ? "000.000.000-00" : "00.000.000/0000-00"}
                  />
                  {formData.pessoa_tipo === PessoaTipo.JURIDICA && (
                    <button 
                      type="button"
                      onClick={handleCnpjLookup}
                      disabled={isConsulting || (formData.documento?.length || 0) < 14}
                      className="px-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 flex items-center justify-center"
                      title="Consultar Dados"
                    >
                      {isConsulting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-8">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">
                  {formData.pessoa_tipo === PessoaTipo.FISICA ? 'Nome Completo' : 'Nome Fantasia'}
                </label>
                <input 
                  type="text" 
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                />
              </div>

              {formData.pessoa_tipo === PessoaTipo.JURIDICA && (
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Razão Social</label>
                  <input 
                    type="text" 
                    name="razao_social"
                    value={formData.razao_social}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              )}

              <div className="md:col-span-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Perfil do Parceiro</label>
                <select 
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold appearance-none"
                >
                  <option value={TipoParceiro.CLIENTE}>Cliente</option>
                  <option value={TipoParceiro.FORNECEDOR}>Fornecedor</option>
                  <option value={TipoParceiro.AMBOS}>Cliente e Fornecedor (Ambos)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Seção Contato */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center">
              <span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center mr-2 text-indigo-400">02</span>
              Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">E-mail</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Telefone Fixo</label>
                <input 
                  type="text" 
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">WhatsApp</label>
                <input 
                  type="text" 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-700"
                />
              </div>
            </div>
          </section>

          {/* Seção Endereço */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center">
              <span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center mr-2 text-indigo-400">03</span>
              Localização
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">CEP</label>
                <input type="text" name="cep" value={formData.cep} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="00000-000" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Logradouro / Rua</label>
                <input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Número</label>
                <input type="text" name="numero" value={formData.numero} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">UF</label>
                <input type="text" name="uf" value={formData.uf} onChange={handleChange} maxLength={2} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase text-center font-bold" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Bairro</label>
                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Cidade</label>
                <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Complemento</label>
                <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-8 py-4 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            onClick={(e) => { e.preventDefault(); onSubmit(formData); }}
            className="px-12 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            Salvar Parceiro
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParceiroForm;
