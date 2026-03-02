// frontend/src/ui/tabs/button-manager.js
// ─── VERSÃO REFATORADA ────────────────────────────────────────────────────────
//
// O que mudou:
//   - Os botões "Importar Tudo" agora passam tabPanel e bulkBtn para
//     Importacao.importarTudo(), que usa JobClient + JobProgress internamente.
//   - Os botões individuais continuam chamando Importacao.importarXxx(el),
//     mas agora esses métodos disparam jobs no backend (via JobClient).
//   - Removida a lógica de verificação de config aqui — feita no backend.
//   - Botões são desabilitados durante importação e reabilitados via SSE.
//
// ─────────────────────────────────────────────────────────────────────────────

import Importacao from '../../features/import/index.js';
import UI         from '../ui.js';

export class ImportButtonManager {

    constructor() {
        /**
         * Mapa de data-action → nome do método em Importacao.
         * Adicione novas entradas aqui ao expandir o sistema.
         */
        this.actionMap = this._buildActionMap();
    }

    // ─── Inicialização ────────────────────────────────────────────────────────

    init() {
        this._setupIndividualButtons();
        this._setupBulkButtons();
        console.log(`✅ ImportButtonManager inicializado (${Object.keys(this.actionMap).length} ações)`);
    }

    // ─── Mapeamento action → método ───────────────────────────────────────────

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
            'importar-forma-pagamento-pdv':   'importarFormaPagamentoPDV',
            'importar-motivo-cancelamento':   'importarMotivoCancelamento',
            'importar-perguntas-respostas':   'importarPerguntasRespostas',

            // ESTOQUE
            'importar-local-estoque':         'importarLocalEstoque',
            'importar-tipos-ajustes':         'importarTiposAjustes',
            'importar-saldo-estoque':         'importarSaldoEstoque',

            // FISCAL
            'importar-impostos-federais':     'importarImpostosFederais',
            'importar-regime-tributario':     'importarRegimeTributario',
            'importar-situacoes-fiscais':     'importarSituacoesFiscais',
            'importar-tipos-operacoes':       'importarTiposOperacoes',
            'importar-tabelas-tributarias':   'importarTabelasTributarias',
            'importar-cenarios-fiscais':      'importarCenariosFiscais',

            // PESSOA
            'importar-lojas':                 'importarLojas',
            'importar-clientes':              'importarClientes',
            'importar-fornecedores':          'importarFornecedores',
        };
    }

    // ─── Botões individuais ───────────────────────────────────────────────────

    /**
     * Usa event delegation no document para capturar cliques em botões com
     * data-action dentro de qualquer .import-item — funciona mesmo após
     * re-render de componentes.
     */
    _setupIndividualButtons() {
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action    = btn.dataset.action;
            const methodName = this.actionMap[action];
            if (!methodName || typeof Importacao[methodName] !== 'function') return;

            // O .import-item é o container visual (pai do botão)
            const uiElement = btn.closest('.import-item');
            if (!uiElement) return;

            // Previne duplo clique — o JobProgress reabilita ao terminar
            if (btn.disabled) return;

            try {
                await Importacao[methodName](uiElement);
            } catch (err) {
                // Erro já logado dentro do Importacao / JobProgress
                console.error(`❌ Ação "${action}" falhou:`, err);
            }
        });
    }

    // ─── Botões "Importar Tudo" ───────────────────────────────────────────────

    /**
     * Mapeia cada botão "Importar Tudo" ao domínio correspondente.
     * Passa tabPanel e bulkBtn para que JobProgress possa atualizar
     * cada import-item individualmente.
     */
    _setupBulkButtons() {
        const bulkMap = {
            'btnImportarTudoProduto':    'produto',
            'btnImportarTudoFinanceiro': 'financeiro',
            'btnImportarTudoFrenteLoja': 'frenteLoja',
            'btnImportarTudoEstoque':    'estoque',
            'btnImportarTudoFiscal':     'fiscal',
            'btnImportarTudoPessoa':     'pessoa',
        };

        Object.entries(bulkMap).forEach(([btnId, dominio]) => {
            // Usa delegation para funcionar com componentes carregados dinamicamente
            document.addEventListener('click', async (e) => {
                const btn = e.target.closest(`#${btnId}`);
                if (!btn || btn.disabled) return;

                // O painel da aba é o data-panel correspondente ao domínio
                // Converte camelCase para kebab-case (frenteLoja → frente-loja)
                const panelId  = dominio.replace(/([A-Z])/g, '-$1').toLowerCase();
                const tabPanel = document.querySelector(`.tab-panel[data-panel="${panelId}"]`)
                              ?? document.querySelector(`.tab-panel[data-panel="${dominio}"]`);

                try {
                    await Importacao.importarTudo(dominio, tabPanel, btn);
                } catch (err) {
                    console.error(`❌ Importar Tudo (${dominio}) falhou:`, err);
                    UI.log(`❌ Falha ao importar ${dominio}: ${err.message}`, 'error');
                }
            });
        });
    }
}

export default ImportButtonManager;