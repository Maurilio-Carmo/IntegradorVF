// frontend/src/ui/tabs/tab-navigator.js

/**
 * Gerenciador de Navegação entre Tabs
 * Responsabilidade única: trocar abas ativas na UI
 */

import { TABS } from '../../config/constants.js';

export class TabNavigator {

    constructor() {
        this.activeTab = TABS.PRODUTO;
        this.tabButtons = [];
        this.tabPanels  = [];
    }

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
        console.log(`✅ TabNavigator inicializado (${this.tabButtons.length} abas)`);
    }

    /**
     * Trocar para uma aba específica
     */
    switchTo(targetTab) {
        if (!targetTab) return;

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
    }

    /**
     * Obter tab ativa
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
}

export default TabNavigator;