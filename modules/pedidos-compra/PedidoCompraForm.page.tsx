
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PedidosCompraService } from './pedidos-compra.service';
import { IPedidoCompra } from './pedidos-compra.types';
import { CorretoresService } from '../cadastros/corretores/corretores.service';
import { FormasPagamentoService } from '../cadastros/formas-pagamento/formas-pagamento.service';
import { ParceirosService } from '../parceiros/parceiros.service';
import { IParceiro } from '../parceiros/parceiros.types';

import FormCardHeader from './components/FormCardHeader';
import FormCardContext from './components/FormCardContext';
import FormCardSupplier from './components/FormCardSupplier';
import FormCardAddress from './components/FormCardAddress';
import FormCardFinance from './components/FormCardFinance';
import FormCardNotes from './components/FormCardNotes';

const PedidoCompraFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [corretores, setCorretores] = useState([]);
  const [formas, setFormas] = useState([]);
  const [parceiros, setParceiros] = useState<IParceiro[]>([]);

  const [formData, setFormData] = useState<Partial<IPedidoCompra>>({
    status: 'RASCUNHO',
    data_compra: new Date().toISOString().split('T')[0],
    endereco_igual_cadastro: true,
    observacoes: '',
    valor_negociado: 0
  });

  // isLocked agora é apenas uma indicação visual de que o pedido já foi finalizado
  const isConcluido = !!id && formData.status !== 'RASCUNHO';

  useEffect(() => {
    async function init() {
      try {
        const [c, f, p] = await Promise.all([
          CorretoresService.getAll(),
          FormasPagamentoService.getAll(),
          ParceirosService.getAllForSelect()
        ]);
        setCorretores(c);
        setFormas(f);
        setParceiros(p);

        if (id) {
          const ped = await PedidosCompraService.getById(id);
          if (ped) setFormData(ped);
        }
      } catch (err) {
        console.error("Erro ao inicializar formulário:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleUpdate = (updates: Partial<IPedidoCompra>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handlePartnerChange = (p: IParceiro) => {
    const updates: Partial<IPedidoCompra> = { fornecedor_id: p.id };

    if (formData.endereco_igual_cadastro) {
      Object.assign(updates, {
        cep: p.cep, logradouro: p.logradouro, numero: p.numero,
        bairro: p.bairro, cidade: p.cidade, uf: p.uf, complemento: p.complemento
      });
    }
    handleUpdate(updates);
  };

  const handleToggleAddress = (checked: boolean) => {
    const updates: Partial<IPedidoCompra> = { endereco_igual_cadastro: checked };

    if (checked && formData.fornecedor_id) {
      const p = parceiros.find(x => x.id === formData.fornecedor_id);
      if (p) {
        Object.assign(updates, {
          cep: p.cep, logradouro: p.logradouro, numero: p.numero,
          bairro: p.bairro, cidade: p.cidade, uf: p.uf, complemento: p.complemento
        });
      }
    } else if (!checked) {
      Object.assign(updates, {
        cep: '', logradouro: '', numero: '',
        bairro: '', cidade: '', uf: '', complemento: ''
      });
    }
    handleUpdate(updates);
  };

  const handleSubmit = async () => {
    if (!formData.fornecedor_id) {
      alert("Selecione o fornecedor.");
      return;
    }

    if (isConcluido) {
      if (!confirm("Este pedido já está CONCLUÍDO. Alterar os dados cadastrais agora pode causar divergências com o financeiro já gerado. Deseja continuar?")) {
        return;
      }
    }

    setIsSaving(true);
    try {
      const result = await PedidosCompraService.save(formData);
      navigate(`/pedidos-compra/${result.id}`);
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-pulse">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Sincronizando Módulos...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <FormCardHeader
        id={id}
        isSaving={isSaving}
        isLocked={false} // Forçamos false para o cabeçalho sempre mostrar o botão de salvar
        onBack={() => navigate(-1)}
        onSave={handleSubmit}
      />

      {isConcluido && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center space-x-4 animate-in zoom-in-95 shadow-sm">
          <div className="w-12 h-12 bg-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Pedido em Modo de Edição Pós-Finalização</p>
            <p className="text-xs font-medium text-amber-700 leading-relaxed">
              As alterações feitas aqui atualizarão o cabeçalho do pedido, mas <span className="font-bold">não alteram</span> títulos financeiros ou entradas de estoque que já foram processadas.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <FormCardContext
          formData={formData}
          corretores={corretores}
          onChange={handleUpdate}
          disabled={false}
        />

        <FormCardSupplier
          formData={formData}
          parceiros={parceiros}
          onChange={handlePartnerChange}
          disabled={false}
        />

        <FormCardAddress
          formData={formData}
          onToggle={handleToggleAddress}
          onChange={handleUpdate}
          disabled={false}
        />

        <FormCardFinance
          formData={formData}
          formas={formas}
          onChange={handleUpdate}
          disabled={false}
        />

        <FormCardNotes
          formData={formData}
          onChange={handleUpdate}
          disabled={false}
        />
      </div>
    </div>
  );
};

export default PedidoCompraFormPage;
