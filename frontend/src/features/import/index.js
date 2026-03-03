// frontend/src/features/import/index.js
// ─────────────────────────────────────────────────────────────────────────────
// CORREÇÕES:
//  - _runStep passa step correto para JobClient.start(dominio, step)
//  - _runDominio chama cada step INDIVIDUALMENTE em sequência
//    (botão "Importar Tudo" executa os individuais um a um, não um job bulk)
//  - Sem distinção de loja — endpoint sem ?lojaId= (backend busca todas)
// ─────────────────────────────────────────────────────────────────────────────

import JobClient   from './job-client.js';
import JobProgress from './job-progress.js';
import DatabaseClient from '../../services/database/db-client.js';
import UI from '../../ui/ui.js';

const db = new DatabaseClient();

// ─── Mapa: domínio → lista ordenada de steps ─────────────────────────────────
// "Importar Tudo" percorre esses steps em sequência, um a um.
const DOMINIO_STEPS = {
    produto:    ['mercadologia', 'marcas', 'familias', 'produtos', 'produtoAuxiliares', 'produtoFornecedores'],
    financeiro: ['categorias', 'agentes', 'contasCorrentes', 'especiesDocumento', 'historicoPadrao', 'formasPagamento'],
    frenteLoja: ['formasPagamento', 'pagamentosPDV', 'recebimentosPDV', 'motivosDesconto', 'motivosDevolucao', 'motivosCancelamento'],
    estoque:    ['localEstoque', 'tiposAjustes', 'saldoEstoque'],
    fiscal:     ['regimeTributario', 'situacoesFiscais', 'tiposOperacoes', 'impostosFederais', 'tabelasTributarias', 'cenariosFiscais'],
    pessoa:     ['lojas', 'clientes', 'fornecedores'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Executa UM step individual no backend e vincula progresso ao uiElement.
 */
async function _runStep(dominio, step, uiElement) {
    try {
        const jobId = await JobClient.start(dominio, step);
        JobProgress.track(jobId, uiElement);

        await new Promise((resolve) => {
            const unsub = JobClient.subscribe(jobId, (event) => {
                if (['job:completed', 'job:error', 'job:cancelled'].includes(event)) {
                    unsub();
                    resolve();
                }
            });
        });

        await _refreshStats();
    } catch (err) {
        UI.status.updateImport(uiElement, 'error', `Erro: ${err.message}`);
        UI.log(`❌ ${step}: ${err.message}`, 'error');
        throw err;
    }
}

/**
 * "Importar Tudo" — executa cada step do domínio individualmente em sequência.
 * Cada botão individual do painel é atualizado conforme seu step roda.
 * NÃO cria um job bulk — chama _runStep() para cada item.
 *
 * @param {string}  dominio
 * @param {Element} tabPanel  — .tab-panel da aba (para localizar os import-items)
 * @param {Element} bulkBtn   — botão "Importar Tudo" (desabilitado durante execução)
 */
async function _runDominio(dominio, tabPanel, bulkBtn) {
    const steps = DOMINIO_STEPS[dominio];
    if (!steps || steps.length === 0) {
        UI.log(`⚠️ Domínio desconhecido: ${dominio}`, 'warning');
        return;
    }

    if (bulkBtn) bulkBtn.disabled = true;
    UI.log(`🚀 Iniciando importação de ${steps.length} grupos: ${dominio}`, 'info');

    let ok = 0, fail = 0;

    for (const step of steps) {
        // Localiza o import-item correspondente ao step no painel
        const selector = STEP_TO_ACTION[step];
        const btn       = selector && tabPanel ? tabPanel.querySelector(selector) : null;
        const uiElement = btn?.closest('.import-item') ?? null;

        try {
            await _runStep(dominio, step, uiElement);
            ok++;
        } catch (err) {
            fail++;
            UI.log(`⚠️ ${step} falhou (continuando...): ${err.message}`, 'warning');
            // Continua para o próximo step mesmo com erro
        }
    }

    if (bulkBtn) bulkBtn.disabled = false;

    if (fail === 0) {
        UI.log(`✅ Importação completa: ${ok} grupos importados com sucesso`, 'success');
    } else {
        UI.log(`⚠️ Importação finalizada: ${ok} OK — ${fail} com erro`, 'warning');
    }

    await _refreshStats();
}

/**
 * Mapa step name → seletor data-action do botão no HTML.
 * Usado por _runDominio para encontrar o import-item de cada step.
 */
const STEP_TO_ACTION = {
    mercadologia:          '[data-action="importar-mercadologia"]',
    marcas:                '[data-action="importar-marcas"]',
    familias:              '[data-action="importar-familias"]',
    produtos:              '[data-action="importar-produtos"]',
    produtoAuxiliares:     '[data-action="importar-produto-auxiliares"]',
    produtoFornecedores:   '[data-action="importar-produto-fornecedores"]',
    categorias:            '[data-action="importar-categorias"]',
    agentes:               '[data-action="importar-agentes"]',
    contasCorrentes:       '[data-action="importar-contas-correntes"]',
    especiesDocumento:     '[data-action="importar-especies-documento"]',
    historicoPadrao:       '[data-action="importar-historico-padrao"]',
    formasPagamento:       '[data-action="importar-formas-pagamento"]',
    pagamentosPDV:         '[data-action="importar-pagamentos-pdv"]',
    recebimentosPDV:       '[data-action="importar-recebimentos-pdv"]',
    motivosDesconto:       '[data-action="importar-motivos-desconto"]',
    motivosDevolucao:      '[data-action="importar-motivos-devolucao"]',
    motivosCancelamento:   '[data-action="importar-motivos-cancelamento"]',
    localEstoque:          '[data-action="importar-local-estoque"]',
    tiposAjustes:          '[data-action="importar-tipos-ajustes"]',
    saldoEstoque:          '[data-action="importar-saldo-estoque"]',
    regimeTributario:      '[data-action="importar-regime-tributario"]',
    situacoesFiscais:      '[data-action="importar-situacoes-fiscais"]',
    tiposOperacoes:        '[data-action="importar-tipos-operacoes"]',
    impostosFederais:      '[data-action="importar-impostos-federais"]',
    tabelasTributarias:    '[data-action="importar-tabelas-tributarias"]',
    cenariosFiscais:       '[data-action="importar-cenarios-fiscais"]',
    lojas:                 '[data-action="importar-lojas"]',
    clientes:              '[data-action="importar-clientes"]',
    fornecedores:          '[data-action="importar-fornecedores"]',
};

async function _refreshStats() {
    try {
        const stats = await db.getStatistics();
        if (stats) UI.statistics.update(stats);
    } catch (err) {
        console.warn('⚠️ Erro ao atualizar estatísticas:', err.message);
    }
}

// ─── API Pública ──────────────────────────────────────────────────────────────

const Importacao = {

    async atualizarEstatisticas() { return _refreshStats(); },

    // ── PRODUTO ──────────────────────────────────────────────────────────────
    importarMercadologia:        (el) => _runStep('produto', 'mercadologia',        el),
    importarMarcas:              (el) => _runStep('produto', 'marcas',              el),
    importarFamilias:            (el) => _runStep('produto', 'familias',            el),
    importarProdutos:            (el) => _runStep('produto', 'produtos',            el),
    importarProdutoAuxiliares:   (el) => _runStep('produto', 'produtoAuxiliares',   el),
    importarProdutoFornecedores: (el) => _runStep('produto', 'produtoFornecedores', el),

    // ── FINANCEIRO ───────────────────────────────────────────────────────────
    importarCategorias:          (el) => _runStep('financeiro', 'categorias',        el),
    importarAgentes:             (el) => _runStep('financeiro', 'agentes',           el),
    importarContasCorrentes:     (el) => _runStep('financeiro', 'contasCorrentes',   el),
    importarEspeciesDocumento:   (el) => _runStep('financeiro', 'especiesDocumento', el),
    importarHistoricoPadrao:     (el) => _runStep('financeiro', 'historicoPadrao',   el),
    importarFormasPagamento:     (el) => _runStep('financeiro', 'formasPagamento',   el),

    // ── FRENTE DE LOJA / PDV ─────────────────────────────────────────────────
    importarPagamentosPDV:       (el) => _runStep('frenteLoja', 'pagamentosPDV',       el),
    importarRecebimentosPDV:     (el) => _runStep('frenteLoja', 'recebimentosPDV',     el),
    importarMotivosDesconto:     (el) => _runStep('frenteLoja', 'motivosDesconto',     el),
    importarMotivosDevolucao:    (el) => _runStep('frenteLoja', 'motivosDevolucao',    el),
    importarMotivosCancelamento: (el) => _runStep('frenteLoja', 'motivosCancelamento', el),

    // ── ESTOQUE ──────────────────────────────────────────────────────────────
    importarLocalEstoque:        (el) => _runStep('estoque', 'localEstoque', el),
    importarTiposAjustes:        (el) => _runStep('estoque', 'tiposAjustes', el),
    importarSaldoEstoque:        (el) => _runStep('estoque', 'saldoEstoque', el),

    // ── FISCAL ───────────────────────────────────────────────────────────────
    importarRegimeTributario:    (el) => _runStep('fiscal', 'regimeTributario',    el),
    importarSituacoesFiscais:    (el) => _runStep('fiscal', 'situacoesFiscais',    el),
    importarTiposOperacoes:      (el) => _runStep('fiscal', 'tiposOperacoes',      el),
    importarImpostosFederais:    (el) => _runStep('fiscal', 'impostosFederais',    el),
    importarTabelasTributarias:  (el) => _runStep('fiscal', 'tabelasTributarias',  el),
    importarCenariosFiscais:     (el) => _runStep('fiscal', 'cenariosFiscais',     el),

    // ── PESSOA ────────────────────────────────────────────────────────────────
    importarLojas:               (el) => _runStep('pessoa', 'lojas',        el),
    importarClientes:            (el) => _runStep('pessoa', 'clientes',     el),
    importarFornecedores:        (el) => _runStep('pessoa', 'fornecedores', el),

    /**
     * "Importar Tudo" — executa steps individuais do domínio em sequência.
     * O botão bulk delega para os mesmos _runStep() dos botões individuais.
     */
    importarTudo(dominio, tabPanel, bulkBtn) {
        return _runDominio(dominio, tabPanel, bulkBtn);
    },
};

export default Importacao;