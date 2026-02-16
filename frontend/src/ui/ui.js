// frontend/src/ui/ui-modular.js

/**
 * UI Principal (Modularizado)
 * Agrega todos os módulos de UI e mantém compatibilidade
 */

import { Alerts } from './modules/alerts.js';
import { Modals } from './modules/modals.js';
import { Status } from './modules/status.js';
import { Log } from './modules/log.js';
import { Statistics } from './modules/statistics.js';
import { Buttons } from './modules/buttons.js';

/**
 * Interface de Usuário Modularizada
 */
const UI = {
    // Submódulos
    alerts: Alerts,
    modals: Modals,
    status: Status,
    log: Log,
    statistics: Statistics,
    buttons: Buttons,

    // ========================================
    // MÉTODOS LEGADOS (compatibilidade)
    // ========================================

    // Modals
    mostrarConfig() {
        return Modals.showConfig();
    },

    fecharConfig() {
        return Modals.closeConfig();
    },

    esconderConfig() {
        return Modals.closeConfig();
    },

    confirmar(mensagem) {
        return Modals.confirm(mensagem);
    },

    // Alerts
    mostrarAlerta(mensagem, tipo, duracao) {
        return Alerts.show(mensagem, tipo, duracao);
    },

    // Status
    atualizarStatusConexao(conectado) {
        return Status.updateConnection(conectado);
    },

    atualizarStatusImportacao(item, status, mensagem) {
        return Status.updateImport(item, status, mensagem);
    },

    // Log
    log(mensagem, tipo) {
        return Log.add(mensagem, tipo);
    },

    limparLog() {
        return Log.clear();
    },

    // Statistics
    atualizarEstatisticas(stats) {
        return Statistics.update(stats);
    },

    animarContador(elementId, valorFinal, duracao) {
        return Statistics.animateCounter(elementId, valorFinal, duracao);
    },

    // Buttons
    desabilitarBotoesImportacao(desabilitar) {
        return Buttons.disableImportButtons(desabilitar);
    },

    // ========================================
    // NOVOS MÉTODOS (modular API)
    // ========================================

    /**
     * Exibir notificação temporária
     */
    notify(mensagem, tipo = 'info', duracao = 3000) {
        // Implementar sistema de notificações (toast)
        console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
        this.log(mensagem, tipo);
    },

    /**
     * Mostrar loading global
     */
    showLoading(mensagem = 'Carregando...') {
        // Implementar overlay de loading
        console.log('Loading:', mensagem);
    },

    /**
     * Esconder loading global
     */
    hideLoading() {
        // Implementar remoção de overlay
        console.log('Loading escondido');
    },

    /**
     * Atualizar múltiplas estatísticas de uma vez
     */
    updateMultipleStats(statsArray) {
        statsArray.forEach(({ id, value, animate = false }) => {
            if (animate) {
                this.animarContador(id, value);
            } else {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            }
        });
    }
};

// Exportar
export default UI;