// frontend/src/ui/tabs/tab-navigator.js

/**
 * Gerenciador de Navegação entre Tabs
 * Responsabilidade única: trocar abas ativas na UI
 *
 * Emite o evento customizado 'tabChanged' no document
 * para que outros módulos (ex: Statistics) possam reagir.
 */

import { TABS } from '../../config/constants.js';

export class TabNavigator {

    constructor() {
        this.activeTab  = TABS.PRODUTO;
        this.tabButtons = [];
        this.tabPanels  = [];
    }

    // Público

    /**
     * Inicializar navegação
     */
    init() {
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabPanels  = document.querySelectorAll('.tab-panel');

        if (!this.tabButtons.length) {
            console.warn('⚠️ Nenhum botão de tab encontrado');
            return;
        }

        this._setupListeners();

        // Sincronizar stats com a aba já ativa no HTML
        this._emitTabChanged(this.activeTab);

        console.log(`✅ TabNavigator inicializado (${this.tabButtons.length} abas)`);
    }

    /**
     * Trocar para uma aba específica
     * @param {string} targetTab - Valor de data-tab do botão clicado
     */
    switchTo(targetTab) {
        if (!targetTab || targetTab === this.activeTab) return;

        // Atualizar botões
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === targetTab);
        });

        // Atualizar painéis
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === targetTab);
        });

        this.activeTab = targetTab;
        console.log(`📑 Tab ativa: ${targetTab}`);

        // Notificar outros módulos (Statistics, etc.)
        this._emitTabChanged(targetTab);
    }

    /**
     * Obter tab ativa
     * @returns {string}
     */
    getActive() {
        return this.activeTab;
    }

    // Privado

    _setupListeners() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTo(btn.dataset.tab));
        });
    }

    /**
     * Emite evento customizado 'tabChanged' no document.
     * Payload: { tab: 'produto' | 'financeiro' | ... }
     */
    _emitTabChanged(tab) {
        document.dispatchEvent(
            new CustomEvent('tabChanged', {
                detail:     { tab },
                bubbles:    true,
                cancelable: false
            })
        );
    }
}

export default TabNavigator;