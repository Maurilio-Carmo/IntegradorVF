// frontend/src/ui/modules/statistics/stats-updater.js

/**
 * StatsUpdater
 *
 * Responsabilidade única: receber um objeto de estatísticas
 * e atualizar os elementos do DOM correspondentes.
 *
 * Para valores numéricos → delega para animateCounter.
 * Para valores não-numéricos (string, '-') → atribui diretamente.
 *
 * Não conhece abas, visibilidade nem lógica de animação interna.
 */

import { STATS_MAPPING }  from './stats-mapping.js';
import { animateCounter } from './stats-counter.js';

/**
 * Atualiza todos os stat-values com base no objeto de estatísticas.
 *
 * @param {Object} stats    - ex: { secoes: 10, produtos: 1547, ... }
 * @param {number} duracao  - Duração da animação em ms (default: 1200)
 */
export function updateStats(stats, duracao = 1200) {
    for (const [key, elementId] of Object.entries(STATS_MAPPING)) {
        const valor = stats[key];
        if (valor === undefined) continue;

        if (typeof valor === 'number' && Number.isFinite(valor)) {
            animateCounter(elementId, valor, duracao);
        } else {
            _setDirect(elementId, valor);
        }
    }
}

/**
 * Atualiza um único stat-value por ID de elemento.
 * Útil para atualizações pontuais sem reprocessar tudo.
 *
 * @param {string} elementId
 * @param {number|string} valor
 * @param {boolean} animate
 * @param {number} duracao
 */
export function updateSingleStat(elementId, valor, animate = true, duracao = 1200) {
    if (animate && typeof valor === 'number') {
        animateCounter(elementId, valor, duracao);
    } else {
        _setDirect(elementId, valor);
    }
}

// ─── Helper privado ───────────────────────────────────────────────────────────

function _setDirect(elementId, valor) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = valor ?? '-';
}