
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import { AuthService } from './modules/auth/auth.service.ts';
import { supabase } from './lib/supabase.ts';
import ScrollToTop from './components/ScrollToTop.tsx';


// Public Module
import SitePublicoPage from './modules/site-publico/SitePublico.page.tsx';
import PublicVehicleDetailsPage from './modules/site-publico/PublicVehicleDetails.page.tsx';
import EstoquePublicoPage from './modules/site-publico/estoque-publico/EstoquePublico.page.tsx';

// Auth Module
import AuthPage from './modules/auth/Auth.page.tsx';

// Importação das Páginas ERP
import InicioPage from './modules/inicio/Inicio.page.tsx';
import ParceirosPage from './modules/parceiros/Parceiros.page.tsx';
import CadastrosPage from './modules/cadastros/Cadastros.page.tsx';
import EstoquePage from './modules/estoque/Estoque.page.tsx';
import EstoqueFormPage from './modules/estoque/EstoqueForm.page.tsx';
import EstoqueDetalhesPage from './modules/estoque/EstoqueDetalhes.page.tsx';
import PedidoCompraPage from './modules/pedidos-compra/PedidoCompra.page.tsx';
import PedidoCompraFormPage from './modules/pedidos-compra/PedidoCompraForm.page.tsx';
import PedidoCompraDetalhesPage from './modules/pedidos-compra/PedidoCompraDetalhes.page.tsx';
import PedidoCompraVeiculoDetalhesPage from './modules/pedidos-compra/PedidoCompraVeiculoDetalhes.page.tsx';
import PedidoVendaPage from './modules/pedidos-venda/PedidoVenda.page.tsx';
import VendaFormPage from './modules/pedidos-venda/VendaForm.page.tsx';
import PedidoVendaDetalhesPage from './modules/pedidos-venda/PedidoVendaDetalhes.page.tsx';
import VendaVeiculoDetalhesPage from './modules/pedidos-venda/VendaVeiculoDetalhes.page.tsx';
import CaixaPage from './modules/caixa/Caixa.page.tsx';
import FinanceiroPage from './modules/financeiro/Financeiro.page.tsx';
// Corrected import casing to match 'Performance.page.tsx' and resolve casing mismatch error.
import PerformancePage from './modules/performance/Performance.page.tsx';
import RelatoriosPage from './modules/relatorios/Relatorios.page.tsx';
import EditorSitePage from './modules/editor-site/EditorSite.page.tsx';
import AjustesPage from './modules/ajustes/Ajustes.page.tsx';

// Submódulos Relatórios
import RelatorioVendasPage from './modules/relatorios/pages/RelatorioVendas.page.tsx';
import RelatorioEstoquePage from './modules/relatorios/pages/RelatorioEstoque.page.tsx';
import RelatorioFinanceiroPage from './modules/relatorios/pages/RelatorioFinanceiro.page.tsx';
import RelatorioAuditoriaPage from './modules/relatorios/pages/RelatorioAuditoria.page.tsx';

// Submódulos Cadastros
import CidadesPage from './modules/cadastros/cidades/Cidades.page.tsx';
import MontadorasPage from './modules/cadastros/montadoras/Montadoras.page.tsx';
import TiposVeiculosPage from './modules/cadastros/tipos-veiculos/TiposVeiculos.page.tsx';
import ModelosPage from './modules/cadastros/modelos/Modelos.page.tsx';
import VersoesPage from './modules/cadastros/versoes/Versoes.page.tsx';
import CaracteristicasPage from './modules/cadastros/caracteristicas/Caracteristicas.page.tsx';
import OpcionaisPage from './modules/cadastros/opcionais/Opcionais.page.tsx';
import CoresPage from './modules/cadastros/cores/Cores.page.tsx';
import CondicoesPagamentoPage from './modules/cadastros/condicoes-pagamento/CondicoesPagamento.page.tsx';
import CondicoesRecebimentoPage from './modules/cadastros/condicoes-recebimento/CondicoesRecebimento.page.tsx';
import FormasPagamentoPage from './modules/cadastros/formas-pagamento/FormasPagamento.page.tsx';
import MotorizacaoPage from './modules/cadastros/motorizacao/Motorizacao.page.tsx';
import CombustivelPage from './modules/cadastros/combustivel/Combustivel.page.tsx';
import TransmissaoPage from './modules/cadastros/transmissao/Transmissao.page.tsx';
import CorretoresPage from './modules/cadastros/corretores/Corretores.page.tsx';
import TiposDespesasPage from './modules/cadastros/tipos-despesas/TiposDespesas.page.tsx';

