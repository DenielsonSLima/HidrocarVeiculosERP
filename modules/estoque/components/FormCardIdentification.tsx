
import React, { useState, useEffect } from 'react';
import { IVeiculo } from '../estoque.types';
import { MontadorasService } from '../../cadastros/montadoras/montadoras.service';
import { TiposVeiculosService } from '../../cadastros/tipos-veiculos/tipos-veiculos.service';
import { ModelosService } from '../../cadastros/modelos/modelos.service';
import { VersoesService } from '../../cadastros/versoes/versoes.service';
import { IMontadora } from '../../cadastros/montadoras/montadoras.types';
import { ITipoVeiculo } from '../../cadastros/tipos-veiculos/tipos-veiculos.types';
import { IModelo } from '../../cadastros/modelos/modelos.types';
import { IVersao } from '../../cadastros/versoes/versoes.types';

interface Props {
  formData: Partial<IVeiculo>;
  onChange: (updates: Partial<IVeiculo>) => void;
}

const FormCardIdentification: React.FC<Props> = ({ formData, onChange }) => {
  const [montadoras, setMontadoras] = useState<IMontadora[]>([]);
  const [tipos, setTipos] = useState<ITipoVeiculo[]>([]);
  const [modelos, setModelos] = useState<IModelo[]>([]);
  const [versoes, setVersoes] = useState<IVersao[]>([]);

  useEffect(() => {
    Promise.all([MontadorasService.getAll(), TiposVeiculosService.getAll()])
      .then(([m, t]) => {
        setMontadoras(m);
        setTipos(t);
      });
  }, []);

  useEffect(() => {
    if (formData.montadora_id && formData.tipo_veiculo_id) {
      ModelosService.getByMontadoraAndTipo(formData.montadora_id, formData.tipo_veiculo_id).then(setModelos);
    } else {
      setModelos([]);
    }
  }, [formData.montadora_id, formData.tipo_veiculo_id]);

  useEffect(() => {
    if (formData.modelo_id) {
      VersoesService.getByModelo(formData.modelo_id).then(setVersoes);
    } else {
      setVersoes([]);
    }
  }, [formData.modelo_id]);

  const handleVersaoSelect = (versaoId: string) => {
    const versao = versoes.find(v => v.id === versaoId);
    if (versao) {
      onChange({
        versao_id: versaoId,
        ano_modelo: versao.ano_modelo,
        ano_fabricacao: versao.ano_fabricacao,
        motorizacao: versao.motorizacao,
        combustivel: versao.combustivel,
        transmissao: versao.transmissao
      });
    } else {
      onChange({ 
        versao_id: versaoId,
        motorizacao: '',
        combustivel: '',
        transmissao: ''
      });
    }
  };

  const selectedVersao = versoes.find(v => v.id === formData.versao_id);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2">
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center">
        <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-3 text-sm">01</span>
        Identificação do Veículo
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Montadora</label>
          <select value={formData.montadora_id || ''} onChange={e => onChange({ montadora_id: e.target.value, modelo_id: '', versao_id: '' })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
            <option value="">Marca...</option>
            {montadoras.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Categoria (Tipo)</label>
          <select value={formData.tipo_veiculo_id || ''} onChange={e => onChange({ tipo_veiculo_id: e.target.value, modelo_id: '', versao_id: '' })} disabled={!formData.montadora_id} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 appearance-none">
            <option value="">Tipo...</option>
            {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Modelo</label>
          <select value={formData.modelo_id || ''} onChange={e => onChange({ modelo_id: e.target.value, versao_id: '' })} disabled={!formData.tipo_veiculo_id} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 appearance-none">
            <option value="">Modelo...</option>
            {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Versão / Acabamento (Ficha Completa)</label>
          <select 
            value={formData.versao_id || ''} 
            onChange={e => handleVersaoSelect(e.target.value)} 
            disabled={!formData.modelo_id} 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 appearance-none text-indigo-600"
          >
            <option value="">Selecione a Versão...</option>
            {versoes.map(v => (
              <option key={v.id} value={v.id}>
                {v.nome} - {v.motorizacao} - {v.combustivel} - {v.transmissao} - {v.ano_fabricacao}/{v.ano_modelo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedVersao ? (
        <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex items-center justify-between mb-4 px-1">
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Ficha Técnica Automática (Somente Leitura)</p>
             <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-lg uppercase">Vinculado</span>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100/50">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Motorização</p>
                <p className="text-xs font-black text-indigo-600">{selectedVersao.motorizacao}</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100/50">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Combustível</p>
                <p className="text-xs font-black text-indigo-600">{selectedVersao.combustivel}</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100/50">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Transmissão</p>
                <p className="text-xs font-black text-indigo-600">{selectedVersao.transmissao}</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100/50">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Anos Oficiais</p>
                <p className="text-xs font-black text-indigo-600">{selectedVersao.ano_fabricacao}/{selectedVersao.ano_modelo}</p>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 border-dashed text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Selecione uma versão para carregar os dados técnicos</p>
        </div>
      )}
    </div>
  );
};

export default FormCardIdentification;
