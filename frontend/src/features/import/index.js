// frontend/src/features/import/index.js

import JobClient  from './job-client.js';
import DatabaseClient from '../../services/database/db-client.js';
import UI         from '../../ui/ui.js';

const db = new DatabaseClient();

// ─── Helpers internos ────────────────────────────────────────────────────────

/**
 * Inicia um job de importação para um domínio específico e aguarda conclusão.
 * O progresso é exibido pelo job-progress.js via eventos SSE.
 *
 * @param {string} dominio - ex: 'produto', 'financeiro', 'tudo'
 * @param {Element|null} uiElement - elemento DOM para feedback visual (opcional)
 * @returns {Promise<{success: boolean, dominio: string}>}
 */
async function _runDomain(dominio, uiElement = null) {
    try {
        if (uiElement) UI.setLoading(uiElement, true);

        const resultado = await JobClient.start(dominio, uiElement);

        await _atualizarEstatisticas();
        return { success: true, dominio, resultado };

    } catch (error) {
        console.error(`❌ Job falhou [${dominio}]:`, error.message);
        return { success: false, dominio, error: error.message };
    } finally {
        if (uiElement) UI.setLoading(uiElement, false);
    }
}

/**
 * Inicia um job de importação para um step individual dentro de um domínio.
 * Usado por botões granulares (ex: "Importar Marcas" isoladamente).
 *
 * O backend executa o step como parte do domínio pai.
 * Mapeamento de step → domínio para que o executor saiba o que rodar.
 *
 * @param {string} stepDominio - domínio que contém o step (ex: 'produto')
 * @param {Element|null} uiElement
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

// ─── API Pública ─────────────────────────────────────────────────────────────
//
// Cada método público corresponde a uma ação do button-manager.js.
// Todos delegam para _runDomain() ou _runStep() — sem lógica de API aqui.
//
// Nomes mantidos idênticos ao arquivo legado para não quebrar button-manager.js.

const Importacao = {

    // ── ESTATÍSTICAS ──────────────────────────────────────────────────────────

    async atualizarEstatisticas() {
        return _atualizarEstatisticas();
    },

    // ── MERCADOLOGIA (seções / grupos / subgrupos) ────────────────────────────

    async importarMercadologia(uiElement) {
        // O executor de 'produto' inclui seções, grupos e subgrupos
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

    /** Importa todos os sub-domínios do Produto em sequência */
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

    /** Importa todos os sub-domínios do Financeiro em sequência */
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

    /** Importa todos os sub-domínios do PDV em sequência */
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

    /** Importa todos os sub-domínios de Estoque em sequência */
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

    /** Importa todos os sub-domínios Fiscais em sequência */
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

    /** Importa todos os sub-domínios de Pessoa em sequência */
    async importarTudoPessoa(uiElement) {
        return _runDomain('pessoa', uiElement);
    },

    // ── IMPORTAÇÃO COMPLETA ───────────────────────────────────────────────────

    /**
     * Inicia o job de importação completa (todos os 7 domínios).
     * O executor `tudo` no backend já coordena a sequência correta.
     */
    async importarTudo(uiElement) {
        return _runDomain('tudo', uiElement);
    },
};

export default Importacao;