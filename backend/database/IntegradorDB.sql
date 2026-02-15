-- =====================================================
-- SCRIPT DE BANCO DE DADOS SQLITE
-- Projeto: Integração com Varejo Fácil
-- =====================================================

-- Habilitar chaves estrangeiras
PRAGMA foreign_keys = ON;

-- =====================================================
-- 1. ESTRUTURA MERCADOLÓGICA (Hierarquia)
-- =====================================================

-- Tabela: Seções
DROP TABLE IF EXISTS secoes;
CREATE TABLE secoes (
    secao_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('✳️', '♻️', '⛔')) DEFAULT '♻️',
    secao_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_secoes_status ON secoes(status);

-- Tabela: Grupos
DROP TABLE IF EXISTS grupos;
CREATE TABLE grupos (
    secao_id_old TEXT,
    grupo_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('✳️', '♻️', '⛔')) DEFAULT '♻️',
    secao_id_new INTEGER NOT NULL,
    grupo_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (secao_id_new) REFERENCES secoes(secao_id_new) ON DELETE CASCADE
);

CREATE INDEX idx_grupos_secao ON grupos(secao_id_new);
CREATE INDEX idx_grupos_status ON grupos(status);

-- Tabela: Subgrupos
DROP TABLE IF EXISTS subgrupos;
CREATE TABLE subgrupos (
    secao_id_old TEXT,
    grupo_id_old TEXT,
    subgrupo_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('✳️', '♻️', '⛔')) DEFAULT '♻️',
    secao_id_new INTEGER NOT NULL,
    grupo_id_new INTEGER NOT NULL,
    subgrupo_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (secao_id_new) REFERENCES secoes(secao_id_new) ON DELETE CASCADE,
    FOREIGN KEY (grupo_id_new) REFERENCES grupos(grupo_id_new) ON DELETE CASCADE
);

CREATE INDEX idx_subgrupos_secao ON subgrupos(secao_id_new);
CREATE INDEX idx_subgrupos_grupo ON subgrupos(grupo_id_new);
CREATE INDEX idx_subgrupos_status ON subgrupos(status);

-- Tabela: Marcas
DROP TABLE IF EXISTS marcas;
CREATE TABLE marcas (
    marca_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('✳️', '♻️', '⛔')) DEFAULT '♻️',
    marca_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marcas_status ON marcas(status);

