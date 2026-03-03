// frontend/src/ui/tabs/button-manager.js
// ─── VERSÃO CORRIGIDA ─────────────────────────────────────────────────────────
//
// CORREÇÕES aplicadas neste arquivo (encontradas na revisão de continuidade):
//
// BUG 1 — PDV action map corrompido:
//   ANTES (novo/errado):
//     'importar-forma-pagamento-pdv'  → 'importarFormaPagamentoPDV'  ← GHOST
//     'importar-motivo-cancelamento'  → 'importarMotivoCancelamento' ← GHOST (singular)
//     'importar-perguntas-respostas'  → 'importarPerguntasRespostas' ← GHOST (não existe)
//     (faltavam 5 ações PDV reais)
//   DEPOIS (correto, espelha button-manager.legacy.js + index.js):
//     'importar-formas-pagamento'     → 'importarFormasPagamento'
//     'importar-pagamentos-pdv'       → 'importarPagamentosPDV'
//     'importar-recebimentos-pdv'     → 'importarRecebimentosPDV'
//     'importar-motivos-desconto'     → 'importarMotivosDesconto'
//     'importar-motivos-devolucao'    → 'importarMotivosDevolucao'
//     'importar-motivos-cancelamento' → 'importarMotivosCancelamento'
//
// BUG 2 — Estoque: HTML usa 'importar-locais-estoque' (plural), mapa usava singular:
//   ANTES: 'importar-local-estoque'  → não batia com nenhum botão do HTML
//   DEPOIS: 'importar-locais-estoque' → bate com data-action do HTML
//
// BUG 3 — _setupBulkButtons chamava Importacao.importarTudo(dominio, tabPanel, btn)
//   index.js tem assinatura: importarTudo(uiElement) — o dominio ia como uiElement!
//   SOLUÇÃO: cada botão bulk agora chama o método específico do domínio:
//     importarTudoProduto / importarTudoFinanceiro / importarTudoPdv / etc.
//
// ─────────────────────────────────────────────────────────────────────────────

import Importacao from '../../features/import/index.js';
import UI         from '../ui.js';

export class ImportButtonManager {

    constructor() {
        this.actionMap = this._buildActionMap();
    }

    // ─── Inicialização ────────────────────────────────────────────────────────

    init() {
        this._setupIndividualButtons();
        this._setupBulkButtons();
        console.log(`✅ ImportButtonManager inicializado (${Object.keys(this.actionMap).length} ações)`);
    }

    // ─── Mapeamento data-action → método de Importacao ────────────────────────
    //
    // Regras:
    //   - Chave: data-action exato do HTML (verificado em import-tabs.html)
    //   - Valor: nome do método em Importacao (index.js)
    //   - Qualquer divergência aqui causa clique silencioso sem efeito

