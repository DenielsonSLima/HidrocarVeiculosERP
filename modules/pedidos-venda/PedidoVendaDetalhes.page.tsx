
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PedidosVendaService } from './pedidos-venda.service';
import { IPedidoVenda, IVendaPagamento } from './pedidos-venda.types';
import { EstoqueService } from '../estoque/estoque.service';
import { supabase } from '../../lib/supabase';
import ConfirmModal from '../../components/ConfirmModal';

// Componentes Reestruturados (Ordem Linear)
import HeaderVenda from './components/details/HeaderVenda';
import InfoVendaCompradorHeader from './components/details/InfoVendaCompradorHeader';
import VendaPartnersResultKpis from './components/details/VendaPartnersResultKpis';
import VendaAnalyticsKpis from './components/details/VendaAnalyticsKpis';
import VeiculosVendaList from './components/details/VeiculosVendaList';
import FinancialCard from './components/details/FinancialCard';
import ObservationsCard from './components/details/ObservationsCard';
import ModalConfirmacaoVenda from './components/details/ModalConfirmacaoVenda';

const PedidoVendaDetalhesPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pedido, setPedido] = useState<IPedidoVenda | null>(null);
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadData();
    EstoqueService.getAll().then(data => setVeiculosDisponiveis((data.data || []).filter((v: any) => v.status === 'DISPONIVEL')));
    const sub = PedidosVendaService.subscribe(() => loadData(true));
    return () => { sub.unsubscribe(); };
  }, [id]);

  async function loadData(silent = false) {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const data = await PedidosVendaService.getById(id);
      setPedido(data);

      // Se o veículo for consignado e o pedido ainda for rascunho sem forma de pagamento, sugere consignação
      if (data && data.status === 'RASCUNHO' && !data.forma_pagamento_id) {
        const isConsignado = data.veiculo?.pedido_compra?.forma_pagamento?.nome?.toLowerCase().includes('consignação') ||
          data.veiculo?.pedido_compra?.forma_pagamento?.nome?.toLowerCase().includes('consignacao');

        if (isConsignado) {
          // Busca o ID da forma de pagamento Consignação
          const { data: fpConsig } = await supabase.from('cad_formas_pagamento').select('id').ilike('nome', '%CONSIGNAC%').single();
          if (fpConsig) {
            await PedidosVendaService.save({ id: data.id, forma_pagamento_id: fpConsig.id });
            loadData(true);
          }
        }
      }
    } catch (error) {
      console.error(error);
      navigate('/pedidos-venda');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // CÁLCULOS FINANCEIROS DE VALIDAÇÃO
  const totalPagamentosLancados = (pedido?.pagamentos || []).reduce((acc, p) => acc + p.valor, 0);
  const valorVenda = pedido?.valor_venda || 0;

  const isConsignacaoOrigin = pedido?.veiculo?.pedido_compra?.forma_pagamento?.nome?.toLowerCase().includes('consignação') ||
    pedido?.veiculo?.pedido_compra?.forma_pagamento?.nome?.toLowerCase().includes('consignacao');

  const isConsignacaoVenda = pedido?.forma_pagamento?.nome?.toLowerCase().includes('consignação') ||
    pedido?.forma_pagamento?.nome?.toLowerCase().includes('consignacao');

  // Permitir confirmar apenas se houver veículo E o pagamento bater com o valor de venda (ou se for consignação)
  const isFinanceiroOK = !!pedido?.veiculo_id && valorVenda > 0 && (isConsignacaoVenda || Math.abs(valorVenda - totalPagamentosLancados) < 0.05);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLinkVehicle = async (vId: string) => {
    if (!pedido) return;
    setActionLoading(true);
    try {
      await PedidosVendaService.save({ id: pedido.id, veiculo_id: vId });
      loadData(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkVehicle = async (vId: string) => {
    if (!pedido) return;
    if (!confirm("Remover este veículo da venda?")) return;
    setActionLoading(true);
    try {
      await PedidosVendaService.save({ id: pedido.id, veiculo_id: null } as any);
      loadData(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPayments = async (payments: Partial<IVendaPagamento>[]) => {
    if (!pedido) return;
    setActionLoading(true);
    try {
      for (const p of payments) {
        await PedidosVendaService.savePayment(p);
      }
      showNotification('success', `${payments.length} recebimento(s) lançado(s) com sucesso!`);
      loadData(true);
    } catch (e) {
      showNotification('error', 'Erro ao processar recebimentos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePayment = async (payId: string) => {
    setActionLoading(true);
    try {
      await PedidosVendaService.deletePayment(payId);
      showNotification('success', 'Lançamento estornado com sucesso.');
      loadData(true);
    } catch (e) {
      showNotification('error', 'Erro ao excluir lançamento.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSale = async (params: { condicao: any, contaId?: string }) => {
    if (!pedido) return;
    if (!isFinanceiroOK) {
      showNotification('error', 'A composição de recebimentos deve ser igual ao valor da venda.');
      return;
    }
    setActionLoading(true);
    try {
      await PedidosVendaService.confirmSale({
        pedido,
        condicao: params.condicao,
        contaBancariaId: params.contaId
      });
      showNotification('success', 'Venda faturada! Veículo marcado como vendido.');
      setShowConfirm(false);
      loadData(true);
    } catch (e: any) {
      showNotification('error', "Erro ao faturar venda: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !pedido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Sincronizando Venda...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 space-y-6 animate-in fade-in duration-500 max-w-screen-2xl mx-auto px-4 md:px-6">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300 border backdrop-blur-md ${toast.type === 'success' ? 'bg-slate-900/95 text-white border-emerald-500/50' : 'bg-rose-600 text-white border-rose-400/50'
          }`}>
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* 1. Header de Comando */}
      <HeaderVenda
        pedido={pedido}
        onBack={() => navigate('/pedidos-venda')}
        onEdit={() => navigate(`/pedidos-venda/editar/${pedido.id}`)}
        onConfirm={() => setShowConfirm(true)}
        onDelete={() => setShowDelete(true)}
        loadingAction={actionLoading}
        canConfirm={isFinanceiroOK}
      />

      {/* 2. Dados do Comprador e Vendedor */}
      <InfoVendaCompradorHeader pedido={pedido} />

      {/* 3. KPIs Individuais de Sócios */}
      <VendaPartnersResultKpis pedido={pedido} />

      {/* 4. KPIs de Rentabilidade Gerais */}
      <VendaAnalyticsKpis pedido={pedido} />

      {/* 5. Ativo Negociado (Padrão Grid Fixo 380px) */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 md:p-8">
        <VeiculosVendaList
          pedido={pedido}
          veiculosDisponiveis={veiculosDisponiveis}
          onLink={handleLinkVehicle}
          onUnlink={handleUnlinkVehicle}
          isConcluido={pedido.status === 'CONCLUIDO'}
        />
      </section>

      {/* 6. Gestão Financeira (Recebimentos) */}
      <section>
        <FinancialCard
          pedido={pedido}
          onAddPayments={handleAddPayments}
          onDeletePayment={handleDeletePayment}
          isSaving={actionLoading}
        />
      </section>

      {/* 7. Notas e Observações */}
      <ObservationsCard
        observacoes={pedido.observacoes}
        onSave={async (v) => {
          await PedidosVendaService.save({ id: pedido.id, observacoes: v });
          loadData(true);
        }}
        isSaving={actionLoading}
      />

      {/* Modais de Fluxo */}
      {showConfirm && (
        <ModalConfirmacaoVenda
          pedido={pedido}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmSale}
          isLoading={actionLoading}
        />
      )}

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={async () => {
          await PedidosVendaService.delete(pedido.id);
          navigate('/pedidos-venda');
        }}
        title="Excluir Pedido de Venda?"
        message="Esta ação apagará o rascunho. Veículos vinculados voltarão a ficar disponíveis no estoque."
        isLoading={actionLoading}
      />
    </div>
  );
};

export default PedidoVendaDetalhesPage;

