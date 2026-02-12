
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IVeiculo, IVeiculoFoto } from './estoque.types';
import PhotoUpload from './components/PhotoUpload';

// Services
import { MontadorasService } from '../cadastros/montadoras/montadoras.service';
import { TiposVeiculosService } from '../cadastros/tipos-veiculos/tipos-veiculos.service';
import { ModelosService } from '../cadastros/modelos/modelos.service';
import { VersoesService } from '../cadastros/versoes/versoes.service';
import { CoresService } from '../cadastros/cores/cores.service';
import { CombustivelService } from '../cadastros/combustivel/combustivel.service';
import { TransmissaoService } from '../cadastros/transmissao/transmissao.service';
import { CaracteristicasService } from '../cadastros/caracteristicas/caracteristicas.service';
import { OpcionaisService } from '../cadastros/opcionais/opcionais.service';

// Tipos Auxiliares
import { IMontadora } from '../cadastros/montadoras/montadoras.types';
import { ITipoVeiculo } from '../cadastros/tipos-veiculos/tipos-veiculos.types';
import { IModelo } from '../cadastros/modelos/modelos.types';
import { IVersao } from '../cadastros/versoes/versoes.types';
import { ICor } from '../cadastros/cores/cores.types';
import { ICombustivel } from '../cadastros/combustivel/combustivel.types';
import { ITransmissao } from '../cadastros/transmissao/transmissao.types';
import { ICaracteristica } from '../cadastros/caracteristicas/caracteristicas.types';
import { IOpcional } from '../cadastros/opcionais/opcionais.types';

const EstoqueFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Data States
  const [montadoras, setMontadoras] = useState<IMontadora[]>([]);
  const [tipos, setTipos] = useState<ITipoVeiculo[]>([]);
  const [modelos, setModelos] = useState<IModelo[]>([]);
  const [versoes, setVersoes] = useState<IVersao[]>([]);
  const [cores, setCores] = useState<ICor[]>([]);
  const [combustiveis, setCombustiveis] = useState<ICombustivel[]>([]);
  const [transmissoes, setTransmissoes] = useState<ITransmissao[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<ICaracteristica[]>([]);
  const [opcionais, setOpcionais] = useState<IOpcional[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<IVeiculo>>({
    status: 'PREPARACAO',
    fotos: [],
    km: 0,
    portas: 4,
    valor_custo: 0,
    valor_venda: 0,
    caracteristicas_ids: [],
    opcionais_ids: [],
    placa: '',
    chassi: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false); // Global Loading (Initial)
  const [isSaving, setIsSaving] = useState(false);

  // Initial Load
  useEffect(() => {
    async function loadAuxData() {
      setLoading(true);
      try {
        const [m, t, c, comb, trans, car, op] = await Promise.all([
          MontadorasService.getAll(),
          TiposVeiculosService.getAll(),
          CoresService.getAll(),
          CombustivelService.getAll(),
          TransmissaoService.getAll(),
          CaracteristicasService.getAll(),
          OpcionaisService.getAll()
        ]);
        setMontadoras(m);
        setTipos(t);
        setCores(c);
        setCombustiveis(comb);
        setTransmissoes(trans);
        setCaracteristicas(car);
        setOpcionais(op);
      } finally {
        setLoading(false);
      }
    }
    loadAuxData();
  }, []);

  // Cascading: Carregar Modelos quando Montadora ou Tipo mudar
  useEffect(() => {
    if (formData.montadora_id && formData.tipo_veiculo_id) {
      ModelosService.getAll().then(allModelos => {
        // Filtragem no front pois o service retorna tudo (poderia ser otimizado no backend)
        const filtered = allModelos.filter(mod => 
          mod.montadora_id === formData.montadora_id && 
          mod.tipo_veiculo_id === formData.tipo_veiculo_id
        );
        setModelos(filtered);
      });
    } else {
      setModelos([]);
    }
  }, [formData.montadora_id, formData.tipo_veiculo_id]);

  // Cascading: Carregar Versões quando Modelo mudar
  useEffect(() => {
    if (formData.modelo_id) {
      VersoesService.getByModelo(formData.modelo_id).then(data => setVersoes(data));
    } else {
      setVersoes([]);
    }
  }, [formData.modelo_id]);

  // Auto-fill ao selecionar Versão
  const handleVersaoSelect = (versaoId: string) => {
    const versao = versoes.find(v => v.id === versaoId);
    if (versao) {
      setFormData(prev => ({
        ...prev,
        versao_id: versaoId,
        ano_modelo: versao.ano_modelo,
        ano_fabricacao: versao.ano_fabricacao,
        motorizacao: versao.motorizacao,
        combustivel: versao.combustivel, // Pre-select
        transmissao: versao.transmissao, // Pre-select
        nome_versao_comercial: versao.nome // Campo auxiliar visual
      }));
    } else {
      setFormData(prev => ({ ...prev, versao_id: versaoId }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Input Mask helpers
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    setFormData(prev => ({ ...prev, placa: val }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'valor_custo' | 'valor_venda') => {
    const val = Number(e.target.value.replace(/\D/g, '')) / 100;
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const toggleArrayItem = (id: string, field: 'caracteristicas_ids' | 'opcionais_ids') => {
    setFormData(prev => {
      const list = prev[field] || [];
      const exists = list.includes(id);
      return {
        ...prev,
        [field]: exists ? list.filter(i => i !== id) : [...list, id]
      };
    });
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.montadora_id || !formData.modelo_id || !formData.placa) {
      alert("Preencha os campos obrigatórios (Montadora, Modelo, Placa).");
      return;
    }

    setIsSaving(true);
    try {
      // Simulação de save
      console.log('Salvando Veículo:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      // await EstoqueService.save(formData);
      navigate('/estoque');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar veículo');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-in slide-in-from-bottom-8 duration-500">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/estoque')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {id ? 'Editar Veículo' : 'Novo Veículo'}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cadastro de Estoque</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/estoque')} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
          <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center disabled:opacity-50">
            {isSaving ? 'Salvando...' : 'Salvar Veículo'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Coluna Principal */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* 1. Galeria de Fotos */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center">
                <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-3 text-sm">01</span>
                Galeria de Fotos
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Máx. 8 Fotos</span>
            </div>
            <PhotoUpload 
              fotos={formData.fotos || []} 
              onChange={(newFotos) => setFormData(prev => ({ ...prev, fotos: newFotos }))} 
            />
          </div>

          {/* 2. Dados do Veículo (Cascata) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center mb-8">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-3 text-sm">02</span>
              Identificação do Veículo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">1. Montadora</label>
                <select 
                  name="montadora_id"
                  value={formData.montadora_id}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {montadoras.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">2. Tipo</label>
                <select 
                  name="tipo_veiculo_id"
                  value={formData.tipo_veiculo_id}
                  onChange={handleChange}
                  disabled={!formData.montadora_id}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">3. Modelo</label>
                <select 
                  name="modelo_id"
                  value={formData.modelo_id}
                  onChange={handleChange}
                  disabled={!formData.tipo_veiculo_id}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">4. Versão</label>
                <select 
                  name="versao_id"
                  value={formData.versao_id}
                  onChange={(e) => handleVersaoSelect(e.target.value)}
                  disabled={!formData.modelo_id}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {versoes.map(v => <option key={v.id} value={v.id}>{v.nome} ({v.ano_modelo})</option>)}
                </select>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Ano Fab.</label>
                 <input type="number" name="ano_fabricacao" value={formData.ano_fabricacao || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="AAAA" />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Ano Mod.</label>
                 <input type="number" name="ano_modelo" value={formData.ano_modelo || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="AAAA" />
               </div>
               <div className="col-span-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">KM Atual</label>
                 <div className="relative">
                   <input type="number" name="km" value={formData.km} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-4 text-right font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
                   <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">km</span>
                 </div>
               </div>
            </div>
          </div>

          {/* 3. Documentação e Valores */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center mb-8">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-3 text-sm">03</span>
              Dados & Valores
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Placa Mercosul Style */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Identificação</label>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-4 bg-blue-700 rounded-t-lg flex items-center justify-between px-2">
                       <span className="text-[6px] font-bold text-white">BRASIL</span>
                       <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/2000px-Flag_of_Brazil.svg.png" className="h-2.5 w-3.5 rounded-[1px]" alt="BR" />
                    </div>
                    <input 
                      type="text" 
                      value={formData.placa} 
                      onChange={handlePlacaChange}
                      maxLength={7}
                      className="w-full bg-white border-2 border-slate-800 rounded-lg pt-6 pb-2 text-center text-4xl font-black uppercase tracking-widest text-slate-800 focus:ring-4 focus:ring-blue-500/20 outline-none font-mono"
                      placeholder="ABC1D23"
                    />
                  </div>
                  
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-bold">CHASSI</span>
                    <input 
                      type="text" 
                      name="chassi"
                      value={formData.chassi}
                      onChange={handleChange}
                      maxLength={17}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-16 pr-4 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="17 dígitos..."
                    />
                  </div>
                </div>
              </div>

              {/* Financeiro */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Valor de Custo (Compra + Reparos)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="text" 
                      value={formatCurrency(formData.valor_custo).replace('R$', '').trim()}
                      onChange={(e) => handleCurrencyChange(e, 'valor_custo')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pl-12 text-lg font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest ml-1">Preço de Venda (Anúncio)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">R$</span>
                    <input 
                      type="text" 
                      value={formatCurrency(formData.valor_venda).replace('R$', '').trim()}
                      onChange={(e) => handleCurrencyChange(e, 'valor_venda')}
                      className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 pl-12 text-2xl font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Coluna Lateral Direita */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Detalhes Técnicos */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6">Ficha Técnica</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {cores.map(cor => (
                    <button
                      key={cor.id}
                      onClick={() => setFormData(prev => ({ ...prev, cor_id: cor.id }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${formData.cor_id === cor.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'border-slate-100 hover:scale-105'}`}
                      style={{ backgroundColor: cor.rgb_hex }}
                      title={cor.nome}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Câmbio</label>
                <select name="transmissao" value={formData.transmissao} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Selecione...</option>
                  {transmissoes.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Combustível</label>
                <select name="combustivel" value={formData.combustivel} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Selecione...</option>
                  {combustiveis.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Portas</label>
                <div className="flex bg-slate-50 rounded-xl p-1">
                  {[2, 3, 4, 5].map(p => (
                    <button 
                      key={p}
                      onClick={() => setFormData(prev => ({ ...prev, portas: p }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${formData.portas === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {p}P
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Características e Opcionais (Accordions ou Listas Compactas) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-8">
            
            {/* Características */}
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                Características
                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[9px]">{formData.caracteristicas_ids?.length || 0}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {caracteristicas.map(item => {
                  const isSelected = formData.caracteristicas_ids?.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleArrayItem(item.id, 'caracteristicas_ids')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {item.nome}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* Opcionais */}
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                Opcionais
                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px]">{formData.opcionais_ids?.length || 0}</span>
              </h3>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {opcionais.map(item => {
                  const isSelected = formData.opcionais_ids?.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleArrayItem(item.id, 'opcionais_ids')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        isSelected 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {item.nome}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Observações */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Notas Internas</h3>
            <textarea 
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Detalhes sobre estado de conservação, reparos necessários, etc."
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default EstoqueFormPage;
