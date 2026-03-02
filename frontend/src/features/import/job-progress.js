// frontend/src/features/import/job-progress.js

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * JobProgress — Controlador de UI para Jobs de Importação
 *
 * RESPONSABILIDADE:
 *   Traduzir eventos SSE do JobClient em atualizações visuais nos
 *   elementos do DOM (progress bars, status labels, botões, log).
 *
 *   Separa completamente "receber dado" (JobClient) de "mostrar dado" (este módulo).
 *
 * USO:
 *   import JobProgress from './job-progress.js';
 *
 *   // Ao clicar no botão "Importar Marcas":
 *   const jobId = await JobClient.start('produto', 'marcas');
 *   JobProgress.track(jobId, uiElement);
 *
 *   // Para "Importar Tudo — Produto":
 *   const jobId = await JobClient.start('produto');
 *   JobProgress.trackBulk(jobId, tabPanel);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import JobClient from './job-client.js';
import UI        from '../../ui/ui.js';

// ─── Mapeamento step name → seletor do import-item no DOM ─────────────────────
// Permite que trackBulk encontre o card correto para cada etapa do job.
const STEP_SELECTOR = {
    secoes:                '[data-action="importar-mercadologia"]',
    grupos:                '[data-action="importar-mercadologia"]',
    subgrupos:             '[data-action="importar-mercadologia"]',
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
    localEstoque:          '[data-action="importar-local-estoque"]',
    tiposAjustes:          '[data-action="importar-tipos-ajustes"]',
    saldoEstoque:          '[data-action="importar-saldo-estoque"]',
    impostosFederais:      '[data-action="importar-impostos-federais"]',
    regimeTributario:      '[data-action="importar-regime-tributario"]',
    situacoesFiscais:      '[data-action="importar-situacoes-fiscais"]',
    tiposOperacoes:        '[data-action="importar-tipos-operacoes"]',
    tabelasTributarias:    '[data-action="importar-tabelas-tributarias"]',
    cenariosFiscais:       '[data-action="importar-cenarios-fiscais"]',
    formaPagamentoPDV:     '[data-action="importar-forma-pagamento-pdv"]',
    motivoCancelamento:    '[data-action="importar-motivo-cancelamento"]',
    perguntasRespostas:    '[data-action="importar-perguntas-respostas"]',
    lojas:                 '[data-action="importar-lojas"]',
    clientes:              '[data-action="importar-clientes"]',
    fornecedores:          '[data-action="importar-fornecedores"]',
};

// ─── Helpers de DOM ───────────────────────────────────────────────────────────

/**
 * Atualiza a barra de progresso de um import-item.
 * @param {Element} container - O .import-item
 * @param {number}  pct       - 0–100, ou null para indeterminado
 */
function _setProgress(container, pct) {
    if (!container) return;
    const fill = container.querySelector('.import-item-progress-fill');
    if (!fill) return;

    if (pct === null) {
        fill.style.width = '40%';
        fill.style.animation = 'progressIndeterminate 1.2s ease-in-out infinite';
    } else {
        fill.style.animation = 'none';
        fill.style.width     = `${pct}%`;
    }
}

/**
 * Atualiza o label de status de um import-item.
 * @param {Element} container
 * @param {'idle'|'loading'|'success'|'error'} state
 * @param {string}  text
 */
function _setStatus(container, state, text) {
    if (!container) return;
    UI.status.updateImport(container, state, text);
}

/**
 * Desabilita ou habilita o botão de importação dentro de um import-item.
 * @param {Element} container
 * @param {boolean} disabled
 */
function _setButtonDisabled(container, disabled) {
    if (!container) return;
    const btn = container.querySelector('.btn');
    if (btn) btn.disabled = disabled;
}

// ─── API Pública ──────────────────────────────────────────────────────────────

