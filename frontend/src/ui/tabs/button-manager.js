// frontend/src/ui/tabs/button-manager.js

import Importacao from '../../features/import/index.js';
import UI         from '../ui.js';

export class ImportButtonManager {

    constructor() {
        this.actionMap = this._buildActionMap();
        // ✅ Flag para evitar duplo registro de listeners (Bug #4)
        this._listenersAttached = false;
    }

    init() {
        if (this._listenersAttached) {
            console.log('⚠️ ImportButtonManager: listeners já registrados, ignorando init() duplicado.');
            return;
        }
        this._setupIndividualButtons();
        this._setupBulkButtons();
        this._listenersAttached = true;
        console.log(`✅ ImportButtonManager inicializado (${Object.keys(this.actionMap).length} ações)`);
    }

    // ─── Mapeamento data-action → método de Importacao ────────────────────────

    _buildActionMap() {
        return {
            // PRODUTO
            'importar-mercadologia':          'importarMercadologia',
            'importar-marcas':                'importarMarcas',
            'importar-familias':              'importarFamilias',
            'importar-produtos':              'importarProdutos',
            'importar-produto-auxiliares':    'importarProdutoAuxiliares',
            'importar-produto-fornecedores':  'importarProdutoFornecedores',

            // FINANCEIRO
            'importar-categorias':            'importarCategorias',
            'importar-agentes':               'importarAgentes',
            'importar-contas-correntes':      'importarContasCorrentes',
            'importar-especies-documento':    'importarEspeciesDocumento',
            'importar-historico-padrao':      'importarHistoricoPadrao',
            'importar-formas-pagamento':      'importarFormasPagamento',

            // PDV / FRENTE DE LOJA
            'importar-pagamentos-pdv':        'importarPagamentosPDV',
            'importar-recebimentos-pdv':      'importarRecebimentosPDV',
            'importar-motivos-desconto':      'importarMotivosDesconto',
            'importar-motivos-devolucao':     'importarMotivosDevolucao',
            'importar-motivos-cancelamento':  'importarMotivosCancelamento',

            // ESTOQUE
            'importar-local-estoque':         'importarLocalEstoque',
            'importar-tipos-ajustes':         'importarTiposAjustes',
            'importar-saldo-estoque':         'importarSaldoEstoque',

            // FISCAL
            'importar-regime-tributario':     'importarRegimeTributario',
            'importar-situacoes-fiscais':     'importarSituacoesFiscais',
            'importar-tipos-operacoes':       'importarTiposOperacoes',
            'importar-impostos-federais':     'importarImpostosFederais',
            'importar-tabelas-tributarias':   'importarTabelasTributarias',
            'importar-cenarios-fiscais':      'importarCenariosFiscais',

            // PESSOA
            'importar-lojas':                 'importarLojas',
            'importar-clientes':              'importarClientes',
            'importar-fornecedores':          'importarFornecedores',
        };
    }

    // ─── Botões individuais ───────────────────────────────────────────────────

    _setupIndividualButtons() {
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action     = btn.dataset.action;
            const methodName = this.actionMap[action];
            if (!methodName || typeof Importacao[methodName] !== 'function') return;

            const uiElement = btn.closest('.import-item');
            if (!uiElement) return;

            if (btn.disabled) return;

            try {
                await Importacao[methodName](uiElement);
            } catch (err) {
                console.error(`❌ Ação "${action}" falhou:`, err);
            }
        });
    }

    // ─── Botões "Importar Tudo" ───────────────────────────────────────────────

    _setupBulkButtons() {
        // Mapa: ID do botão → domínio (deve coincidir com DOMINIO_STEPS no index.js)
        const bulkMap = {
            'btnImportarTudoProduto':    'produto',
            'btnImportarTudoFinanceiro': 'financeiro',
            'btnImportarTudoFrenteLoja': 'frenteLoja',
            'btnImportarTudoEstoque':    'estoque',
            'btnImportarTudoFiscal':     'fiscal',
            'btnImportarTudoPessoa':     'pessoa',
        };

        // ✅ Uma única delegação no document (não um listener por botão em loop)
        document.addEventListener('click', async (e) => {
            // Descobre qual botão bulk foi clicado (se algum)
            const entry = Object.entries(bulkMap).find(([btnId]) =>
                e.target.closest(`#${btnId}`)
            );
            if (!entry) return;

            const [btnId, dominio] = entry;
            const btn = e.target.closest(`#${btnId}`);
            if (!btn || btn.disabled) return;

            // Localiza o painel da aba correspondente
            // frenteLoja → data-panel="frente-loja"
            const panelId  = dominio.replace(/([A-Z])/g, '-$1').toLowerCase();
            const tabPanel =
                document.querySelector(`.tab-panel[data-panel="${panelId}"]`) ??
                document.querySelector(`.tab-panel[data-panel="${dominio}"]`);

            try {
                await Importacao.importarTudo(dominio, tabPanel, btn);
            } catch (err) {
                console.error(`❌ Importar Tudo (${dominio}) falhou:`, err);
                UI.log(`❌ Falha ao importar ${dominio}: ${err.message}`, 'error');
                if (btn) btn.disabled = false;
            }
        });
    }
}

export default ImportButtonManager;