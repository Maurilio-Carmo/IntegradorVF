// frontend/src/utils/formatters.js

/**
 * Módulo de Formatação
 * Centraliza formatações de datas, números, moeda, texto e status
 */

// Datas

export const DateFormatter = {
    /**
     * Data no formato brasileiro: 16/02/2024
     */
    date(value) {
        if (!value) return '-';
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d)) return '-';
        return d.toLocaleDateString('pt-BR');
    },

    /**
     * Data e hora: 16/02/2024 14:35
     */
    dateTime(value) {
        if (!value) return '-';
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d)) return '-';
        return d.toLocaleString('pt-BR', {
            day:    '2-digit',
            month:  '2-digit',
            year:   'numeric',
            hour:   '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Hora: 14:35:22
     */
    time(value) {
        if (!value) return '-';
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d)) return '-';
        return d.toLocaleTimeString('pt-BR');
    },

    /**
     * Tempo relativo: "há 5 minutos", "há 2 horas"
     */
    relative(value) {
        if (!value) return '-';
        const d     = value instanceof Date ? value : new Date(value);
        const diff  = Math.floor((Date.now() - d.getTime()) / 1000);

        if (diff < 60)   return 'agora mesmo';
        if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
        return `há ${Math.floor(diff / 86400)} dia(s)`;
    }
};

// Números

export const NumberFormatter = {
    /**
     * Inteiro: 1.234.567
     */
    integer(value) {
        if (value === null || value === undefined) return '-';
        return parseInt(value).toLocaleString('pt-BR');
    },

    /**
     * Decimal: 1.234,56
     */
    decimal(value, decimals = 2) {
        if (value === null || value === undefined) return '-';
        return parseFloat(value).toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Moeda: R$ 1.234,56
     */
    currency(value) {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style:    'currency',
            currency: 'BRL'
        }).format(parseFloat(value));
    },

    /**
     * Percentual: 12,50%
     */
    percent(value, decimals = 2) {
        if (value === null || value === undefined) return '-';
        return `${parseFloat(value).toFixed(decimals).replace('.', ',')}%`;
    },

    /**
     * Tamanho de arquivo: 1,2 MB
     */
    fileSize(bytes) {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
    }
};

// Texto

export const TextFormatter = {
    /**
     * Truncar com reticências: "Descrição muito lon..."
     */
    truncate(text, maxLength = 50, suffix = '...') {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    },

    /**
     * Capitalizar primeira letra: "alimentos" → "Alimentos"
     */
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    /**
     * Title case: "BEBIDAS E SUCOS" → "Bebidas E Sucos"
     */
    titleCase(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    /**
     * Remover acentos: "Seção" → "Secao"
     */
    removeAccents(text) {
        if (!text) return '';
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    /**
     * Slug: "Minha Seção" → "minha-secao"
     */
    slug(text) {
        if (!text) return '';
        return this.removeAccents(text)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    },

    /**
     * Pluralizar simples: (1, "registro") → "1 registro"
     *                     (3, "registro") → "3 registros"
     */
    pluralize(count, singular, plural = null) {
        const word = count === 1 ? singular : (plural || `${singular}s`);
        return `${NumberFormatter.integer(count)} ${word}`;
    }
};

// Documentos

export const DocFormatter = {
    /**
     * CPF: "12345678901" → "123.456.789-01"
     */
    cpf(value) {
        if (!value) return '-';
        const digits = String(value).replace(/\D/g, '');
        if (digits.length !== 11) return value;
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    /**
     * CNPJ: "12345678000195" → "12.345.678/0001-95"
     */
    cnpj(value) {
        if (!value) return '-';
        const digits = String(value).replace(/\D/g, '');
        if (digits.length !== 14) return value;
        return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },

    /**
     * CPF ou CNPJ automático
     */
    cpfCnpj(value) {
        if (!value) return '-';
        const digits = String(value).replace(/\D/g, '');
        if (digits.length === 11) return this.cpf(digits);
        if (digits.length === 14) return this.cnpj(digits);
        return value;
    },

    /**
     * CEP: "01310100" → "01310-100"
     */
    cep(value) {
        if (!value) return '-';
        const digits = String(value).replace(/\D/g, '');
        if (digits.length !== 8) return value;
        return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
    },

    /**
     * Telefone: "11987654321" → "(11) 98765-4321"
     */
    phone(value) {
        if (!value) return '-';
        const digits = String(value).replace(/\D/g, '');
        if (digits.length === 11) {
            return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        if (digits.length === 10) {
            return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return value;
    }
};

// Status

export const StatusFormatter = {
    /**
     * Texto do status: 'U' → 'Update'
     */
    label(status) {
        const labels = {
            C: 'Criado',
            U: 'Atualizar',
            D: 'Deletado',
            E: 'Erro',
            S: 'Sucesso'
        };
        return labels[status] || status || '-';
    },

    /**
     * Ícone do status: 'U' → '♻️'
     */
    icon(status) {
        const icons = {
            C: '✳️',
            U: '♻️',
            D: '⛔',
            E: '❌',
            S: '✅'
        };
        return icons[status] || '❓';
    },

    /**
     * Ícone + texto: 'U' → '♻️ Atualizar'
     */
    full(status) {
        return `${this.icon(status)} ${this.label(status)}`;
    },

    /**
     * Classe CSS para o status
     */
    cssClass(status) {
        const classes = {
            C: 'status-created',
            U: 'status-update',
            D: 'status-deleted',
            E: 'status-error',
            S: 'status-success'
        };
        return classes[status] || 'status-unknown';
    }
};

// Export unificado

export const Formatters = {
    date:   DateFormatter,
    number: NumberFormatter,
    text:   TextFormatter,
    doc:    DocFormatter,
    status: StatusFormatter
};

export default Formatters;