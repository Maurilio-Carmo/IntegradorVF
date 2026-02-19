// frontend/src/config/constants.js

/**
 * Constantes da Aplicação
 * Centraliza todos os valores fixos e configurações
 */

// ============================================
// CONFIGURAÇÕES DE API
// ============================================
export const API = {
    // Proxy local
    PROXY_URL: 'http://localhost:3000/api/vf',
    PROXY_BASE: 'http://localhost:3000',
    
    // Paginação
    DEFAULT_PAGE_SIZE: 500,
    MIN_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 1000,
    
    // Delays e timeouts
    DEFAULT_DELAY: 100,
    RETRY_DELAY: 2000,
    REQUEST_TIMEOUT: 30000,
    
    // Retry
    MAX_RETRIES: 3,
    RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
    
    // Headers
    HEADER_API_URL: 'x-api-url',
    HEADER_API_KEY: 'x-api-key',
    CONTENT_TYPE: 'application/json'
};

// ============================================
// CONFIGURAÇÕES DE UI
// ============================================
export const UI = {
    // Alertas
    ALERT_DURATION: 5000,
    ALERT_DURATION_ERROR: 8000,
    ALERT_DURATION_SUCCESS: 3000,
    
    // Animações
    ANIMATION_DURATION: 1000,
    FADE_DURATION: 300,
    SLIDE_DURATION: 400,
    
    // Log
    LOG_MAX_ENTRIES: 1000,
    LOG_AUTO_SCROLL: true,
    
    // Progress
    PROGRESS_UPDATE_INTERVAL: 100,
    PROGRESS_ANIMATION_SPEED: 200
};

// ============================================
// STORAGE
// ============================================
export const STORAGE_KEYS = {
    CONFIG: 'varejoFacilConfig',
    THEME: 'app_theme',
    LAST_TAB: 'last_active_tab',
    USER_PREFERENCES: 'user_preferences'
};

// ============================================
// STATUS DE REGISTROS (SINCRONIZAÇÃO)
// ============================================
export const STATUS = {
    CREATED: 'C',        // ✳️ Created - Criado/Vinculado ao novo sistema
    UPDATE: 'U',         // ♻️ Update - Atualizar (pendente de sincronização)
    DELETED: 'D',        // ⛔ Deleted - Deletado
    ERROR: 'E',          // ❌ Error - Erro ao processar
    SUCCESS: 'S'         // ✅ Success - Processado com sucesso
};

export const STATUS_LABELS = {
    [STATUS.CREATED]: 'Criado',
    [STATUS.UPDATE]: 'Atualizar',
    [STATUS.DELETED]: 'Deletado',
    [STATUS.ERROR]: 'Erro',
    [STATUS.SUCCESS]: 'Sucesso'
};

export const STATUS_ICONS = {
    [STATUS.CREATED]: '✳️',
    [STATUS.UPDATE]: '♻️',
    [STATUS.DELETED]: '⛔',
    [STATUS.ERROR]: '❌',
    [STATUS.SUCCESS]: '✅'
};

export const STATUS_DESCRIPTIONS = {
    [STATUS.CREATED]: 'Registro criado e vinculado ao novo sistema',
    [STATUS.UPDATE]: 'Registro importado, aguardando sincronização',
    [STATUS.DELETED]: 'Registro marcado para exclusão',
    [STATUS.ERROR]: 'Erro ao processar registro',
    [STATUS.SUCCESS]: 'Registro sincronizado com sucesso'
};

// ============================================
// ESTADOS DE IMPORTAÇÃO
// ============================================
export const IMPORT_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    PROGRESS: 'progress',
    SUCCESS: 'success',
    ERROR: 'error'
};

// ============================================
// MENSAGENS PADRÃO
// ============================================
export const MESSAGES = {
    // Configuração
    CONFIG_REQUIRED: 'Configure a API antes de importar',
    CONFIG_SAVED: 'Configuração salva com sucesso',
    CONFIG_INVALID: 'Configuração inválida',
    
    // Conexão
    CONNECTION_SUCCESS: 'Conexão estabelecida com sucesso',
    CONNECTION_ERROR: 'Erro ao conectar com a API',
    CONNECTION_TIMEOUT: 'Tempo de conexão esgotado',
    
    // Importação
    IMPORT_STARTED: (name) => `📥 Iniciando importação de ${name}...`,
    IMPORT_FETCHING: (name) => `Buscando ${name} da API...`,
    IMPORT_SAVING: (name) => `💾 Salvando ${name} no banco...`,
    IMPORT_SUCCESS: (count, name) => `✅ ${count} ${name} importados com sucesso`,
    IMPORT_ERROR: (name, error) => `❌ Erro ao importar ${name}: ${error}`,
    IMPORT_PARTIAL: (current, total) => `⏳ Processando ${current}/${total}...`,
    
    // Validação
    VALIDATION_URL: 'URL da API inválida',
    VALIDATION_API_KEY: 'API Key inválida (mínimo 10 caracteres)',
    VALIDATION_LOJA: 'Código da loja inválido',
    VALIDATION_REQUIRED: (field) => `${field} é obrigatório`,
    
    // Estatísticas
    STATS_LOADING: 'Carregando estatísticas...',
    STATS_ERROR: 'Não foi possível carregar estatísticas',
    STATS_UPDATED: 'Estatísticas atualizadas',
    
    // Sincronização
    SYNC_STARTED: 'Sincronização iniciada',
    SYNC_COMPARING: 'Comparando registros...',
    SYNC_APPLYING: 'Aplicando alterações...',
    SYNC_SUCCESS: (count) => `✅ ${count} registros sincronizados`,
    SYNC_ERROR: 'Erro na sincronização',
    
    // Genéricas
    LOADING: 'Carregando...',
    PROCESSING: 'Processando...',
    PLEASE_WAIT: 'Por favor, aguarde...',
    TRY_AGAIN: 'Tente novamente',
    CONFIRM_ACTION: 'Confirmar ação?'
};