// Submódulos Ajustes
import EmpresaPage from './modules/ajustes/empresa/Empresa.page.tsx';
import MarcaDaguaPage from './modules/ajustes/marca-dagua/MarcaDagua.page.tsx';
import LogsPage from './modules/ajustes/logs/Logs.page.tsx';
import SociosPage from './modules/ajustes/socios/Socios.page.tsx';
import UsuariosPage from './modules/ajustes/usuarios/Usuarios.page.tsx';
import BackupPage from './modules/ajustes/backup/Backup.page.tsx';
import ApiResetPage from './modules/ajustes/api-reset/ApiReset.page.tsx';
import ContasBancariasPage from './modules/ajustes/contas-bancarias/ContasBancarias.page.tsx';
import SaldoInicialPage from './modules/ajustes/saldo-inicial/SaldoInicial.page.tsx';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca sessão inicial
    AuthService.getSession().then(s => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Se estiver carregando, mostramos um loader apenas para rotas internas (via hash)
  const isPublicRoute = window.location.hash === '' || window.location.hash === '#/' || window.location.hash.startsWith('#/veiculo/') || window.location.hash.startsWith('#/estoque-publico');

  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Nexus Core Booting...</p>
        </div>
      </div>
    );
  }

  return (

    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Rota Raiz: Site Público */}
        <Route path="/" element={<SitePublicoPage />} />
        <Route path="/estoque-publico" element={<EstoquePublicoPage />} />
        <Route path="/veiculo/:id" element={<PublicVehicleDetailsPage />} />

        {/* Auth */}
        <Route path="/login" element={session ? <Navigate to="/inicio" /> : <AuthPage />} />

        {/* Módulos Administrativos (ERP) */}
        <Route path="/*" element={
          session ? (
            <Layout>
              <Routes>
                <Route path="/inicio" element={<InicioPage />} />
                <Route path="/parceiros" element={<ParceirosPage />} />
                <Route path="/cadastros" element={<CadastrosPage />} />
                <Route path="/cadastros/cidades" element={<CidadesPage />} />
                <Route path="/cadastros/montadoras" element={<MontadorasPage />} />
                <Route path="/cadastros/tipos-veiculos" element={<TiposVeiculosPage />} />
                <Route path="/cadastros/modelos" element={<ModelosPage />} />
                <Route path="/cadastros/versoes" element={<VersoesPage />} />
                <Route path="/cadastros/caracteristicas" element={<CaracteristicasPage />} />
                <Route path="/cadastros/opcionais" element={<OpcionaisPage />} />
                <Route path="/cadastros/cores" element={<CoresPage />} />
                <Route path="/cadastros/motorizacao" element={<MotorizacaoPage />} />
                <Route path="/cadastros/combustivel" element={<CombustivelPage />} />
                <Route path="/cadastros/transmissao" element={<TransmissaoPage />} />
                <Route path="/cadastros/formas-pagamento" element={<FormasPagamentoPage />} />
                <Route path="/cadastros/condicoes-pagamento" element={<CondicoesPagamentoPage />} />
                <Route path="/cadastros/condicoes-recebimento" element={<CondicoesRecebimentoPage />} />
                <Route path="/cadastros/corretores" element={<CorretoresPage />} />
                <Route path="/cadastros/tipos-despesas" element={<TiposDespesasPage />} />

                <Route path="/estoque" element={<EstoquePage />} />
                <Route path="/estoque/novo" element={<EstoqueFormPage />} />
                <Route path="/estoque/:id" element={<EstoqueDetalhesPage />} />
                <Route path="/estoque/editar/:id" element={<EstoqueFormPage />} />

                <Route path="/pedidos-compra" element={<PedidoCompraPage />} />
                <Route path="/pedidos-compra/novo" element={<PedidoCompraFormPage />} />
                <Route path="/pedidos-compra/:id" element={<PedidoCompraDetalhesPage />} />
                <Route path="/pedidos-compra/:id/veiculo-detalhes/:veiculoId" element={<PedidoCompraVeiculoDetalhesPage />} />
                <Route path="/pedidos-compra/editar/:id" element={<PedidoCompraFormPage />} />
                <Route path="/pedidos-compra/:pedidoId/adicionar-veiculo" element={<EstoqueFormPage />} />

                <Route path="/pedidos-venda" element={<PedidoVendaPage />} />
                <Route path="/pedidos-venda/novo" element={<VendaFormPage />} />
                <Route path="/pedidos-venda/:id" element={<PedidoVendaDetalhesPage />} />
                <Route path="/pedidos-venda/:id/veiculo-detalhes/:veiculoId" element={<VendaVeiculoDetalhesPage />} />
                <Route path="/pedidos-venda/editar/:id" element={<VendaFormPage />} />

                <Route path="/caixa" element={<CaixaPage />} />
                <Route path="/financeiro" element={<FinanceiroPage />} />
                <Route path="/performance" element={<PerformancePage />} />

                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="/relatorios/vendas" element={<RelatorioVendasPage />} />
                <Route path="/relatorios/estoque" element={<RelatorioEstoquePage />} />
                <Route path="/relatorios/financeiro" element={<RelatorioFinanceiroPage />} />
                <Route path="/relatorios/auditoria" element={<RelatorioAuditoriaPage />} />

                <Route path="/editor-site" element={<EditorSitePage />} />

                <Route path="/ajustes" element={<AjustesPage />} />
                <Route path="/ajustes/empresa" element={<EmpresaPage />} />
                <Route path="/ajustes/marca-dagua" element={<MarcaDaguaPage />} />
                <Route path="/ajustes/logs" element={<LogsPage />} />
                <Route path="/ajustes/socios" element={<SociosPage />} />
                <Route path="/ajustes/usuarios" element={<UsuariosPage />} />
                <Route path="/ajustes/backup" element={<BackupPage />} />
                <Route path="/ajustes/api-reset" element={<ApiResetPage />} />
                <Route path="/ajustes/contas-bancarias" element={<ContasBancariasPage />} />
                <Route path="/ajustes/saldo-inicial" element={<SaldoInicialPage />} />

                <Route path="*" element={<Navigate to="/inicio" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
