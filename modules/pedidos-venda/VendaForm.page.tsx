
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PedidosVendaService } from './pedidos-venda.service';
import { IPedidoVenda } from './pedidos-venda.types';
import { CorretoresService } from '../cadastros/corretores/corretores.service';
import { FormasPagamentoService } from '../cadastros/formas-pagamento/formas-pagamento.service';
import { ParceirosService } from '../parceiros/parceiros.service';
import { IParceiro } from '../parceiros/parceiros.types';

// Cards Modulares
import FormVendaHeader from './components/FormVendaHeader';
import FormVendaContext from './components/FormVendaContext';
import FormVendaClient from './components/FormVendaClient';
import FormVendaAddress from './components/FormVendaAddress';
import FormVendaFinance from './components/FormVendaFinance';
import FormVendaNotes from './components/FormVendaNotes';

const VendaFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [corretores, setCorretores] = useState([]);
  const [formas, setFormas] = useState([]);
  const [parceiros, setParceiros] = useState<IParceiro[]>([]);

  const [formData, setFormData] = useState<Partial<IPedidoVenda>>({
    status: 'RASCUNHO',
    data_venda: new Date().toISOString().split('T')[0],
    endereco_igual_cadastro: true,
    observacoes: '',
    valor_venda: 0
  });

  const isLocked = !!id && formData.status !== 'RASCUNHO';

  useEffect(() => {
    async function init() {
      try {
        const [c, f, p] = await Promise.all([
          CorretoresService.getAll(),
          FormasPagamentoService.getAll(),
          ParceirosService.getAllForSelect()
        ]);
        setCorretores(c);
        // Filtra apenas formas que permitem RECEBIMENTO
        setFormas(f.filter((item: any) => item.tipo_movimentacao !== 'PAGAMENTO'));
        setParceiros(p);

        if (id) {
          const ped = await PedidosVendaService.getById(id);
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

  const handleUpdate = (updates: Partial<IPedidoVenda>) => {
    if (isLocked) return;
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleClientChange = (pId: string) => {
    if (isLocked) return;
    const p = parceiros.find(x => x.id === pId);
    if (!p) return;

    const updates: Partial<IPedidoVenda> = { cliente_id: p.id };

    if (formData.endereco_igual_cadastro) {
      Object.assign(updates, {
        cep: p.cep, logradouro: p.logradouro, numero: p.numero,
        bairro: p.bairro, cidade: p.cidade, uf: p.uf, complemento: p.complemento
      });
    }
    handleUpdate(updates);
  };

  const handleToggleAddress = (checked: boolean) => {
    if (isLocked) return;
    const updates: Partial<IPedidoVenda> = { endereco_igual_cadastro: checked };

    if (checked && formData.cliente_id) {
      const p = parceiros.find(x => x.id === formData.cliente_id);
      if (p) {
        Object.assign(updates, {
          cep: p.cep, logradouro: p.logradouro, numero: p.numero,
          bairro: p.bairro, cidade: p.cidade, uf: p.uf, complemento: p.complemento
        });
      }
    }
    handleUpdate(updates);
  };

  const handleSubmit = async () => {
    if (isLocked) return;
    if (!formData.cliente_id) {
      alert("Por favor, selecione o comprador.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await PedidosVendaService.save(formData);
      // Após salvar o rascunho, vai para os detalhes para vincular veículo e pagamentos
      navigate(`/pedidos-venda/${result.id}`);
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Preparando Pedido...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <FormVendaHeader
        id={id}
        isSaving={isSaving}
        isLocked={isLocked}
        onBack={() => navigate(-1)}
        onSave={handleSubmit}
      />

      <div className={`space-y-8 ${isLocked ? 'opacity-75 pointer-events-none' : ''}`}>
        <FormVendaContext
          formData={formData}
          corretores={corretores}
          onChange={handleUpdate}
          disabled={isLocked}
        />

        <FormVendaClient
          formData={formData}
          parceiros={parceiros}
          onChange={handleClientChange}
          disabled={isLocked}
        />

        <FormVendaAddress
          formData={formData}
          onToggle={handleToggleAddress}
          onChange={handleUpdate}
          disabled={isLocked}
        />

        <FormVendaFinance
          formData={formData}
          formas={formas}
          onChange={handleUpdate}
          disabled={isLocked}
        />

        <FormVendaNotes
          formData={formData}
          onChange={handleUpdate}
          disabled={isLocked}
        />
      </div>
    </div>
  );
};

export default VendaFormPage;