-- Tabela: Famílias
DROP TABLE IF EXISTS familias;
CREATE TABLE familias (
    familia_id INTEGER PRIMARY KEY,
    descricao TEXT NOT NULL,
    status TEXT DEFAULT '♻️',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. PRODUTOS
-- =====================================================

DROP TABLE IF EXISTS produtos;
CREATE TABLE produtos (
    -- Identificação
    id INTEGER PRIMARY KEY,
    descricao TEXT NOT NULL,
    descricao_reduzida TEXT,
    codigo_interno TEXT,
    
    -- Hierarquia Mercadológica
    secao_id INTEGER,
    grupo_id INTEGER,
    subgrupo_id INTEGER,
    familia_id INTEGER,
    marca_id INTEGER,
    
    -- Estoque
    estoque_minimo REAL DEFAULT 0,
    estoque_maximo REAL DEFAULT 0,
    
    -- Características do Produto
    composicao TEXT CHECK(composicao IN ('NORMAL', 'COMPOSTO', 'KIT', 'RENDIMENTO')),
    peso_variavel TEXT CHECK(peso_variavel IN ('SIM', 'PESO', 'NAO', 'UNITARIO', 'PENDENTE')),
    
    -- Unidades de Medida
    unidade_compra TEXT DEFAULT 'UN',
    itens_embalagem INTEGER DEFAULT 1,
    unidade_venda TEXT DEFAULT 'UN',
    itens_embalagem_venda INTEGER DEFAULT 1,
    unidade_transferencia TEXT DEFAULT 'UN',
    itens_embalagem_transferencia INTEGER DEFAULT 1,
    
    -- Pesos e Medidas
    peso_bruto REAL DEFAULT 0,
    peso_liquido REAL DEFAULT 0,
    fator_rendimento_unidade REAL DEFAULT 0,
    fator_rendimento_custo REAL DEFAULT 0,
    
    -- Fiscal
    tabela_a TEXT,
    genero_id TEXT,
    ncm TEXT,
    cest TEXT,
    situacao_fiscal_padrao TEXT,
    situacao_fiscal_saida TEXT,
    regime_estadual TEXT,
    impostos_federais TEXT,
    natureza TEXT,
    
    -- Controles
    permite_desconto TEXT CHECK(permite_desconto IN ('Sim', 'Não')),
    desconto_maximo REAL DEFAULT 0,
    controla_estoque TEXT CHECK(controla_estoque IN ('Sim', 'Não')),
    produto_balanca TEXT CHECK(produto_balanca IN ('Sim', 'Não')),
    descricao_variavel TEXT CHECK(descricao_variavel IN ('Sim', 'Não')),
    preco_variavel TEXT CHECK(preco_variavel IN ('Sim', 'Não')),
    venda_ecommerce TEXT CHECK(venda_ecommerce IN ('Sim', 'Não')),
    controla_validade TEXT CHECK(controla_validade IN ('Sim', 'Não')),
    dias_validade INTEGER DEFAULT 0,
    
    -- Produção
    finalidade TEXT,
    tipo_producao TEXT,
    unidade_referencia TEXT,
    medida_referencia REAL,
    iat TEXT,
    
    -- Status
    fora_linha TEXT CHECK(fora_linha IN ('Sim', 'Não')) DEFAULT 'Não',
    data_saida_linha DATE,
    data_inclusao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT '♻️',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Chaves Estrangeiras
    FOREIGN KEY (secao_id) REFERENCES secoes(secao_id_new) ON DELETE SET NULL,
    FOREIGN KEY (grupo_id) REFERENCES grupos(grupo_id_new) ON DELETE SET NULL,
    FOREIGN KEY (subgrupo_id) REFERENCES subgrupos(subgrupo_id_new) ON DELETE SET NULL,
    FOREIGN KEY (familia_id) REFERENCES familias(familia_id) ON DELETE SET NULL,
    FOREIGN KEY (marca_id) REFERENCES marcas(marca_id_new) ON DELETE SET NULL
);

CREATE INDEX idx_produtos_secao ON produtos(secao_id);
CREATE INDEX idx_produtos_grupo ON produtos(grupo_id);
CREATE INDEX idx_produtos_subgrupo ON produtos(subgrupo_id);
CREATE INDEX idx_produtos_marca ON produtos(marca_id);
CREATE INDEX idx_produtos_familia ON produtos(familia_id);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_produtos_ncm ON produtos(ncm);
CREATE INDEX idx_produtos_codigo_interno ON produtos(codigo_interno);

-- =====================================================
-- 3. ENTIDADES FINANCEIRAS
-- =====================================================

-- Tabela: Categorias
DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY,
    descricao TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('RECEITA', 'DESPESA')),
    status TEXT DEFAULT '♻️',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Clientes
