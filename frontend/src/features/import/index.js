// frontend/src/features/import/index.js
//
// ─── CORREÇÃO CRÍTICA ─────────────────────────────────────────────────────────
//
// ERRO: UI.setLoading is not a function
//
// CAUSA RAIZ:
//   _runDomain chamava UI.setLoading(uiElement, true/false) — método que
//   não existe no objeto UI. O UI usa UI.status.updateImport() internamente,
//   e toda a atualização visual de jobs é responsabilidade do JobProgress.
//
//   Adicionalmente, JobClient.start(dominio) só aceita 1 argumento (domínio).
//   Passar uiElement como 2º argumento era silenciosamente ignorado.
//
// ARQUITETURA CORRETA:
//   JobClient.start(dominio)            → retorna jobId (string) imediatamente
//   JobProgress.track(jobId, container) → atualiza o .import-item via SSE
//   JobProgress.trackBulk(jobId, panel) → atualiza múltiplos items via SSE
//
//   _runDomain deve:
//     1. Chamar JobClient.start(dominio)            → obtém jobId
//     2. Subscrever job:completed/error              → para saber quando terminou
//     3. Chamar JobProgress.track/trackBulk          → delega atualização de UI
//     4. Aguardar completionPromise                  → bloqueia até concluir
//     5. Atualizar estatísticas                      → só após conclusão
//
// DISTINÇÃO bulk vs individual:
//   - uiElement com classe 'tab-panel' → é o painel inteiro → trackBulk
//   - uiElement com classe 'import-item' → é um card individual → track
//   - uiElement null → sem feedback visual (ex: chamada programática)
//
// ─────────────────────────────────────────────────────────────────────────────

import JobClient    from './job-client.js';
import JobProgress  from './job-progress.js';
import DatabaseClient from '../../services/database/db-client.js';
import UI           from '../../ui/ui.js';

const db = new DatabaseClient();

// ─── Helpers internos ────────────────────────────────────────────────────────

/**
 * Inicia um job no backend e aguarda sua conclusão.
 *
 * O progresso visual é gerenciado pelo JobProgress via eventos SSE:
 *   - uiElement = .import-item  → JobProgress.track()     (botão individual)
 *   - uiElement = .tab-panel    → JobProgress.trackBulk() (Importar Tudo)
 *   - uiElement = null          → sem feedback visual
 *
 * @param {string}       dominio   - 'produto' | 'financeiro' | 'pdv' | ... | 'tudo'
 * @param {Element|null} uiElement - elemento DOM para feedback (import-item ou tab-panel)
 * @returns {Promise<{success: boolean, dominio: string, error?: string}>}
 */
async function _runDomain(dominio, uiElement = null) {
    let jobId;

    // 1. Iniciar job no backend
    try {
        jobId = await JobClient.start(dominio);
    } catch (error) {
        // Falha antes mesmo de criar o job (credenciais, rede, etc.)
        console.error(`❌ Falha ao iniciar job [${dominio}]:`, error.message);
        if (uiElement) {
            UI.status.updateImport(uiElement, 'error', error.message);
        }
        return { success: false, dominio, error: error.message };
    }

    // 2. Criar promise que resolve quando o job terminar
    //    Deve ser criada ANTES do track() para não perder eventos em jobs rápidos
    const completionPromise = new Promise((resolve, reject) => {
        const unsub = JobClient.subscribe(jobId, (event, data) => {
            if (event === 'job:completed') {
                unsub();
                resolve();
            } else if (event === 'job:error') {
                unsub();
                reject(new Error(data?.errorMsg ?? 'Erro na importação'));
            } else if (event === 'job:cancelled') {
                unsub();
                reject(new Error('Importação cancelada'));
            }
        });
    });

    // 3. Delegar feedback visual ao JobProgress (sem chamar UI diretamente)
    if (uiElement) {
        const isBulkPanel = uiElement.classList.contains('tab-panel');

        if (isBulkPanel) {
            // Painel inteiro: atualiza cada import-item dentro da aba
            JobProgress.trackBulk(jobId, uiElement);
        } else {
            // Card individual (.import-item): atualiza só aquele elemento
            JobProgress.track(jobId, uiElement);
        }
    }

    // 4. Aguardar conclusão
    try {
        await completionPromise;
        await _atualizarEstatisticas();
        return { success: true, dominio };

    } catch (error) {
        console.error(`❌ Job falhou [${dominio}]:`, error.message);
        return { success: false, dominio, error: error.message };
    }
}

/**
 * Alias de _runDomain — usado quando o chamador quer deixar explícito
 * que está executando um step individual (semântica, não lógica diferente).
 */
async function _runStep(stepDominio, uiElement = null) {
    return _runDomain(stepDominio, uiElement);
}

async function _atualizarEstatisticas() {
    try {
        const stats = await db.getStatistics();
        if (stats) UI.statistics.update(stats);
        return stats;
    } catch (error) {
        console.error('❌ Erro ao atualizar estatísticas:', error);
    }
}

