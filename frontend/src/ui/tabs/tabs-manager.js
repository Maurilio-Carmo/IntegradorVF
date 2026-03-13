// frontend/src/ui/tabs/tabs-manager.js

/**
 * Gerenciador Principal de Tabs
 * Orquestra TabNavigator e ImportButtonManager
 */

import { TabNavigator } from './tab-navigator.js';
import { ImportButtonManager } from './button-manager.js';

export class TabsManager {

    constructor() {
        this.navigator     = new TabNavigator();
        this.importManager = new ImportButtonManager();
    }

    /**
     * Inicializar todo o sistema de tabs
     */
    init() {
        console.log('🔧 Inicializando sistema de tabs...');
        this.navigator.init();
        this.importManager.init();
        console.log('✅ Sistema de tabs inicializado');
    }

    /**
     * Navegar para uma aba programaticamente
     */
    goTo(tab) {
        this.navigator.switchTo(tab);
    }

    /**
     * Retornar aba ativa
     */
    getActiveTab() {
        return this.navigator.getActive();
    }
}

// Singleton — usado pelo app-initializer
const Tabs = new TabsManager();
export default Tabs;