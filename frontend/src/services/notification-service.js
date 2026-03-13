// frontend/src/services/notification-service.js

/**
 * Serviço de Notificações
 * Centraliza toast, banner, inline e confirmações customizadas.
 * Substitui os window.alert / window.confirm nativos.
 */

import { UI as UI_CONST } from '../config/constants.js';

// Toast

const ToastManager = {
    _container: null,

    _getContainer() {
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.id = 'toast-container';
            Object.assign(this._container.style, {
                position:  'fixed',
                bottom:    '1.5rem',
                right:     '1.5rem',
                zIndex:    '9999',
                display:   'flex',
                flexDirection: 'column',
                gap:       '0.5rem'
            });
            document.body.appendChild(this._container);
        }
        return this._container;
    },

    show(message, type = 'info', duration = UI_CONST.ALERT_DURATION) {
        const container = this._getContainer();

        // Cores por tipo
        const styles = {
            success: { bg: '#22c55e', color: '#fff', icon: '✅' },
            error:   { bg: '#ef4444', color: '#fff', icon: '❌' },
            warning: { bg: '#f59e0b', color: '#fff', icon: '⚠️' },
            info:    { bg: '#3b82f6', color: '#fff', icon: 'ℹ️' }
        };
        const s = styles[type] || styles.info;

        const toast = document.createElement('div');
        toast.style.cssText = `
            background:    ${s.bg};
            color:         ${s.color};
            padding:       0.75rem 1rem;
            border-radius: 8px;
            font-size:     0.875rem;
            max-width:     320px;
            box-shadow:    0 4px 12px rgba(0,0,0,0.15);
            display:       flex;
            align-items:   flex-start;
            gap:           0.5rem;
            opacity:       0;
            transform:     translateX(40px);
            transition:    opacity 0.25s, transform 0.25s;
            cursor:        pointer;
        `;
        toast.innerHTML = `<span>${s.icon}</span><span>${message}</span>`;

        // Remover ao clicar
        toast.addEventListener('click', () => this._remove(toast));

        container.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.style.opacity   = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Auto-remover
        if (duration > 0) {
            setTimeout(() => this._remove(toast), duration);
        }

        return toast;
    },

    _remove(toast) {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 260);
    },

    success(msg, duration) { return this.show(msg, 'success', duration); },
    error(msg, duration)   { return this.show(msg, 'error',   duration); },
    warning(msg, duration) { return this.show(msg, 'warning', duration); },
    info(msg, duration)    { return this.show(msg, 'info',    duration); }
};

// Banner

const BannerManager = {
    _current: null,

    show(message, type = 'warning') {
        this.hide(); // remove o banner anterior

        const styles = {
            success: { bg: '#dcfce7', border: '#22c55e', color: '#166534', icon: '✅' },
            error:   { bg: '#fee2e2', border: '#ef4444', color: '#991b1b', icon: '❌' },
            warning: { bg: '#fef9c3', border: '#f59e0b', color: '#92400e', icon: '⚠️' },
            info:    { bg: '#dbeafe', border: '#3b82f6', color: '#1e40af', icon: 'ℹ️' }
        };
        const s = styles[type] || styles.info;

        const banner = document.createElement('div');
        banner.id = 'app-banner';
        banner.style.cssText = `
            background:    ${s.bg};
            border-left:   4px solid ${s.border};
            color:         ${s.color};
            padding:       0.75rem 1.25rem;
            font-size:     0.875rem;
            display:       flex;
            align-items:   center;
            justify-content: space-between;
            gap:           0.75rem;
        `;
        banner.innerHTML = `
            <span>${s.icon} ${message}</span>
            <button style="background:none;border:none;cursor:pointer;font-size:1rem;color:${s.color}">✕</button>
        `;

        banner.querySelector('button').addEventListener('click', () => this.hide());

        // Inserir no topo do app
        const app = document.getElementById('app') || document.body;
        app.prepend(banner);

        this._current = banner;
        return banner;
    },

    hide() {
        if (this._current) {
            this._current.remove();
            this._current = null;
        }
    }
};

// Inline

const InlineManager = {
    /**
     * Exibir mensagem dentro de um elemento existente
     * @param {string} elementId  ID do elemento alvo
     * @param {string} message    Texto da mensagem
     * @param {string} type       success | error | warning | info
     */
    show(elementId, message, type = 'info') {
        const el = document.getElementById(elementId);
        if (!el) {
            console.warn(`⚠️ InlineManager: elemento #${elementId} não encontrado`);
            return;
        }

        el.className = `alert alert-${type} show`;
        el.textContent = message;
        el.style.display = 'block';
    },

    hide(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.style.display = 'none';
            el.className = 'alert';
            el.textContent = '';
        }
    }
};

// Confirm

const ConfirmManager = {
    /**
     * Modal de confirmação customizado (Promise)
     * @returns {Promise<boolean>}
     */
    show(message, options = {}) {
        const {
            title        = 'Confirmação',
            confirmText  = 'Confirmar',
            cancelText   = 'Cancelar',
            type         = 'warning'
        } = options;

        return new Promise(resolve => {
            const icons = { warning: '⚠️', error: '❌', info: 'ℹ️', success: '✅' };

            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position:   fixed;
                inset:      0;
                background: rgba(0,0,0,0.45);
                z-index:    10000;
                display:    flex;
                align-items: center;
                justify-content: center;
                padding:    1rem;
            `;

            overlay.innerHTML = `
                <div style="
                    background: var(--bg-primary, #fff);
                    border-radius: 12px;
                    padding: 1.5rem;
                    max-width: 400px;
                    width: 100%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
                ">
                    <div style="font-size:1.5rem;margin-bottom:0.5rem">
                        ${icons[type] || icons.warning} ${title}
                    </div>
                    <p style="color:var(--text-secondary,#666);margin-bottom:1.25rem">
                        ${message}
                    </p>
                    <div style="display:flex;gap:0.75rem;justify-content:flex-end">
                        <button id="_confirm-cancel"  style="padding:0.5rem 1rem;border:1px solid var(--border-color,#ccc);border-radius:6px;cursor:pointer;background:transparent">${cancelText}</button>
                        <button id="_confirm-ok"      style="padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff">${confirmText}</button>
                    </div>
                </div>
            `;

            const close = (result) => {
                overlay.remove();
                resolve(result);
            };

            overlay.querySelector('#_confirm-ok').addEventListener('click', () => close(true));
            overlay.querySelector('#_confirm-cancel').addEventListener('click', () => close(false));
            overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });

            document.body.appendChild(overlay);
            overlay.querySelector('#_confirm-ok').focus();
        });
    }
};

// Export unificado

export const NotificationService = {
    toast:   ToastManager,
    banner:  BannerManager,
    inline:  InlineManager,
    confirm: ConfirmManager,

    // Atalhos diretos
    success(msg, duration) { return ToastManager.success(msg, duration); },
    error(msg, duration)   { return ToastManager.error(msg, duration);   },
    warning(msg, duration) { return ToastManager.warning(msg, duration); },
    info(msg, duration)    { return ToastManager.info(msg, duration);    }
};

export default NotificationService;