
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthService } from './modules/auth/auth.service';

// Auth Module
import AuthPage from './modules/auth/Auth.page';

// Importação das Páginas (Módulos Internos)
import InicioPage from './modules/inicio/Inicio.page';
import ParceirosPage from './modules/parceiros/Parceiros.page';
import CadastrosPage from './modules/cadastros/Cadastros.page';

// Módulo Estoque
import EstoquePage from './modules/estoque/Estoque.page';
import EstoqueFormPage from './modules/estoque/EstoqueForm.page';

import PedidoCompraPage from './modules/pedidos-compra/PedidoCompra.page';
import PedidoVendaPage from './modules/pedidos-venda/PedidoVenda.page';
import CaixaPage from './modules/caixa/Caixa.page';
import FinanceiroPage from './modules/financeiro/Financeiro.page';
// Importação direta da página de performance usando extensão para resolver erro de URL no ESM
// Corrected import casing to match 'Performance.page.tsx' and resolve casing mismatch error.
import PerformancePage from './modules/performance/Performance.page';
import RelatoriosPage from './modules/relatorios/Relatorios.page';
import EditorSitePage from './modules/editor-site/EditorSite.page';
import AjustesPage from './modules/ajustes/Ajustes.page';

// Submódulos Cadastros
import CidadesPage from './modules/cadastros/cidades/Cidades.page';
import MontadorasPage from './modules/cadastros/montadoras/Montadoras.page';
import TiposVeiculosPage from './modules/cadastros/tipos-veiculos/TiposVeiculos.page';
import ModelosPage from './modules/cadastros/modelos/Modelos.page';
import VersoesPage from './modules/cadastros/versoes/Versoes.page';
import CaracteristicasPage from './modules/cadastros/caracteristicas/Caracteristicas.page';
import OpcionaisPage from './modules/cadastros/opcionais/Opcionais.page';
import CoresPage from './modules/cadastros/cores/Cores.page';
import CondicoesPagamentoPage from './modules/cadastros/condicoes-pagamento/CondicoesPagamento.page';
import CondicoesRecebimentoPage from './modules/cadastros/condicoes-recebimento/CondicoesRecebimento.page';
import FormasPagamentoPage from './modules/cadastros/formas-pagamento/FormasPagamento.page';
import MotorizacaoPage from './modules/cadastros/motorizacao/Motorizacao.page';
import CombustivelPage from './modules/cadastros/combustivel/Combustivel.page';
import TransmissaoPage from './modules/transmissao/Transmissao.page';
import CorretoresPage from './modules/cadastros/corretores/Corretores.page';
import TiposDespesasPage from './modules/cadastros/tipos-despesas/TiposDespesas.page';

// Submódulos Ajustes
import EmpresaPage from './modules/ajustes/empresa/Empresa.page';
import MarcaDaguaPage from './modules/ajustes/marca-dagua/MarcaDagua.page';
import LogsPage from './modules/ajustes/logs/Logs.page';
import SociosPage from './modules/ajustes/socios/Socios.page';
import UsuariosPage from './modules/ajustes/usuarios/Usuarios.page';
import BackupPage from './modules/ajustes/backup/Backup.page';
import ApiResetPage from './modules/ajustes/api-reset/ApiReset.page';
import ContasBancariasPage from './modules/ajustes/contas-bancarias/ContasBancarias.page';
import SaldoInicialPage from './modules/ajustes/saldo-inicial/SaldoInicial.page';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getSession().then(s => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = AuthService.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/inicio" /> : <AuthPage />} />
        <Route path="/*" element={
          session ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/inicio" replace />} />
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

                {/* Rotas de Estoque */}
                <Route path="/estoque" element={<EstoquePage />} />
                <Route path="/estoque/novo" element={<EstoqueFormPage />} />
                <Route path="/estoque/editar/:id" element={<EstoqueFormPage />} />

                <Route path="/pedidos-compra" element={<PedidoCompraPage />} />
                <Route path="/pedidos-venda" element={<PedidoVendaPage />} />
                <Route path="/caixa" element={<CaixaPage />} />
                <Route path="/financeiro" element={<FinanceiroPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
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
