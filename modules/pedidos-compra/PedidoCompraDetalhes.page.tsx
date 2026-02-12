import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PedidosCompraService } from './pedidos-compra.service';
import { IPedidoCompra, IPedidoPagamento } from './pedidos-compra.types';
import { EmpresaService } from '../ajustes/empresa/empresa.service';
import { MarcaDaguaService } from '../ajustes/marca-dagua/marca-dagua.service';
import { CaracteristicasService } from '../cadastros/caracteristicas/caracteristicas.service';
import { OpcionaisService } from '../cadastros/opcionais/opcionais.service';
import ConfirmModal from '../../components/ConfirmModal';

// Componentes Reestruturados
import HeaderPedido from './components/details/HeaderPedido';
import InfoNegociacaoHeader from './components/details/InfoNegociacaoHeader';
import PurchasePartnersResultKpis from './components/details/PurchasePartnersResultKpis';
import OrderCostKpis from './components/details/OrderCostKpis';
import VeiculosPedidoList from './components/details/VeiculosPedidoList';
import CardPaymentData from './components/details/CardPaymentData';
import CardAnnotations from './components/details/CardAnnotations';
import ModalConfirmacaoFinanceira from './components/details/ModalConfirmacaoFinanceira';

// Componentes de Impressão e Preview
import PurchaseOrderPrint from './components/details/PurchaseOrderPrint';
import InternalAnalysisPrint from './components/details/InternalAnalysisPrint';
import QuickPreviewModal from './components/details/QuickPreviewModal';

const PedidoCompraDetalhesPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pedido, setPedido] = useState<IPedidoCompra | null>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [watermark, setWatermark] = useState<any>(null);
  const [allCaracteristicas, setAllCaracteristicas] = useState<any[]>([]);
  const [allOpcionais, setAllOpcionais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Controle de Preview e Toast
  const [previewType, setPreviewType] = useState<'supplier' | 'internal' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [unlinkTargetId, setUnlinkTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const sub = PedidosCompraService.subscribe(() => loadData(true));
    return () => { sub.unsubscribe(); };
  }, [id]);

  async function loadData(silent = false) {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const [pData, eData, wData, carData, opData] = await Promise.all([
        PedidosCompraService.getById(id),
        EmpresaService.getDadosEmpresa(),
        MarcaDaguaService.getConfig(),
        CaracteristicasService.getAll(),
        OpcionaisService.getAll()
      ]);
      setPedido(pData);
      setEmpresa(eData);
      setWatermark(wData);
      setAllCaracteristicas(carData);
      setAllOpcionais(opData);
    } catch (error) {
      console.error(error);
      navigate('/pedidos-compra');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // CÁLCULOS FINANCEIROS DE VALIDAÇÃO
  const totalCustoVeiculos = (pedido?.veiculos || []).reduce((acc, v) => acc + (v.valor_custo || 0), 0);
  const totalPagamentosLancados = (pedido?.pagamentos || []).reduce((acc, p) => acc + p.valor, 0);

  const isConsignacao = pedido?.forma_pagamento?.nome?.toLowerCase().includes('consignação') ||
    pedido?.forma_pagamento?.nome?.toLowerCase().includes('consignacao');

  // O valor negociado master é o custo do veículo se houver veículo, senão usa o campo do pedido
  const valorMasterPedido = totalCustoVeiculos > 0 ? totalCustoVeiculos : (pedido?.valor_negociado || 0);

  // Permitir confirmar apenas se houver veículo E o pagamento bater com o custo (ou se for consignação)
  const isFinanceiroOK = totalCustoVeiculos > 0 && (isConsignacao || Math.abs(totalCustoVeiculos - totalPagamentosLancados) < 0.05);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleReopen = async () => {
    if (!id || !confirm("Deseja reabrir este pedido para edição? O status voltará para Rascunho.")) return;
    setActionLoading(true);
    try {
      await PedidosCompraService.reopenOrder(id);
      showNotification('success', 'Pedido reaberto com sucesso.');
      loadData(true);
    } catch (e) {
      showNotification('error', 'Erro ao reabrir pedido.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPayments = async (payments: Partial<IPedidoPagamento>[]) => {
    if (!pedido) return;
    setActionLoading(true);
    try {
      for (const p of payments) {
        await PedidosCompraService.savePayment(p);
      }
      showNotification('success', `${payments.length} pagamento(s) lançado(s) com sucesso!`);
      loadData(true);
    } catch (e) {
      showNotification('error', 'Erro ao processar pagamentos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePayment = async (payId: string) => {
    setActionLoading(true);
    try {
      await PedidosCompraService.deletePayment(payId);
      showNotification('success', 'Lançamento removido com sucesso.');
      loadData(true);
    } catch (e) {
      showNotification('error', 'Erro ao excluir lançamento.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmOrder = async (params: { condicao: any, contaId?: string }) => {
    if (!pedido) return;
    if (!isFinanceiroOK) {
      showNotification('error', 'A composição de pagamentos deve ser igual ao valor de custo do veículo.');
      return;
    }
    setActionLoading(true);
    try {
      await PedidosCompraService.confirmOrder({
        pedido: { ...pedido, valor_negociado: valorMasterPedido },
        condicao: params.condicao,
        contaBancariaId: params.contaId
      });
      showNotification('success', 'Pedido confirmado! Veículo agora disponível no estoque.');
      setShowConfirm(false);
      loadData(true);
    } catch (e: any) {
      showNotification('error', "Erro ao confirmar entrada: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !pedido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Sincronizando Pedido...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 space-y-8 animate-in fade-in duration-500 max-w-screen-2xl mx-auto px-4">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300 border backdrop-blur-md ${toast.type === 'success' ? 'bg-slate-900/95 text-white border-emerald-500/50' : 'bg-rose-600 text-white border-rose-400/50'
          }`}>
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* 1. Header de Status */}
      <HeaderPedido
        pedido={pedido}
        onBack={() => navigate('/pedidos-compra')}
        onEdit={() => navigate(`/pedidos-compra/editar/${pedido.id}`)}
        onConfirm={() => {
          if (isConsignacao) {
            // Se for consignação, confirma direto sem modal financeiro
            handleConfirmOrder({ condicao: { nome: 'AVULSO', qtd_parcelas: 1, dias_primeira_parcela: 0, dias_entre_parcelas: 0 } });
          } else {
            setShowConfirm(true);
          }
        }}
        onReopen={handleReopen}
        onDelete={() => setShowDelete(true)}
        onPrintSupplier={() => setPreviewType('supplier')}
        onPrintInternal={() => setPreviewType('internal')}
        loadingAction={actionLoading}
        canConfirm={isFinanceiroOK}
      />

      {/* 2. Dados do Parceiro e Corretor */}
      <InfoNegociacaoHeader pedido={pedido} />

      {/* 3. Divisão de Capital e Retorno por Investidor */}
      <PurchasePartnersResultKpis pedido={pedido} />

      {/* 4. Métricas de Custo (KPIs) */}
      <OrderCostKpis pedido={pedido} />

      {/* 5. Ativos Vinculados */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
        <VeiculosPedidoList
          pedido={pedido}
          onUnlink={setUnlinkTargetId}
          isConcluido={pedido.status === 'CONCLUIDO'}
        />
      </section>

      {/* 6. Gestão Financeira */}
      <section>
        <CardPaymentData
          pedido={pedido}
          totalAquisicaoReferencia={valorMasterPedido}
          onAddPayment={handleAddPayments}
          onDeletePayment={handleDeletePayment}
          isSaving={actionLoading}
        />
      </section>

      {/* 7. Observações */}
      <CardAnnotations
        initialValue={pedido.observacoes}
        onSave={async (v) => {
          await PedidosCompraService.save({ id: pedido.id, observacoes: v });
          loadData(true);
        }}
        isSaving={actionLoading}
      />

      {/* MODAL DE QUICK PREVIEW */}
      {empresa && (
        <QuickPreviewModal
          isOpen={!!previewType}
          onClose={() => setPreviewType(null)}
          onDownload={handleDownloadPDF}
          title={previewType === 'supplier' ? 'Pedido para Fornecedor' : 'Análise Estratégica Interna'}
        >
          {previewType === 'supplier' ? (
            <PurchaseOrderPrint
              pedido={pedido}
              empresa={empresa}
              watermark={watermark}
              allCaracteristicas={allCaracteristicas}
              allOpcionais={allOpcionais}
            />
          ) : (
            <InternalAnalysisPrint
              pedido={pedido}
              empresa={empresa}
              watermark={watermark}
              allCaracteristicas={allCaracteristicas}
              allOpcionais={allOpcionais}
            />
          )}
        </QuickPreviewModal>
      )}

      {/* Componentes de Impressão Invisíveis */}
      {empresa && (
        <div className="hidden print:block">
          <PurchaseOrderPrint
            pedido={pedido}
            empresa={empresa}
            watermark={watermark}
            allCaracteristicas={allCaracteristicas}
            allOpcionais={allOpcionais}
          />
          <InternalAnalysisPrint
            pedido={pedido}
            empresa={empresa}
            watermark={watermark}
            allCaracteristicas={allCaracteristicas}
            allOpcionais={allOpcionais}
          />
        </div>
      )}

      {/* Modais */}
      {showConfirm && (
        <ModalConfirmacaoFinanceira
          pedido={{ ...pedido, valor_negociado: valorMasterPedido }}
          onClose={() => setShowConfirm(false)}
          /* Changed from handleConfirmSale to handleConfirmOrder to fix the error */
          onConfirm={handleConfirmOrder}
          isLoading={actionLoading}
        />
      )}

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={async () => {
          await PedidosCompraService.delete(pedido.id);
          navigate('/pedidos-compra');
        }}
        title="Excluir Pedido?"
        message="Esta ação apagará o rascunho e todos os vínculos criados até agora."
        isLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={!!unlinkTargetId}
        onClose={() => setUnlinkTargetId(null)}
        onConfirm={async () => {
          await PedidosCompraService.unlinkVehicle(unlinkTargetId!);
          setUnlinkTargetId(null);
          loadData(true);
        }}
        title="Remover Veículo?"
        message="O veículo será desvinculado deste contrato."
        isLoading={actionLoading}
      />
    </div>
  );
};

export default PedidoCompraDetalhesPage;