// ============================================
// ENDPOINTS
// ============================================
export const ENDPOINTS = {
    // API Varejo Fácil (via proxy)
    VF: {
        BASE: '/produto',
        SECOES: '/produto/secoes',
        GRUPOS: '/produto/secoes/:secaoId/grupos',
        SUBGRUPOS: '/produto/secoes/:secaoId/grupos/:grupoId/subgrupos',
        MARCAS: '/produto/marcas',
        FAMILIAS: '/produto/familias',
        PRODUTOS: '/produto/produtos'
    }
};

// ============================================
// VALIDAÇÃO
// ============================================
export const VALIDATION = {
    // Tamanhos mínimos
    MIN_API_KEY_LENGTH: 10,
    MIN_URL_LENGTH: 10,
    MIN_LOJA_ID: 1,
    
    // Tamanhos máximos
    MAX_API_KEY_LENGTH: 500,
    MAX_URL_LENGTH: 500,
    
    // Patterns
    URL_PATTERN: /^https?:\/\/.+/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/
};

// ============================================
// TEMAS
// ============================================
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

// ============================================
// TABS
// ============================================
export const TABS = {
    PRODUTO: 'produto',
    FINANCEIRO: 'financeiro',
    FRENTE_LOJA: 'frente-loja',
    ESTOQUE: 'estoque',
    FISCAL: 'fiscal',
    PESSOA: 'pessoa'
};

// ============================================
// EVENTOS CUSTOMIZADOS
// ============================================
export const EVENTS = {
    APP_INITIALIZED: 'appInitialized',
    COMPONENTS_LOADED: 'componentsLoaded',
    THEME_CHANGED: 'themeChanged',
    CONFIG_SAVED: 'configSaved',
    CONFIG_LOADED: 'configLoaded',
    IMPORT_STARTED: 'importStarted',
    IMPORT_PROGRESS: 'importProgress',
    IMPORT_COMPLETED: 'importCompleted',
    IMPORT_FAILED: 'importFailed',
    STATS_UPDATED: 'statsUpdated',
    SYNC_STARTED: 'syncStarted',
    SYNC_COMPLETED: 'syncCompleted',
    SYNC_FAILED: 'syncFailed'
};

// ============================================
// CONFIGURAÇÕES DE DESENVOLVIMENTO
// ============================================
export const DEV = {
    DEBUG: false,
    VERBOSE_LOGS: false,
    MOCK_API: false,
    SHOW_PERFORMANCE: false
};

// ============================================
// VERSÃO
// ============================================
export const APP = {
    NAME: 'Integrador Varejo Fácil',
    VERSION: '2.0.0',
    BUILD_DATE: '2024-02-16',
    AUTHOR: 'Maurilio Carmo'
};

// ============================================
// FLUXO DE SINCRONIZAÇÃO
// ============================================
export const SYNC_FLOW = {
    /**
     * Fluxo de status na sincronização:
     * 
     * 1. IMPORTAÇÃO (API → SQLite)
     *    Status inicial: U (Update)
     *    Todos os registros importados ficam com status U
     * 
     * 2. COMPARAÇÃO (SQLite ↔ Firebird)
     *    Compara registros entre bancos
     *    Identifica diferenças
     * 
     * 3. SINCRONIZAÇÃO (SQLite → API → Firebird)
     *    - Registros novos: envia para API e marca como C (Created)
     *    - Registros alterados: atualiza na API e marca como C
     *    - Registros deletados: marca como D (Deleted)
     *    - Erros: marca como E (Error)
     * 
     * 4. CONFIRMAÇÃO
     *    Após sucesso completo: marca como S (Success)
     */
    IMPORT: 'U',      // Importado da API (pendente)
    SYNCED: 'C',      // Sincronizado com sucesso
    DELETED: 'D',     // Deletado
    ERROR: 'E',       // Erro
    SUCCESS: 'S'      // Processo completo
};

// Exportar tudo como default também
export default {
    API,
    UI,
    STORAGE_KEYS,
    STATUS,
    STATUS_LABELS,
    STATUS_ICONS,
    STATUS_DESCRIPTIONS,
    IMPORT_STATUS,
    MESSAGES,
    ESTIMATES,
    ENDPOINTS,
    VALIDATION,
    THEMES,
    TABS,
    EVENTS,
    DEV,
    APP,
    SYNC_FLOW
};