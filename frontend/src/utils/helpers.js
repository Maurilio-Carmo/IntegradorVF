// frontend/src/utils/helpers.js

/**
 * Funções Auxiliares (Helpers)
 * Utilitários reutilizáveis sem dependência de outros módulos
 */

// Tempo

export const TimeHelpers = {
    /**
     * Aguardar N milissegundos
     *   await TimeHelpers.sleep(500)
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Debounce — executa só após N ms sem chamadas
     *   const fn = TimeHelpers.debounce(buscar, 300)
     */
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * Throttle — executa no máximo 1x a cada N ms
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * Medir tempo de execução de uma função async
     *   const { result, elapsed } = await TimeHelpers.measure(() => importar())
     */
    async measure(fn) {
        const start  = performance.now();
        const result = await fn();
        const elapsed = ((performance.now() - start) / 1000).toFixed(2);
        return { result, elapsed: `${elapsed}s` };
    }
};

// Objetos

export const ObjectHelpers = {
    /**
     * Clonar profundamente (simples, sem referência)
     */
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Checar se está vazio
     */
    isEmpty(value) {
        if (value === null || value === undefined || value === '') return true;
        if (Array.isArray(value))  return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    /**
     * Merge profundo de objetos
     */
    merge(...objects) {
        return objects.reduce((acc, obj) => {
            Object.entries(obj).forEach(([key, val]) => {
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    acc[key] = this.merge(acc[key] || {}, val);
                } else {
                    acc[key] = val;
                }
            });
            return acc;
        }, {});
    },

    /**
     * Selecionar apenas chaves específicas de um objeto
     *   pick({ a:1, b:2, c:3 }, ['a','c']) → { a:1, c:3 }
     */
    pick(obj, keys) {
        return keys.reduce((acc, key) => {
            if (key in obj) acc[key] = obj[key];
            return acc;
        }, {});
    },

    /**
     * Omitir chaves de um objeto
     *   omit({ a:1, b:2, c:3 }, ['b']) → { a:1, c:3 }
     */
    omit(obj, keys) {
        return Object.fromEntries(
            Object.entries(obj).filter(([k]) => !keys.includes(k))
        );
    }
};

// Arrays

export const ArrayHelpers = {
    /**
     * Agrupar por chave
     *   groupBy([{tipo:'A'}, {tipo:'B'}, {tipo:'A'}], 'tipo')
     *   → { A: [...], B: [...] }
     */
    groupBy(array, key) {
        return array.reduce((acc, item) => {
            const group = item[key];
            (acc[group] = acc[group] || []).push(item);
            return acc;
        }, {});
    },

    /**
     * Remover duplicados por chave
     *   uniqueBy([{id:1},{id:1},{id:2}], 'id') → [{id:1},{id:2}]
     */
    uniqueBy(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const val = item[key];
            if (seen.has(val)) return false;
            seen.add(val);
            return true;
        });
    },

    /**
     * Dividir em lotes
     *   chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
     */
    chunk(array, size) {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    },

    /**
     * Ordenar por chave (asc/desc)
     */
    sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ?  1 : -1;
            return 0;
        });
    },

    /**
     * Somar campo numérico
     *   sumBy([{val:10},{val:20}], 'val') → 30
     */
    sumBy(array, key) {
        return array.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
    }
};

// Strings

export const StringHelpers = {
    /**
     * Gerar ID único simples
     */
    uid(prefix = '') {
        return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    },

    /**
     * Verificar se string contém termo (case insensitive, sem acento)
     */
    contains(text, term) {
        if (!text || !term) return false;
        const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalize(text).includes(normalize(term));
    },

    /**
     * Extrair números de uma string
     *   extractNumbers('R$ 1.234,56') → '123456'
     */
    extractNumbers(text) {
        return String(text).replace(/\D/g, '');
    },

    /**
     * Interpolação de template simples
     *   interpolate('Olá, {nome}!', { nome: 'João' }) → 'Olá, João!'
     */
    interpolate(template, vars) {
        return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
    }
};

// DOM

export const DOMHelpers = {
    /**
     * Buscar elemento com aviso se não encontrado
     */
    get(selector, context = document) {
        const el = context.querySelector(selector);
        if (!el) console.warn(`⚠️ Elemento não encontrado: "${selector}"`);
        return el;
    },

    /**
     * Buscar todos os elementos
     */
    getAll(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    /**
     * Mostrar elemento
     */
    show(el, display = 'block') {
        if (el) el.style.display = display;
    },

    /**
     * Ocultar elemento
     */
    hide(el) {
        if (el) el.style.display = 'none';
    },

    /**
     * Toggle de visibilidade
     */
    toggle(el, force) {
        if (!el) return;
        const isVisible = el.style.display !== 'none';
        const shouldShow = force !== undefined ? force : !isVisible;
        el.style.display = shouldShow ? 'block' : 'none';
    },

    /**
     * Scroll suave até um elemento
     */
    scrollTo(el, offset = 0) {
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
};

// Export unificado

export const Helpers = {
    time:   TimeHelpers,
    object: ObjectHelpers,
    array:  ArrayHelpers,
    string: StringHelpers,
    dom:    DOMHelpers
};

export default Helpers;