// ─── API Pública ──────────────────────────────────────────────────────────────
//
// Cada método público corresponde a uma ação do button-manager.js.
// Nomes mantidos idênticos ao legado para não quebrar button-manager.js.
//
// Botões individuais   → recebem .import-item como uiElement → track()
// Botões "Importar Tudo" → recebem .tab-panel como uiElement → trackBulk()

const Importacao = {

    // ── ESTATÍSTICAS ──────────────────────────────────────────────────────────

    async atualizarEstatisticas() {
        return _atualizarEstatisticas();
    },

    // ── MERCADOLOGIA ──────────────────────────────────────────────────────────

    async importarMercadologia(uiElement) {
        return _runDomain('produto', uiElement);
    },

    // ── PRODUTO ───────────────────────────────────────────────────────────────

    async importarMarcas(uiElement) {
        return _runDomain('produto', uiElement);
    },

    async importarFamilias(uiElement) {
        return _runDomain('produto', uiElement);
    },

    async importarProdutos(uiElement) {
        return _runDomain('produto', uiElement);
    },

    async importarProdutoAuxiliares(uiElement) {
        return _runDomain('produto', uiElement);
    },

    async importarProdutoFornecedores(uiElement) {
        return _runDomain('produto', uiElement);
    },

    async importarTudoProduto(uiElement) {
        return _runDomain('produto', uiElement);
    },

    // ── FINANCEIRO ────────────────────────────────────────────────────────────

    async importarCategorias(uiElement) {
        return _runDomain('financeiro', uiElement);
    },

    async importarAgentes(uiElement) {
        return _runDomain('financeiro', uiElement);
    },

    async importarContasCorrentes(uiElement) {
        return _runDomain('financeiro', uiElement);
    },

    async importarEspeciesDocumento(uiElement) {
        return _runDomain('financeiro', uiElement);
    },

    async importarHistoricoPadrao(uiElement) {
        return _runDomain('financeiro', uiElement);
    },

    async importarTudoFinanceiro(uiElement) {
        return _runDomain('financeiro', uiElement);
    },

    // ── PDV / FRENTE DE LOJA ──────────────────────────────────────────────────

    async importarFormasPagamento(uiElement) {
        return _runDomain('pdv', uiElement);
    },

    async importarPagamentosPDV(uiElement) {
        return _runDomain('pdv', uiElement);
    },

    async importarRecebimentosPDV(uiElement) {
        return _runDomain('pdv', uiElement);
    },

    async importarMotivosDesconto(uiElement) {
        return _runDomain('pdv', uiElement);
    },

    async importarMotivosDevolucao(uiElement) {
        return _runDomain('pdv', uiElement);
    },

    async importarMotivosCancelamento(uiElement) {
        return _runDomain('pdv', uiElement);
    },

    async importarTudoPdv(uiElement) {
        return _runDomain('pdv', uiElement);
    },

    // ── ESTOQUE ───────────────────────────────────────────────────────────────

    async importarLocalEstoque(uiElement) {
        return _runDomain('estoque', uiElement);
    },

    async importarTiposAjustes(uiElement) {
        return _runDomain('estoque', uiElement);
    },

    async importarSaldoEstoque(uiElement) {
        return _runDomain('estoque', uiElement);
    },

    async importarTudoEstoque(uiElement) {
        return _runDomain('estoque', uiElement);
    },

    // ── FISCAL ────────────────────────────────────────────────────────────────

    async importarRegimeTributario(uiElement) {
        return _runDomain('fiscal', uiElement);
    },

    async importarSituacoesFiscais(uiElement) {
        return _runDomain('fiscal', uiElement);
    },

    async importarTiposOperacoes(uiElement) {
        return _runDomain('fiscal', uiElement);
    },

    async importarImpostosFederais(uiElement) {
        return _runDomain('fiscal', uiElement);
    },

    async importarTabelasTributarias(uiElement) {
        return _runDomain('fiscal', uiElement);
    },

    async importarCenariosFiscais(uiElement) {
        return _runDomain('fiscal', uiElement);
    },

    async importarTudoFiscal(uiElement) {
        return _runDomain('fiscal', uiElement);
    },

    // ── PESSOA ────────────────────────────────────────────────────────────────

    async importarLojas(uiElement) {
        return _runDomain('pessoa', uiElement);
    },

    async importarClientes(uiElement) {
        return _runDomain('pessoa', uiElement);
    },

    async importarFornecedores(uiElement) {
        return _runDomain('pessoa', uiElement);
    },

    async importarTudoPessoa(uiElement) {
        return _runDomain('pessoa', uiElement);
    },

    // ── IMPORTAÇÃO COMPLETA ───────────────────────────────────────────────────

    async importarTudo(uiElement) {
        return _runDomain('tudo', uiElement);
    },
};

export default Importacao;