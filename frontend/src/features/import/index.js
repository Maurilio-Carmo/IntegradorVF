// frontend/src/features/import/index.js
// ─── VERSÃO REFATORADA ────────────────────────────────────────────────────────
//
// ANTES (padrão antigo):
//   Cada método chamava um importer específico que fazia fetch direto à API
//   no browser. Exemplo: ProdutoImporter.importarMarcas() → fetch(API)
//   ⚠️ Problema: reload da página matava o processo.
//
// DEPOIS (padrão novo — backend-driven):
//   Cada método dispara um job no backend via JobClient.start(dominio, step)
//   e conecta o JobProgress para atualizar a UI via SSE.
//   ✅ O processo continua rodando no servidor mesmo após reload.
//
// INTERFACE PÚBLICA: compatível com o uso existente em button-manager.js
//   Todos os métodos ainda aceitam `uiElement` (o .import-item)
//   para que o button-manager não precise mudar.
//
// ─────────────────────────────────────────────────────────────────────────────

import JobClient   from './job-client.js';
import JobProgress from './job-progress.js';
import DatabaseClient from '../../services/database/db-client.js';
import UI from '../../ui/ui.js';

const db = new DatabaseClient();

// ─── Helper interno ───────────────────────────────────────────────────────────

/**
 * Inicia um job de etapa única e vincula o progresso ao uiElement.
 *
 * @param {string}  dominio
 * @param {string}  step      - nome da etapa (ex: 'marcas', 'produtos')
 * @param {Element} uiElement - .import-item associado ao botão
 */
async function _runStep(dominio, step, uiElement) {
    try {
        const jobId = await JobClient.start(dominio, step);
        JobProgress.track(jobId, uiElement);

        // Aguarda conclusão para atualizar estatísticas
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
 * Inicia um job de domínio completo ("Importar Tudo") e vincula o progresso.
 *
 * @param {string}  dominio
 * @param {Element} tabPanel - .tab-panel que contém os import-items
 * @param {Element} bulkBtn  - Botão "Importar Tudo"
 */
async function _runDominio(dominio, tabPanel, bulkBtn) {
    try {
        const jobId = await JobClient.start(dominio);
        JobProgress.trackBulk(jobId, tabPanel, bulkBtn);

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
        if (bulkBtn) bulkBtn.disabled = false;
        UI.log(`❌ Falha ao importar ${dominio}: ${err.message}`, 'error');
        throw err;
    }
}

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

    // ── Estatísticas ─────────────────────────────────────────────────────────

    async atualizarEstatisticas() {
        return await _refreshStats();
    },

    // ── PRODUTO ──────────────────────────────────────────────────────────────

    importarMercadologia:       (el) => _runStep('produto', 'mercadologia',       el),
    importarMarcas:             (el) => _runStep('produto', 'marcas',             el),
    importarFamilias:           (el) => _runStep('produto', 'familias',           el),
    importarProdutos:           (el) => _runStep('produto', 'produtos',           el),
    importarProdutoAuxiliares:  (el) => _runStep('produto', 'produtoAuxiliares',  el),
    importarProdutoFornecedores:(el) => _runStep('produto', 'produtoFornecedores',el),

    // ── FINANCEIRO ───────────────────────────────────────────────────────────

    importarCategorias:         (el) => _runStep('financeiro', 'categorias',         el),
    importarAgentes:            (el) => _runStep('financeiro', 'agentes',            el),
    importarContasCorrentes:    (el) => _runStep('financeiro', 'contasCorrentes',    el),
    importarEspeciesDocumento:  (el) => _runStep('financeiro', 'especiesDocumento',  el),
    importarHistoricoPadrao:    (el) => _runStep('financeiro', 'historicoPadrao',    el),
    importarFormasPagamento:    (el) => _runStep('financeiro', 'formasPagamento',    el),

    // ── FRENTE DE LOJA / PDV ─────────────────────────────────────────────────

    importarFormaPagamentoPDV:  (el) => _runStep('frenteLoja', 'formaPagamentoPDV',  el),
    importarMotivoCancelamento: (el) => _runStep('frenteLoja', 'motivoCancelamento', el),
    importarPerguntasRespostas: (el) => _runStep('frenteLoja', 'perguntasRespostas', el),

    // ── ESTOQUE ──────────────────────────────────────────────────────────────

    importarLocalEstoque:       (el) => _runStep('estoque', 'localEstoque',      el),
    importarTiposAjustes:       (el) => _runStep('estoque', 'tiposAjustes',      el),
    importarSaldoEstoque:       (el) => _runStep('estoque', 'saldoEstoque',      el),

    // ── FISCAL ───────────────────────────────────────────────────────────────

    importarImpostosFederais:   (el) => _runStep('fiscal', 'impostosFederais',   el),
    importarRegimeTributario:   (el) => _runStep('fiscal', 'regimeTributario',   el),
    importarSituacoesFiscais:   (el) => _runStep('fiscal', 'situacoesFiscais',   el),
    importarTiposOperacoes:     (el) => _runStep('fiscal', 'tiposOperacoes',     el),
    importarTabelasTributarias: (el) => _runStep('fiscal', 'tabelasTributarias', el),
    importarCenariosFiscais:    (el) => _runStep('fiscal', 'cenariosFiscais',    el),

    // ── PESSOA ────────────────────────────────────────────────────────────────

    importarLojas:              (el) => _runStep('pessoa', 'lojas',              el),
    importarClientes:           (el) => _runStep('pessoa', 'clientes',           el),
    importarFornecedores:       (el) => _runStep('pessoa', 'fornecedores',       el),

    // ── IMPORTAR TUDO (por domínio) ──────────────────────────────────────────

    /**
     * Importa todas as etapas de um domínio de uma vez.
     * Chamado pelos botões "🚀 Importar Tudo" de cada aba.
     *
     * @param {string}  dominio   - 'produto' | 'financeiro' | 'frenteLoja' | etc.
     * @param {Element} tabPanel  - .tab-panel da aba ativa
     * @param {Element} bulkBtn   - Botão "Importar Tudo" clicado
     */
    importarTudo(dominio, tabPanel, bulkBtn) {
        return _runDominio(dominio, tabPanel, bulkBtn);
    },
};

export default Importacao;