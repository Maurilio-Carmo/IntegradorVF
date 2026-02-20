// frontend/src/ui/modules/statistics/stats-tabs.js

/**
 * StatsTabs
 *
 * Responsabilidade única: controlar qual .stats-section
 * está visível de acordo com a aba ativa.
 *
 * Escuta o evento 'tabChanged' emitido pelo TabNavigator
 * e não conhece nada sobre valores ou animações.
 */

/**
 * Inicializa o listener de mudança de aba.
 *
 * @param {string} initialTab - Aba visível ao carregar (default: 'produto')
 */
export function initTabVisibility(initialTab = 'produto') {
    document.addEventListener('tabChanged', (e) => {
        showSectionForTab(e.detail?.tab);
    });

    showSectionForTab(initialTab);
}

/**
 * Exibe apenas a .stats-section cujo [data-tab] corresponde à aba ativa.
 * Usa classes CSS em vez de `display` inline para permitir transições.
 *
 * @param {string} tabName - Valor do atributo data-tab da aba selecionada
 */
export function showSectionForTab(tabName) {
    if (!tabName) return;

    document.querySelectorAll('.stats-section[data-tab]').forEach(section => {
        const isActive = section.dataset.tab === tabName;
        section.classList.toggle('stats-section--active', isActive);
        section.classList.toggle('stats-section--hidden', !isActive);
    });
}