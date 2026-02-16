// frontend/src/services/api/http-client.js

/**
 * Cliente HTTP Base
 * Gerencia requisições HTTP com retry, timeout e tratamento de erros
 */

export class HttpClient {
    constructor(baseURL, options = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = options.headers || {};
        this.timeout = options.timeout || 30000;
        this.retryAttempts = options.retryAttempts || 2;
        this.retryDelay = options.retryDelay || 1000;
    }

    /**
     * Fazer requisição HTTP
     */
    async request(endpoint, options = {}) {
        const url = this.buildURL(endpoint);
        const config = this.buildConfig(options);

        return await this.executeWithRetry(url, config);
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return await this.request(fullEndpoint, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        return await this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data, options = {}) {
        return await this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return await this.request(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }

    /**
     * Construir URL completa
     */
    buildURL(endpoint) {
        const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        return `${this.baseURL}/${path}`;
    }

    /**
     * Construir configuração da requisição
     */
    buildConfig(options) {
        return {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...this.defaultHeaders,
                ...options.headers
            },
            body: options.body,
            signal: this.createAbortSignal()
        };
    }

    /**
     * Criar signal para timeout
     */
    createAbortSignal() {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), this.timeout);
        return controller.signal;
    }

    /**
     * Executar requisição com retry
     */
    async executeWithRetry(url, config, attempt = 1) {
        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                console.warn(`⚠️ Tentativa ${attempt} falhou, tentando novamente...`);
                await this.delay(this.retryDelay * attempt);
                return await this.executeWithRetry(url, config, attempt + 1);
            }
            throw this.handleError(error);
        }
    }

    /**
     * Tratar resposta HTTP
     */
    async handleResponse(response) {
        if (!response.ok) {
            const error = await this.extractError(response);
            throw new HttpError(
                error.message || response.statusText,
                response.status,
                error
            );
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text();
    }

    /**
     * Extrair erro da resposta
     */
    async extractError(response) {
        try {
            return await response.json();
        } catch {
            return { message: response.statusText };
        }
    }

    /**
     * Tratar erro
     */
    handleError(error) {
        if (error.name === 'AbortError') {
            return new HttpError('Request timeout', 408, error);
        }

        if (error.message.includes('Failed to fetch')) {
            return new HttpError('Network error', 0, error);
        }

        return error;
    }

    /**
     * Verificar se deve tentar novamente
     */
    shouldRetry(error) {
        // Retry em erros de rede ou timeout
        return error.name === 'AbortError' || 
               error.message.includes('Failed to fetch') ||
               (error.status >= 500 && error.status < 600);
    }

    /**
     * Delay assíncrono
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Atualizar headers padrão
     */
    setHeaders(headers) {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }

    /**
     * Remover header
     */
    removeHeader(key) {
        delete this.defaultHeaders[key];
    }
}

/**
 * Classe de erro HTTP customizada
 */
export class HttpError extends Error {
    constructor(message, status, details) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.details = details;
    }

    isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    isServerError() {
        return this.status >= 500 && this.status < 600;
    }

    isNetworkError() {
        return this.status === 0;
    }

    isTimeout() {
        return this.status === 408;
    }
}

export default HttpClient;