DROP TABLE IF EXISTS clientes;
CREATE TABLE clientes (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo_pessoa TEXT CHECK(tipo_pessoa IN ('FISICA', 'JURIDICA')),
    documento TEXT UNIQUE,
    inscricao_estadual TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    telefone TEXT,
    email TEXT,
    limite_credito REAL DEFAULT 0,
    status TEXT DEFAULT '♻️',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Fornecedores
DROP TABLE IF EXISTS fornecedores;
CREATE TABLE fornecedores (
    id INTEGER PRIMARY KEY,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    tipo_pessoa TEXT CHECK(tipo_pessoa IN ('FISICA', 'JURIDICA')),
    documento TEXT UNIQUE,
    inscricao_estadual TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    telefone TEXT,
    email TEXT,
    status TEXT DEFAULT '♻️',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. LOGS DE SINCRONIZAÇÃO
-- =====================================================

DROP TABLE IF EXISTS log_sincronizacao;
CREATE TABLE log_sincronizacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidade TEXT NOT NULL,
    tipo_operacao TEXT CHECK(tipo_operacao IN ('IMPORTACAO', 'SINCRONIZACAO', 'DELECAO')),
    registro_id TEXT,
    status TEXT CHECK(status IN ('SUCESSO', 'ERRO', 'PENDENTE')),
    mensagem TEXT,
    data_execucao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_entidade ON log_sincronizacao(entidade);
CREATE INDEX idx_log_status ON log_sincronizacao(status);
CREATE INDEX idx_log_data ON log_sincronizacao(data_execucao);

-- =====================================================
-- 5. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger: Atualizar data de modificação em Produtos
DROP TRIGGER IF EXISTS update_produtos_timestamp;
CREATE TRIGGER update_produtos_timestamp 
AFTER UPDATE ON produtos
BEGIN
    UPDATE produtos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Atualizar data de modificação em Seções
DROP TRIGGER IF EXISTS update_secoes_timestamp;
CREATE TRIGGER update_secoes_timestamp 
AFTER UPDATE ON secoes
BEGIN
    UPDATE secoes SET updated_at = CURRENT_TIMESTAMP WHERE secao_id_new = NEW.secao_id_new;
END;

-- Trigger: Atualizar data de modificação em Grupos
DROP TRIGGER IF EXISTS update_grupos_timestamp;
CREATE TRIGGER update_grupos_timestamp 
AFTER UPDATE ON grupos
BEGIN
    UPDATE grupos SET updated_at = CURRENT_TIMESTAMP WHERE grupo_id_new = NEW.grupo_id_new;
END;

-- Trigger: Atualizar data de modificação em Subgrupos
DROP TRIGGER IF EXISTS update_subgrupos_timestamp;
CREATE TRIGGER update_subgrupos_timestamp 
AFTER UPDATE ON subgrupos
BEGIN
    UPDATE subgrupos SET updated_at = CURRENT_TIMESTAMP WHERE subgrupo_id_new = NEW.subgrupo_id_new;
END;

-- Trigger: Atualizar data de modificação em Marcas
DROP TRIGGER IF EXISTS update_marcas_timestamp;
CREATE TRIGGER update_marcas_timestamp 
AFTER UPDATE ON marcas
BEGIN
    UPDATE marcas SET updated_at = CURRENT_TIMESTAMP WHERE marca_id_new = NEW.marca_id_new;
END;

-- =====================================================
-- 6. VIEWS ÚTEIS
-- =====================================================

-- View: Produtos com Hierarquia Completa
DROP VIEW IF EXISTS vw_produtos_completo;
CREATE VIEW vw_produtos_completo AS
SELECT 
    p.id,
    p.descricao,
    p.descricao_reduzida,
    p.codigo_interno,
    s.descricao_new AS secao,
    g.descricao_new AS grupo,
    sg.descricao_new AS subgrupo,
    m.descricao_new AS marca,
    f.descricao AS familia,
    p.ncm,
    p.cest,
    p.estoque_minimo,
    p.estoque_maximo,
    p.peso_bruto,
    p.peso_liquido,
    p.status,
    p.fora_linha,
    p.data_inclusao,
    p.data_alteracao
FROM produtos p
LEFT JOIN secoes s ON p.secao_id = s.secao_id_new
LEFT JOIN grupos g ON p.grupo_id = g.grupo_id_new
LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.subgrupo_id_new
LEFT JOIN marcas m ON p.marca_id = m.marca_id_new
LEFT JOIN familias f ON p.familia_id = f.familia_id;

-- View: Hierarquia Mercadológica Completa
DROP VIEW IF EXISTS vw_hierarquia_mercadologica;
CREATE VIEW vw_hierarquia_mercadologica AS
SELECT 
    s.secao_id_new AS secao_id,
    s.descricao_new AS secao,
    g.grupo_id_new AS grupo_id,
    g.descricao_new AS grupo,
    sg.subgrupo_id_new AS subgrupo_id,
    sg.descricao_new AS subgrupo,
    s.status AS secao_status,
    g.status AS grupo_status,
    sg.status AS subgrupo_status
FROM secoes s
LEFT JOIN grupos g ON s.secao_id_new = g.secao_id_new
LEFT JOIN subgrupos sg ON g.grupo_id_new = sg.grupo_id_new;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT 'Banco de dados criado com sucesso! ✅' AS mensagem;