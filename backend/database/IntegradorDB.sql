-- =====================================================
-- SCRIPT DE BANCO DE DADOS SQLITE
-- Projeto: Integração com Varejo Fácil
-- =====================================================

-- Habilitar chaves estrangeiras
PRAGMA foreign_keys = ON;

-- =====================================================
-- LEGENDA DE STATUS:
-- D = Deleted/Deletar  (⛔)
-- U = Update/Atualizar (♻️)
-- C = Created/Criar    (✳️)
-- E = Error/Erro       (❌)
-- S = Success/Sucesso  (✅)
-- =====================================================

-- =====================================================
-- 1. ESTRUTURA MERCADOLÓGICA (Hierarquia)
-- =====================================================

-- Tabela: Seções
DROP TABLE IF EXISTS secoes;
CREATE TABLE secoes (
    secao_id INTEGER PRIMARY KEY,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_secoes ON secoes(secao_id);

-- Tabela: Grupos
DROP TABLE IF EXISTS grupos;
CREATE TABLE grupos (
    grupo_id INTEGER PRIMARY KEY,
    secao_id INTEGER NOT NULL,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (secao_id) REFERENCES secoes(secao_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_grupos ON grupos(secao_id, grupo_id);

-- Tabela: Subgrupos
DROP TABLE IF EXISTS subgrupos;
CREATE TABLE subgrupos (
    subgrupo_id INTEGER PRIMARY KEY,
    secao_id INTEGER NOT NULL,
    grupo_id INTEGER NOT NULL,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (secao_id) REFERENCES secoes(secao_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (grupo_id) REFERENCES grupos(grupo_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_subgrupos ON subgrupos(secao_id, grupo_id, subgrupo_id);

-- Tabela: Marcas
DROP TABLE IF EXISTS marcas;
CREATE TABLE marcas (
    marca_id INTEGER PRIMARY KEY,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marcas ON marcas(marca_id);

-- Tabela: Famílias
DROP TABLE IF EXISTS familias;
CREATE TABLE familias (
    familia_id INTEGER PRIMARY KEY,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_familias ON familias(familia_id);

-- =====================================================
-- 2. PRODUTOS
-- =====================================================

DROP TABLE IF EXISTS produtos;
CREATE TABLE produtos (
    produto_id_old TEXT,
    descricao_old TEXT,
    descricao_reduzida_old TEXT,
    secao_id_old TEXT,
    grupo_id_old TEXT,
    subgrupo_id_old TEXT,
    familia_id_old TEXT,
    marca_id_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    produto_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    descricao_reduzida_new TEXT,
    secao_id_new INTEGER,
    grupo_id_new INTEGER,
    subgrupo_id_new INTEGER,
    familia_id_new INTEGER,
    marca_id_new INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (secao_id_new) REFERENCES secoes(secao_id_new) ON DELETE SET NULL,
    FOREIGN KEY (grupo_id_new) REFERENCES grupos(grupo_id_new) ON DELETE SET NULL,
    FOREIGN KEY (subgrupo_id_new) REFERENCES subgrupos(subgrupo_id_new) ON DELETE SET NULL,
    FOREIGN KEY (familia_id_new) REFERENCES familias(familia_id_new) ON DELETE SET NULL,
    FOREIGN KEY (marca_id_new) REFERENCES marcas(marca_id_new) ON DELETE SET NULL
);

CREATE INDEX idx_produtos_old ON produtos(produto_id_old);
CREATE INDEX idx_produtos_secao_old ON produtos(secao_id_old);
CREATE INDEX idx_produtos_grupo_old ON produtos(grupo_id_old);
CREATE INDEX idx_produtos_subgrupo_old ON produtos(subgrupo_id_old);
CREATE INDEX idx_produtos_familia_old ON produtos(familia_id_old);
CREATE INDEX idx_produtos_marca_old ON produtos(marca_id_old);
CREATE INDEX idx_produtos_secao_new ON produtos(secao_id_new);
CREATE INDEX idx_produtos_grupo_new ON produtos(grupo_id_new);
CREATE INDEX idx_produtos_subgrupo_new ON produtos(subgrupo_id_new);
CREATE INDEX idx_produtos_familia_new ON produtos(familia_id_new);
CREATE INDEX idx_produtos_marca_new ON produtos(marca_id_new);
CREATE INDEX idx_produtos_status ON produtos(status);

-- =====================================================
-- 3. ENTIDADES COMERCIAIS
-- =====================================================

-- Tabela: Clientes
DROP TABLE IF EXISTS clientes;
CREATE TABLE clientes (
    cliente_id_old TEXT,
    nome_old TEXT,
    cpf_cnpj_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    cliente_id_new INTEGER PRIMARY KEY,
    nome_new TEXT,
    cpf_cnpj_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_old ON clientes(cliente_id_old);
CREATE INDEX idx_clientes_cpf_cnpj_old ON clientes(cpf_cnpj_old);
CREATE INDEX idx_clientes_status ON clientes(status);

-- Tabela: Fornecedores
DROP TABLE IF EXISTS fornecedores;
CREATE TABLE fornecedores (
    fornecedor_id_old TEXT,
    nome_old TEXT,
    cpf_cnpj_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    fornecedor_id_new INTEGER PRIMARY KEY,
    nome_new TEXT,
    cpf_cnpj_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fornecedores_old ON fornecedores(fornecedor_id_old);
CREATE INDEX idx_fornecedores_cpf_cnpj_old ON fornecedores(cpf_cnpj_old);
CREATE INDEX idx_fornecedores_status ON fornecedores(status);

-- =====================================================
-- 4. ESTRUTURA OPERACIONAL
-- =====================================================

-- Tabela: Lojas
DROP TABLE IF EXISTS lojas;
CREATE TABLE lojas (
    loja_id_old TEXT,
    nome_old TEXT,
    cnpj_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    loja_id_new INTEGER PRIMARY KEY,
    nome_new TEXT,
    cnpj_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lojas_old ON lojas(loja_id_old);
CREATE INDEX idx_lojas_cnpj_old ON lojas(cnpj_old);
CREATE INDEX idx_lojas_status ON lojas(status);

-- Tabela: Caixas
DROP TABLE IF EXISTS caixas;
CREATE TABLE caixas (
    caixa_id_old TEXT,
    descricao_old TEXT,
    loja_id_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    caixa_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    loja_id_new INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loja_id_new) REFERENCES lojas(loja_id_new) ON DELETE SET NULL
);

CREATE INDEX idx_caixas_old ON caixas(caixa_id_old);
CREATE INDEX idx_caixas_loja_old ON caixas(loja_id_old);
CREATE INDEX idx_caixas_loja_new ON caixas(loja_id_new);
CREATE INDEX idx_caixas_status ON caixas(status);

-- Tabela: Local de Estoque
DROP TABLE IF EXISTS local_estoque;
CREATE TABLE local_estoque (
    local_id_old TEXT,
    descricao_old TEXT,
    loja_id_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    local_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    loja_id_new INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loja_id_new) REFERENCES lojas(loja_id_new) ON DELETE SET NULL
);

CREATE INDEX idx_local_estoque_old ON local_estoque(local_id_old);
CREATE INDEX idx_local_estoque_loja_old ON local_estoque(loja_id_old);
CREATE INDEX idx_local_estoque_loja_new ON local_estoque(loja_id_new);
CREATE INDEX idx_local_estoque_status ON local_estoque(status);

-- =====================================================
-- 5. ENTIDADES FINANCEIRAS
-- =====================================================

-- Tabela: Agentes (Bancos)
DROP TABLE IF EXISTS agentes;
CREATE TABLE agentes (
    agente_id_old TEXT,
    nome_old TEXT,
    fantasia_old TEXT,
    codigo_banco_old TEXT,
    tipo_pessoa_old TEXT,
    documento_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    agente_id_new INTEGER PRIMARY KEY,
    nome_new TEXT,
    fantasia_new TEXT,
    codigo_banco_new TEXT,
    tipo_pessoa_new TEXT,
    documento_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agentes_old ON agentes(agente_id_old);
CREATE INDEX idx_agentes_codigo_banco_old ON agentes(codigo_banco_old);
CREATE INDEX idx_agentes_status ON agentes(status);

-- Tabela: Categorias
DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias (
    categoria_id_old TEXT,
    descricao_old TEXT,
    categoria_pai_old TEXT,
    classificacao_old TEXT,
    tipo_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    categoria_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    categoria_pai_new INTEGER,
    classificacao_new TEXT,
    tipo_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_pai_new) REFERENCES categorias(categoria_id_new) ON DELETE SET NULL
);

CREATE INDEX idx_categorias_old ON categorias(categoria_id_old);
CREATE INDEX idx_categorias_pai_old ON categorias(categoria_pai_old);
CREATE INDEX idx_categorias_pai_new ON categorias(categoria_pai_new);
CREATE INDEX idx_categorias_status ON categorias(status);

-- Tabela: Contas Correntes
DROP TABLE IF EXISTS contas_correntes;
CREATE TABLE contas_correntes (
    conta_id_old TEXT,
    descricao_old TEXT,
    tipo_old TEXT,
    loja_id_old TEXT,
    agente_id_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    conta_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    tipo_new TEXT,
    loja_id_new INTEGER,
    agente_id_new INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loja_id_new) REFERENCES lojas(loja_id_new) ON DELETE SET NULL,
    FOREIGN KEY (agente_id_new) REFERENCES agentes(agente_id_new) ON DELETE SET NULL
);

CREATE INDEX idx_contas_correntes_old ON contas_correntes(conta_id_old);
CREATE INDEX idx_contas_correntes_loja_old ON contas_correntes(loja_id_old);
CREATE INDEX idx_contas_correntes_agente_old ON contas_correntes(agente_id_old);
CREATE INDEX idx_contas_correntes_loja_new ON contas_correntes(loja_id_new);
CREATE INDEX idx_contas_correntes_agente_new ON contas_correntes(agente_id_new);
CREATE INDEX idx_contas_correntes_status ON contas_correntes(status);

-- Tabela: Espécies de Documento
DROP TABLE IF EXISTS especies_documento;
CREATE TABLE especies_documento (
    especie_id_old TEXT,
    descricao_old TEXT,
    sigla_old TEXT,
    genero_old TEXT,
    modalidade_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    especie_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    sigla_new TEXT,
    genero_new TEXT,
    modalidade_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_especies_documento_old ON especies_documento(especie_id_old);
CREATE INDEX idx_especies_documento_status ON especies_documento(status);

-- Tabela: Histórico Padrão
DROP TABLE IF EXISTS historico_padrao;
CREATE TABLE historico_padrao (
    historico_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    historico_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historico_padrao_old ON historico_padrao(historico_id_old);
CREATE INDEX idx_historico_padrao_status ON historico_padrao(status);

-- =====================================================
-- 6. MOTIVOS E FORMAS DE PAGAMENTO
-- =====================================================

-- Tabela: Motivos de Cancelamento
DROP TABLE IF EXISTS motivos_cancelamento;
CREATE TABLE motivos_cancelamento (
    motivo_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    motivo_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_motivos_cancelamento_old ON motivos_cancelamento(motivo_id_old);
CREATE INDEX idx_motivos_cancelamento_status ON motivos_cancelamento(status);

-- Tabela: Motivos de Desconto
DROP TABLE IF EXISTS motivos_desconto;
CREATE TABLE motivos_desconto (
    motivo_id_old TEXT,
    descricao_old TEXT,
    percentual_old REAL,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    motivo_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    percentual_new REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_motivos_desconto_old ON motivos_desconto(motivo_id_old);
CREATE INDEX idx_motivos_desconto_status ON motivos_desconto(status);

-- Tabela: Motivos de Devolução
DROP TABLE IF EXISTS motivos_devolucao;
CREATE TABLE motivos_devolucao (
    motivo_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    motivo_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_motivos_devolucao_old ON motivos_devolucao(motivo_id_old);
CREATE INDEX idx_motivos_devolucao_status ON motivos_devolucao(status);

-- Tabela: Pagamentos PDV
DROP TABLE IF EXISTS pagamentos_pdv;
CREATE TABLE pagamentos_pdv (
    pagamento_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    pagamento_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pagamentos_pdv_old ON pagamentos_pdv(pagamento_id_old);
CREATE INDEX idx_pagamentos_pdv_status ON pagamentos_pdv(status);

-- Tabela: Recebimentos PDV
DROP TABLE IF EXISTS recebimentos_pdv;
CREATE TABLE recebimentos_pdv (
    recebimento_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    recebimento_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recebimentos_pdv_old ON recebimentos_pdv(recebimento_id_old);
CREATE INDEX idx_recebimentos_pdv_status ON recebimentos_pdv(status);

-- =====================================================
-- 7. FISCAL E TRIBUTÁRIO
-- =====================================================

-- Tabela: Impostos Federais
DROP TABLE IF EXISTS impostos_federais;
CREATE TABLE impostos_federais (
    imposto_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    imposto_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_impostos_federais_old ON impostos_federais(imposto_id_old);
CREATE INDEX idx_impostos_federais_status ON impostos_federais(status);

-- Tabela: Regime Tributário
DROP TABLE IF EXISTS regime_tributario;
CREATE TABLE regime_tributario (
    regime_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    regime_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regime_tributario_old ON regime_tributario(regime_id_old);
CREATE INDEX idx_regime_tributario_status ON regime_tributario(status);

-- Tabela: Situações Fiscais
DROP TABLE IF EXISTS situacoes_fiscais;
CREATE TABLE situacoes_fiscais (
    situacao_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    situacao_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_situacoes_fiscais_old ON situacoes_fiscais(situacao_id_old);
CREATE INDEX idx_situacoes_fiscais_status ON situacoes_fiscais(status);

-- Tabela: Tabelas Tributárias Entrada
DROP TABLE IF EXISTS tabelas_tributarias_entrada;
CREATE TABLE tabelas_tributarias_entrada (
    tabela_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    tabela_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tabelas_tributarias_entrada_old ON tabelas_tributarias_entrada(tabela_id_old);
CREATE INDEX idx_tabelas_tributarias_entrada_status ON tabelas_tributarias_entrada(status);

-- Tabela: Tabelas Tributárias Saída
DROP TABLE IF EXISTS tabelas_tributarias_saida;
CREATE TABLE tabelas_tributarias_saida (
    tabela_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    tabela_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tabelas_tributarias_saida_old ON tabelas_tributarias_saida(tabela_id_old);
CREATE INDEX idx_tabelas_tributarias_saida_status ON tabelas_tributarias_saida(status);

-- Tabela: Tipos de Operações
DROP TABLE IF EXISTS tipos_operacoes;
CREATE TABLE tipos_operacoes (
    tipo_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    tipo_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tipos_operacoes_old ON tipos_operacoes(tipo_id_old);
CREATE INDEX idx_tipos_operacoes_status ON tipos_operacoes(status);

-- Tabela: Tipos de Ajustes
DROP TABLE IF EXISTS tipos_ajustes;
CREATE TABLE tipos_ajustes (
    tipo_id_old TEXT,
    descricao_old TEXT,
    status TEXT CHECK(status IN ('C', 'U', 'D')) DEFAULT 'U',
    tipo_id_new INTEGER PRIMARY KEY,
    descricao_new TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tipos_ajustes_old ON tipos_ajustes(tipo_id_old);
CREATE INDEX idx_tipos_ajustes_status ON tipos_ajustes(status);

-- =====================================================
-- 8. LOGS DE SINCRONIZAÇÃO
-- =====================================================

DROP TABLE IF EXISTS log_sincronizacao;
CREATE TABLE log_sincronizacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidade TEXT NOT NULL,
    tipo_operacao TEXT CHECK(tipo_operacao IN ('IMPORTACAO', 'SINCRONIZACAO', 'DELECAO')),
    registro_id TEXT,
    status TEXT CHECK(status IN ('S', 'E', 'PENDENTE')) DEFAULT 'PENDENTE',
    mensagem TEXT,
    data_execucao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_entidade ON log_sincronizacao(entidade);
CREATE INDEX idx_log_status ON log_sincronizacao(status);
CREATE INDEX idx_log_data ON log_sincronizacao(data_execucao);

-- =====================================================
-- 9. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

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

-- Trigger: Atualizar data de modificação em Famílias
DROP TRIGGER IF EXISTS update_familias_timestamp;
CREATE TRIGGER update_familias_timestamp 
AFTER UPDATE ON familias
BEGIN
    UPDATE familias SET updated_at = CURRENT_TIMESTAMP WHERE familia_id_new = NEW.familia_id_new;
END;

-- Trigger: Atualizar data de modificação em Produtos
DROP TRIGGER IF EXISTS update_produtos_timestamp;
CREATE TRIGGER update_produtos_timestamp 
AFTER UPDATE ON produtos
BEGIN
    UPDATE produtos SET updated_at = CURRENT_TIMESTAMP WHERE produto_id_new = NEW.produto_id_new;
END;

-- Trigger: Atualizar data de modificação em Clientes
DROP TRIGGER IF EXISTS update_clientes_timestamp;
CREATE TRIGGER update_clientes_timestamp 
AFTER UPDATE ON clientes
BEGIN
    UPDATE clientes SET updated_at = CURRENT_TIMESTAMP WHERE cliente_id_new = NEW.cliente_id_new;
END;

-- Trigger: Atualizar data de modificação em Fornecedores
DROP TRIGGER IF EXISTS update_fornecedores_timestamp;
CREATE TRIGGER update_fornecedores_timestamp 
AFTER UPDATE ON fornecedores
BEGIN
    UPDATE fornecedores SET updated_at = CURRENT_TIMESTAMP WHERE fornecedor_id_new = NEW.fornecedor_id_new;
END;

-- Trigger: Atualizar data de modificação em Lojas
DROP TRIGGER IF EXISTS update_lojas_timestamp;
CREATE TRIGGER update_lojas_timestamp 
AFTER UPDATE ON lojas
BEGIN
    UPDATE lojas SET updated_at = CURRENT_TIMESTAMP WHERE loja_id_new = NEW.loja_id_new;
END;

-- Trigger: Atualizar data de modificação em Caixas
DROP TRIGGER IF EXISTS update_caixas_timestamp;
CREATE TRIGGER update_caixas_timestamp 
AFTER UPDATE ON caixas
BEGIN
    UPDATE caixas SET updated_at = CURRENT_TIMESTAMP WHERE caixa_id_new = NEW.caixa_id_new;
END;

-- Trigger: Atualizar data de modificação em Categorias
DROP TRIGGER IF EXISTS update_categorias_timestamp;
CREATE TRIGGER update_categorias_timestamp 
AFTER UPDATE ON categorias
BEGIN
    UPDATE categorias SET updated_at = CURRENT_TIMESTAMP WHERE categoria_id_new = NEW.categoria_id_new;
END;

-- Trigger: Atualizar data de modificação em Contas Correntes
DROP TRIGGER IF EXISTS update_contas_correntes_timestamp;
CREATE TRIGGER update_contas_correntes_timestamp 
AFTER UPDATE ON contas_correntes
BEGIN
    UPDATE contas_correntes SET updated_at = CURRENT_TIMESTAMP WHERE conta_id_new = NEW.conta_id_new;
END;

-- =====================================================
-- 10. VIEWS ÚTEIS
-- =====================================================

-- View: Produtos Completo
DROP VIEW IF EXISTS vw_produtos_completo;
CREATE VIEW vw_produtos_completo AS
SELECT 
    p.produto_id_old,
    p.produto_id_new,
    p.descricao_old,
    p.descricao_new,
    p.descricao_reduzida_old,
    p.descricao_reduzida_new,
    s.secao_id_old,
    s.secao_id_new,
    s.descricao_old AS secao_descricao_old,
    s.descricao_new AS secao_descricao_new,
    g.grupo_id_old,
    g.grupo_id_new,
    g.descricao_old AS grupo_descricao_old,
    g.descricao_new AS grupo_descricao_new,
    sg.subgrupo_id_old,
    sg.subgrupo_id_new,
    sg.descricao_old AS subgrupo_descricao_old,
    sg.descricao_new AS subgrupo_descricao_new,
    m.marca_id_old,
    m.marca_id_new,
    m.descricao_old AS marca_descricao_old,
    m.descricao_new AS marca_descricao_new,
    f.familia_id_old,
    f.familia_id_new,
    f.descricao_old AS familia_descricao_old,
    f.descricao_new AS familia_descricao_new,
    p.status,
    p.created_at,
    p.updated_at
FROM produtos p
LEFT JOIN secoes s ON p.secao_id_old = s.secao_id_old
LEFT JOIN grupos g ON p.grupo_id_old = g.grupo_id_old
LEFT JOIN subgrupos sg ON p.subgrupo_id_old = sg.subgrupo_id_old
LEFT JOIN marcas m ON p.marca_id_old = m.marca_id_old
LEFT JOIN familias f ON p.familia_id_old = f.familia_id_old;

-- View: Hierarquia Mercadológica
DROP VIEW IF EXISTS vw_hierarquia_mercadologica;
CREATE VIEW vw_hierarquia_mercadologica AS
SELECT 
    s.secao_id_old,
    s.secao_id_new,
    s.descricao_old AS secao_descricao_old,
    s.descricao_new AS secao_descricao_new,
    s.status AS secao_status,
    g.grupo_id_old,
    g.grupo_id_new,
    g.descricao_old AS grupo_descricao_old,
    g.descricao_new AS grupo_descricao_new,
    g.status AS grupo_status,
    sg.subgrupo_id_old,
    sg.subgrupo_id_new,
    sg.descricao_old AS subgrupo_descricao_old,
    sg.descricao_new AS subgrupo_descricao_new,
    sg.status AS subgrupo_status
FROM secoes s
LEFT JOIN grupos g ON s.secao_id_old = g.secao_id_old
LEFT JOIN subgrupos sg ON g.grupo_id_old = sg.grupo_id_old;

-- View: Relatório de Sincronização
DROP VIEW IF EXISTS vw_relatorio_sincronizacao;
CREATE VIEW vw_relatorio_sincronizacao AS
SELECT 
    'Seções' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM secoes
UNION ALL
SELECT 
    'Grupos' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM grupos
UNION ALL
SELECT 
    'Subgrupos' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM subgrupos
UNION ALL
SELECT 
    'Marcas' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM marcas
UNION ALL
SELECT 
    'Famílias' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM familias
UNION ALL
SELECT 
    'Produtos' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM produtos
UNION ALL
SELECT 
    'Clientes' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM clientes
UNION ALL
SELECT 
    'Fornecedores' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM fornecedores
UNION ALL
SELECT 
    'Lojas' AS entidade,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'U' THEN 1 ELSE 0 END) AS nao_vinculados,
    SUM(CASE WHEN status = 'C' THEN 1 ELSE 0 END) AS vinculados,
    SUM(CASE WHEN status = 'D' THEN 1 ELSE 0 END) AS deletados
FROM lojas;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT 'Banco de dados criado com sucesso! ✅' AS mensagem;