
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaracteristicasService } from './caracteristicas.service';
import { ICaracteristica } from './caracteristicas.types';
import CaracteristicaForm from './components/CaracteristicaForm';
import CaracteristicasList from './components/CaracteristicasList';
import ConfirmModal from '../../../components/ConfirmModal';

const CaracteristicasPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ICaracteristica[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ICaracteristica | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Estados para modal de exclusão
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await CaracteristicasService.getAll();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const sub = CaracteristicasService.subscribe(() => loadData(true));
    return () => { sub.unsubscribe(); };
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => i.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: ICaracteristica) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleClickDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await CaracteristicasService.remove(deleteId);
      showToast('success', 'Característica removida com sucesso.');
      loadData(true);
      setDeleteId(null);
    } catch (err: any) {
      showToast('error', 'Erro ao excluir.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (data: Partial<ICaracteristica>) => {
    setIsSaving(true);
    try {
      await CaracteristicasService.save(data);
      setIsFormOpen(false);
      showToast('success', data.id ? 'Característica atualizada!' : 'Nova característica salva!');
      loadData(true);
    } catch (err: any) {
      showToast('error', 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300 border backdrop-blur-md ${
          toast.type === 'success' ? 'bg-slate-900/95 text-white border-emerald-500/50' : 'bg-rose-600 text-white border-rose-400/50'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-white text-rose-600'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d={toast.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Características Técnicas</h1>
          <p className="text-slate-500 mt-1">Defina os selos e atributos para o checklist dos veículos.</p>
        </div>
        <button onClick={handleOpenAdd} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
          Nova Característica
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 min-h-[500px]">
        <div className="mb-8 relative max-w-md">
           <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            placeholder="Pesquisar atributo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Acessando base de dados...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400 italic">Nenhuma característica encontrada.</div>
        ) : (
          <CaracteristicasList 
            items={filteredItems} 
            onEdit={handleEdit} 
            onDelete={handleClickDelete} 
          />
        )}
      </div>

      {isFormOpen && (
        <CaracteristicaForm 
          initialData={editingItem}
          isSaving={isSaving}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Remover Característica?"
        message={`Tem certeza que deseja excluir "${items.find(i => i.id === deleteId)?.nome}"?`}
        confirmText="Sim, Excluir"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CaracteristicasPage;
