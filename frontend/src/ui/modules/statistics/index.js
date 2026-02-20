// frontend/src/ui/modules/statistics/index.js

/**
 * Statistics — Orquestrador
 *
 * Agrega os três submódulos e expõe a API pública usada pelo resto
 * da aplicação (UI, ImportBase, app-initializer).
 *
 * Quem importa este arquivo não precisa conhecer os submódulos.
 *
 * Submódulos internos:
 *  ├── stats-mapping.js   → mapeamento chave ↔ id DOM
 *  ├── stats-counter.js   → animação numérica (requestAnimationFrame)
 *  ├── stats-updater.js   → aplica stats ao DOM (numérico ou direto)
 *  └── stats-tabs.js      → visibilidade por aba (tabChanged)
 */

import { initTabVisibility, showSectionForTab }  from './stats-tabs.js';
import { updateStats, updateSingleStat }         from './stats-updater.js';
import { animateCounter }                        from './stats-counter.js';

export const Statistics = {

    /**
     * Inicializa o sistema de estatísticas.
     * Deve ser chamado uma única vez após os componentes estarem no DOM.
     *
     * @param {string} initialTab - Aba visível ao carregar (default: 'produto')
     */
    init(initialTab = 'produto') {
        initTabVisibility(initialTab);
    },

    /**
     * Atualiza todos os stat-cards com os dados recebidos.
     * Valores numéricos são animados; demais são atribuídos diretamente.
     *
     * @param {Object} stats   - ex: { secoes: 10, produtos: 1547, ... }
     * @param {number} duracao - Duração da animação em ms (default: 1200)
     */
    update(stats, duracao = 1200) {
        updateStats(stats, duracao);
    },

    /**
     * Atualiza um único stat-card pelo ID do elemento DOM.
     *
     * @param {string}        elementId
     * @param {number|string} valor
     * @param {boolean}       animate   - Animar se numérico (default: true)
     * @param {number}        duracao
     */
    updateOne(elementId, valor, animate = true, duracao = 1200) {
        updateSingleStat(elementId, valor, animate, duracao);
    },

    /**
     * Exibe manualmente a seção de uma aba específica.
     * Útil para forçar visibilidade sem disparar evento.
     *
     * @param {string} tabName
     */
    showForTab(tabName) {
        showSectionForTab(tabName);
    },

    /**
     * Anima diretamente um elemento pelo seu ID.
     * Mantém compatibilidade com chamadas legadas via UI.animarContador().
     *
     * @param {string} elementId
     * @param {number} valorFinal
     * @param {number} duracao
     */
    animateCounter(elementId, valorFinal, duracao = 1200) {
        animateCounter(elementId, valorFinal, duracao);
    },
};