    _buildActionMap() {
        return {
            // ── PRODUTO ───────────────────────────────────────────────────────
            'importar-mercadologia':          'importarMercadologia',
            'importar-marcas':                'importarMarcas',
            'importar-familias':              'importarFamilias',
            'importar-produtos':              'importarProdutos',
            'importar-produto-auxiliares':    'importarProdutoAuxiliares',
            'importar-produto-fornecedores':  'importarProdutoFornecedores',

            // ── FINANCEIRO ────────────────────────────────────────────────────
            'importar-categorias':            'importarCategorias',
            'importar-agentes':               'importarAgentes',
            'importar-contas-correntes':      'importarContasCorrentes',
            'importar-especies-documento':    'importarEspeciesDocumento',
            'importar-historico-padrao':      'importarHistoricoPadrao',

            // ── PDV / FRENTE DE LOJA ──────────────────────────────────────────
            // CORRIGIDO: as 6 entradas abaixo substituem as 3 entradas fantasmas
            // que existiam na versão anterior (forma-pagamento-pdv, motivo-cancelamento,
            // perguntas-respostas — nenhuma delas existia em index.js)
            'importar-formas-pagamento':      'importarFormasPagamento',
            'importar-pagamentos-pdv':        'importarPagamentosPDV',
            'importar-recebimentos-pdv':      'importarRecebimentosPDV',
            'importar-motivos-desconto':      'importarMotivosDesconto',
            'importar-motivos-devolucao':     'importarMotivosDevolucao',
            'importar-motivos-cancelamento':  'importarMotivosCancelamento',

            // ── ESTOQUE ───────────────────────────────────────────────────────
            // CORRIGIDO: HTML usa 'importar-locais-estoque' (plural)
            // A versão anterior tinha 'importar-local-estoque' (singular) — não batia
            'importar-locais-estoque':        'importarLocalEstoque',
            'importar-tipos-ajustes':         'importarTiposAjustes',
            'importar-saldo-estoque':         'importarSaldoEstoque',

            // ── FISCAL ────────────────────────────────────────────────────────
            'importar-impostos-federais':     'importarImpostosFederais',
            'importar-regime-tributario':     'importarRegimeTributario',
            'importar-situacoes-fiscais':     'importarSituacoesFiscais',
            'importar-tipos-operacoes':       'importarTiposOperacoes',
            'importar-tabelas-tributarias':   'importarTabelasTributarias',
            'importar-cenarios-fiscais':      'importarCenariosFiscais',

            // ── PESSOA ────────────────────────────────────────────────────────
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

            const action     = btn.dataset.action;
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
                console.error(`❌ Ação "${action}" falhou:`, err);
            }
        });
    }

    // ─── Botões "Importar Tudo" ───────────────────────────────────────────────

    /**
     * Cada botão "Importar Tudo" dispara o job do domínio correspondente.
     *
     * CORRIGIDO: a versão anterior chamava Importacao.importarTudo(dominio, tabPanel, btn),
     * mas index.js tem assinatura importarTudo(uiElement) — o dominio ia como uiElement
     * (string passada onde se espera um elemento DOM).
     *
     * SOLUÇÃO: cada botão agora chama o método específico do domínio:
     *   importarTudoProduto / importarTudoFinanceiro / importarTudoPdv / etc.
     * Esses métodos existem em index.js e têm a assinatura correta (uiElement).
     *
     * O tabPanel é passado como uiElement para que o JobProgress consiga
     * atualizar os import-items individuais dentro da aba.
     */
    _setupBulkButtons() {
        // Mapeia: id do botão → método em Importacao (todos existem em index.js)
        const bulkMap = {
            'btnImportarTudoProduto':    'importarTudoProduto',
            'btnImportarTudoFinanceiro': 'importarTudoFinanceiro',
            'btnImportarTudoFrenteLoja': 'importarTudoPdv',       // domínio interno: 'pdv'
            'btnImportarTudoEstoque':    'importarTudoEstoque',
            'btnImportarTudoFiscal':     'importarTudoFiscal',
            'btnImportarTudoPessoa':     'importarTudoPessoa',
        };

        // Mapa auxiliar: id do botão → data-panel da aba correspondente
        // Necessário porque frenteLoja ≠ frente-loja no HTML
        const panelMap = {
            'btnImportarTudoProduto':    'produto',
            'btnImportarTudoFinanceiro': 'financeiro',
            'btnImportarTudoFrenteLoja': 'frente-loja',
            'btnImportarTudoEstoque':    'estoque',
            'btnImportarTudoFiscal':     'fiscal',
            'btnImportarTudoPessoa':     'pessoa',
        };

        Object.entries(bulkMap).forEach(([btnId, methodName]) => {
            document.addEventListener('click', async (e) => {
                const btn = e.target.closest(`#${btnId}`);
                if (!btn || btn.disabled) return;

                const panelId  = panelMap[btnId];
                const tabPanel = document.querySelector(`.tab-panel[data-panel="${panelId}"]`);

                try {
                    // tabPanel é o uiElement — JobProgress atualiza os import-items dentro dele
                    await Importacao[methodName](tabPanel);
                } catch (err) {
                    console.error(`❌ Importar Tudo (${btnId}) falhou:`, err);
                    UI.log(`❌ Falha ao importar: ${err.message}`, 'error');
                }
            });
        });
    }
}

export default ImportButtonManager;