const JobProgress = {

    /**
     * Rastreia um job de etapa única e atualiza o import-item correspondente.
     *
     * @param {string}  jobId     - ID do job retornado por JobClient.start()
     * @param {Element} container - O elemento .import-item do botão clicado
     * @returns {Function} unsubscribe
     */
    track(jobId, container) {
        _setStatus(container, 'loading', 'Iniciando...');
        _setProgress(container, null);
        _setButtonDisabled(container, true);

        const unsub = JobClient.subscribe(jobId, (event, data) => {
            switch (event) {
                case 'job:snapshot':
                case 'job:started':
                    _setStatus(container, 'loading', 'Processando...');
                    _setProgress(container, null);
                    UI.log(`▶ ${data.label ?? 'Job'} iniciado`, 'info');
                    break;

                case 'step:progress': {
                    const label = data.pct !== null
                        ? `${data.processed.toLocaleString()} / ${data.total.toLocaleString()} (${data.pct}%)`
                        : `${data.processed.toLocaleString()} registros...`;
                    _setStatus(container, 'loading', label);
                    _setProgress(container, data.pct);
                    break;
                }

                case 'step:completed':
                    _setStatus(container, 'success', `${data.total.toLocaleString()} registros importados`);
                    _setProgress(container, 100);
                    UI.log(`✅ ${data.stepLabel}: ${data.total.toLocaleString()} registros`, 'success');
                    break;

                case 'step:error':
                    _setStatus(container, 'error', `Erro: ${data.errorMsg}`);
                    _setProgress(container, 0);
                    UI.log(`❌ ${data.step}: ${data.errorMsg}`, 'error');
                    break;

                case 'job:completed':
                    _setButtonDisabled(container, false);
                    UI.log('✅ Importação concluída com sucesso!', 'success');
                    unsub();
                    break;

                case 'job:error':
                    _setStatus(container, 'error', `Falha: ${data.errorMsg}`);
                    _setButtonDisabled(container, false);
                    UI.log(`❌ Falha na importação: ${data.errorMsg}`, 'error');
                    unsub();
                    break;

                case 'job:cancelled':
                    _setStatus(container, 'idle', 'Cancelado');
                    _setButtonDisabled(container, false);
                    unsub();
                    break;
            }
        });

        return unsub;
    },

    /**
     * Rastreia um job de múltiplas etapas ("Importar Tudo") e atualiza
     * cada import-item individualmente dentro de um painel de aba.
     *
     * @param {string}  jobId     - ID do job
     * @param {Element} tabPanel  - O .tab-panel ativo (container das abas)
     * @param {Element} bulkBtn   - Botão "Importar Tudo" para desabilitar
     * @returns {Function} unsubscribe
     */
    trackBulk(jobId, tabPanel, bulkBtn) {
        if (bulkBtn) bulkBtn.disabled = true;

        UI.log('🚀 Importação em lote iniciada no servidor...', 'info');

        // Mapa de stepName → container DOM (resolvido sob demanda)
        const _resolveContainer = (stepName) => {
            const selector = STEP_SELECTOR[stepName];
            if (!selector || !tabPanel) return null;
            // Sobe do botão até o .import-item pai
            const btn = tabPanel.querySelector(selector);
            return btn?.closest('.import-item') ?? null;
        };

        // Snapshot inicial — restaura estado ao reconectar
        const _applySnapshot = (job) => {
            for (const step of job.steps ?? []) {
                const el = _resolveContainer(step.name);
                if (!el) continue;

                switch (step.status) {
                    case 'running':
                        _setStatus(el, 'loading', 'Processando...');
                        _setProgress(el, null);
                        _setButtonDisabled(el, true);
                        break;
                    case 'completed':
                        _setStatus(el, 'success', `${step.total.toLocaleString()} registros`);
                        _setProgress(el, 100);
                        _setButtonDisabled(el, false);
                        break;
                    case 'error':
                        _setStatus(el, 'error', `Erro: ${step.error}`);
                        _setButtonDisabled(el, false);
                        break;
                }
            }
        };

        const unsub = JobClient.subscribe(jobId, (event, data) => {
            switch (event) {
                case 'job:snapshot':
                    _applySnapshot(data);
                    break;

                case 'job:started':
                    UI.log(`▶ ${data.label ?? 'Importação'} iniciada no servidor`, 'info');
                    break;

                case 'step:progress': {
                    const el = _resolveContainer(data.step);
                    if (!el) break;
                    _setButtonDisabled(el, true);
                    const label = data.pct !== null
                        ? `${data.processed.toLocaleString()} / ${data.total.toLocaleString()} (${data.pct}%)`
                        : `${data.processed.toLocaleString()} registros...`;
                    _setStatus(el, 'loading', label);
                    _setProgress(el, data.pct);
                    break;
                }

                case 'step:completed': {
                    const el = _resolveContainer(data.step);
                    if (el) {
                        _setStatus(el, 'success', `${data.total.toLocaleString()} registros`);
                        _setProgress(el, 100);
                        _setButtonDisabled(el, false);
                    }
                    UI.log(`✅ ${data.stepLabel}: ${data.total.toLocaleString()} registros`, 'success');
                    break;
                }

                case 'step:error': {
                    const el = _resolveContainer(data.step);
                    if (el) {
                        _setStatus(el, 'error', `Erro: ${data.errorMsg}`);
                        _setButtonDisabled(el, false);
                    }
                    UI.log(`❌ ${data.step}: ${data.errorMsg}`, 'error');
                    break;
                }

                case 'job:completed':
                    if (bulkBtn) bulkBtn.disabled = false;
                    UI.log('✅ Importação em lote concluída!', 'success');
                    unsub();
                    break;

                case 'job:error':
                    if (bulkBtn) bulkBtn.disabled = false;
                    UI.log(`❌ Falha na importação em lote: ${data.errorMsg}`, 'error');
                    unsub();
                    break;

                case 'job:cancelled':
                    if (bulkBtn) bulkBtn.disabled = false;
                    UI.log('⚠️ Importação cancelada', 'warning');
                    unsub();
                    break;
            }
        });

        return unsub;
    },

    /**
     * Reconecta a UI a jobs ativos encontrados no boot.
     * Chamado por AppInitializer após verificar /api/import-job/active.
     *
     * @param {ImportJob[]} jobs - Jobs retornados por JobClient.reconnectIfActive()
     */
    restoreActiveJobs(jobs) {
        for (const job of jobs) {
            if (job.status !== 'running' && job.status !== 'pending') continue;

            const tabPanel = document.querySelector(
                `.tab-panel[data-panel="${job.dominio}"]`
            );

            const bulkBtn = tabPanel?.querySelector(
                `[id^="btnImportarTudo"]`
            );

            if (tabPanel) {
                UI.log(`🔄 Reconectando à importação em andamento: ${job.label}`, 'info');
                this.trackBulk(job.id, tabPanel, bulkBtn);
            }
        }
    },
};

export default JobProgress;