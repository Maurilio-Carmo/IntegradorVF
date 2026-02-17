// frontend/src/utils/validators.js

/**
 * Módulo de Validações
 * Centraliza todas as validações da aplicação
 */

import { VALIDATION } from '../config/constants.js';

export const Validators = {
    /**
     * Validar URL
     */
    url(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        // Remover espaços
        url = url.trim();

        // Verificar tamanho mínimo
        if (url.length < VALIDATION.MIN_URL_LENGTH) {
            return false;
        }

        // Verificar padrão
        if (!VALIDATION.URL_PATTERN.test(url)) {
            return false;
        }

        // Validar com URL API
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
            return false;
        }
    },

    /**
     * Validar API Key
     */
    apiKey(key) {
        if (!key || typeof key !== 'string') {
            return false;
        }

        const trimmedKey = key.trim();

        // Verificar tamanho
        if (trimmedKey.length < VALIDATION.MIN_API_KEY_LENGTH) {
            return false;
        }

        if (trimmedKey.length > VALIDATION.MAX_API_KEY_LENGTH) {
            return false;
        }

        return true;
    },

    /**
     * Validar ID da Loja
     */
    lojaId(id) {
        // Aceitar número ou string
        const num = typeof id === 'string' ? parseInt(id, 10) : id;

        // Verificar se é número válido
        if (isNaN(num)) {
            return false;
        }

        // Verificar se é positivo
        if (num < VALIDATION.MIN_LOJA_ID) {
            return false;
        }

        return true;
    },

    /**
     * Validar campo obrigatório
     */
    required(value) {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === 'string' && value.trim() === '') {
            return false;
        }

        if (Array.isArray(value) && value.length === 0) {
            return false;
        }

        if (typeof value === 'object' && Object.keys(value).length === 0) {
            return false;
        }

        return true;
    },

    /**
     * Validar email
     */
    email(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        return VALIDATION.EMAIL_PATTERN.test(email.trim());
    },

    /**
     * Validar telefone (formato brasileiro)
     */
    phone(phone) {
        if (!phone || typeof phone !== 'string') {
            return false;
        }

        // Remover formatação
        const cleaned = phone.replace(/\D/g, '');

        // Verificar tamanho (10 ou 11 dígitos)
        if (cleaned.length < 10 || cleaned.length > 11) {
            return false;
        }

        // Verificar padrão com formatação
        return VALIDATION.PHONE_PATTERN.test(phone);
    },

    /**
     * Validar CPF
     */
    cpf(cpf) {
        if (!cpf || typeof cpf !== 'string') {
            return false;
        }

        // Remover formatação
        cpf = cpf.replace(/\D/g, '');

        // Verificar tamanho
        if (cpf.length !== 11) {
            return false;
        }

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) {
            return false;
        }

        // Validar dígitos verificadores
        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    },

    /**
     * Validar CNPJ
     */
    cnpj(cnpj) {
        if (!cnpj || typeof cnpj !== 'string') {
            return false;
        }

        // Remover formatação
        cnpj = cnpj.replace(/\D/g, '');

        // Verificar tamanho
        if (cnpj.length !== 14) {
            return false;
        }

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cnpj)) {
            return false;
        }

        // Validar dígitos verificadores
        let length = cnpj.length - 2;
        let numbers = cnpj.substring(0, length);
        let digits = cnpj.substring(length);
        let sum = 0;
        let pos = length - 7;

        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result != digits.charAt(0)) return false;

        length = length + 1;
        numbers = cnpj.substring(0, length);
        sum = 0;
        pos = length - 7;

        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }

        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result != digits.charAt(1)) return false;

        return true;
    },

    /**
     * Validar número inteiro
     */
    integer(value) {
        if (typeof value === 'number') {
            return Number.isInteger(value);
        }

        if (typeof value === 'string') {
            const num = parseInt(value, 10);
            return !isNaN(num) && num.toString() === value.trim();
        }

        return false;
    },

    /**
     * Validar número decimal
     */
    decimal(value) {
        if (typeof value === 'number') {
            return !isNaN(value) && isFinite(value);
        }

        if (typeof value === 'string') {
            const num = parseFloat(value);
            return !isNaN(num) && isFinite(num);
        }

        return false;
    },

    /**
     * Validar range numérico
     */
    range(value, min, max) {
        const num = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(num)) {
            return false;
        }

        if (min !== undefined && num < min) {
            return false;
        }

        if (max !== undefined && num > max) {
            return false;
        }

        return true;
    },

    /**
     * Validar data
     */
    date(date) {
        if (date instanceof Date) {
            return !isNaN(date.getTime());
        }

        if (typeof date === 'string') {
            const parsed = new Date(date);
            return !isNaN(parsed.getTime());
        }

        return false;
    },

    /**
     * Validar formato de data brasileiro (dd/MM/yyyy)
     */
    dateBR(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') {
            return false;
        }

        const pattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(pattern);

        if (!match) {
            return false;
        }

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        // Verificar ranges básicos
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;

        // Criar data e verificar se é válida
        const date = new Date(year, month - 1, day);
        return date.getDate() === day && 
               date.getMonth() === month - 1 && 
               date.getFullYear() === year;
    },

    /**
     * Validar tamanho de string
     */
    length(value, min, max) {
        if (typeof value !== 'string') {
            return false;
        }

        const len = value.length;

        if (min !== undefined && len < min) {
            return false;
        }

        if (max !== undefined && len > max) {
            return false;
        }

        return true;
    },

    /**
     * Validar padrão regex
     */
    pattern(value, pattern) {
        if (typeof value !== 'string') {
            return false;
        }

        if (!(pattern instanceof RegExp)) {
            return false;
        }

        return pattern.test(value);
    },

    /**
     * Validar se valor está em lista
     */
    inList(value, list) {
        if (!Array.isArray(list)) {
            return false;
        }

        return list.includes(value);
    },

    /**
     * Validar configuração completa da API
     */
    apiConfig(config) {
        if (!config || typeof config !== 'object') {
            return {
                valid: false,
                errors: ['Configuração inválida']
            };
        }

        const errors = [];

        // Validar URL
        if (!this.url(config.apiUrl)) {
            errors.push('URL da API inválida');
        }

        // Validar API Key
        if (!this.apiKey(config.apiKey)) {
            errors.push('API Key inválida (mínimo 10 caracteres)');
        }

        // Validar Loja
        if (!this.lojaId(config.loja)) {
            errors.push('Código da loja inválido');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validar objeto com schema
     */
    schema(obj, schema) {
        if (!obj || typeof obj !== 'object') {
            return {
                valid: false,
                errors: ['Objeto inválido']
            };
        }

        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = obj[field];

            // Required
            if (rules.required && !this.required(value)) {
                errors.push(`${field} é obrigatório`);
                continue;
            }

            // Se não é obrigatório e está vazio, pular outras validações
            if (!rules.required && !this.required(value)) {
                continue;
            }

            // Type
            if (rules.type) {
                const typeValid = typeof value === rules.type;
                if (!typeValid) {
                    errors.push(`${field} deve ser do tipo ${rules.type}`);
                }
            }

            // Min/Max para números
            if (rules.min !== undefined || rules.max !== undefined) {
                if (!this.range(value, rules.min, rules.max)) {
                    errors.push(`${field} deve estar entre ${rules.min} e ${rules.max}`);
                }
            }

            // Min/Max para strings
            if (rules.minLength !== undefined || rules.maxLength !== undefined) {
                if (!this.length(value, rules.minLength, rules.maxLength)) {
                    errors.push(`${field} deve ter entre ${rules.minLength} e ${rules.maxLength} caracteres`);
                }
            }

            // Pattern
            if (rules.pattern && !this.pattern(value, rules.pattern)) {
                errors.push(`${field} não corresponde ao padrão esperado`);
            }

            // Custom validator
            if (rules.validator && typeof rules.validator === 'function') {
                if (!rules.validator(value)) {
                    errors.push(`${field} é inválido`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
};

export default Validators;