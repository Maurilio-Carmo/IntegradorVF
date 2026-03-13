// frontend/src/ui/modules/statistics/stats-counter.js

/**
 * StatsCounter
 *
 * Responsabilidade única: animar um elemento `.stat-value`
 * de um valor inicial até um valor final com easing ease-out.
 *
 * Não conhece mapeamentos, abas nem DOM além do elemento alvo.
 */

/** Registro de animações em curso — evita colisões no mesmo elemento */
const _activeAnimations = {};

/**
 * Anima o conteúdo de um elemento do valor atual até `valorFinal`.
 *
 * @param {string} elementId  - ID do elemento no DOM
 * @param {number} valorFinal - Valor alvo (inteiro)
 * @param {number} duracao    - Duração em ms (default: 1200)
 */
export function animateCounter(elementId, valorFinal, duracao = 1200) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Cancela animação anterior no mesmo elemento
    if (_activeAnimations[elementId]) {
        cancelAnimationFrame(_activeAnimations[elementId]);
    }

    const valorInicial = _parseCurrentValue(el);

    if (valorInicial === valorFinal) {
        el.textContent = _format(valorFinal);
        _setState(el, false);
        return;
    }

    const diferenca = valorFinal - valorInicial;
    const startTime = performance.now();

    _setState(el, true);

    const step = (agora) => {
        const progresso = Math.min((agora - startTime) / duracao, 1);
        const eased     = _easeOutCubic(progresso);
        const valor     = Math.round(valorInicial + diferenca * eased);

        el.textContent = _format(valor);

        if (progresso < 1) {
            _activeAnimations[elementId] = requestAnimationFrame(step);
        } else {
            el.textContent = _format(valorFinal);   // garante exatidão
            _setState(el, false);
            delete _activeAnimations[elementId];
        }
    };

    _activeAnimations[elementId] = requestAnimationFrame(step);
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

/** Lê o número atualmente exibido no elemento (remove separadores). */
function _parseCurrentValue(el) {
    return parseInt(el.textContent.replace(/\D/g, '')) || 0;
}

/** Formata número com separador de milhar em pt-BR. */
function _format(valor) {
    return valor.toLocaleString('pt-BR');
}

/** Easing ease-out cúbico: acelera no início, desacelera no final. */
function _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/** Alterna as classes CSS de estado do elemento. */
function _setState(el, counting) {
    el.classList.toggle('stat-value--counting', counting);
    el.classList.toggle('stat-value--done',     !counting);
}