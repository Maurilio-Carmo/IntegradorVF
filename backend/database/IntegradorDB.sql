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

-- SEÇÕES

DROP TABLE IF EXISTS secoes;
CREATE TABLE secoes (
    secao_id INTEGER PRIMARY KEY,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GRUPOS

DROP TABLE IF EXISTS grupos;
CREATE TABLE grupos (
    grupo_id INTEGER PRIMARY KEY,
    secao_id INTEGER NOT NULL,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (secao_id) REFERENCES secoes(secao_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_grupos_grupo ON grupos(secao_id, grupo_id);

-- SUBGRUPOS

DROP TABLE IF EXISTS subgrupos;
CREATE TABLE subgrupos (
    subgrupo_id INTEGER PRIMARY KEY,
    secao_id INTEGER NOT NULL,
    grupo_id INTEGER NOT NULL,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (grupo_id) REFERENCES grupos(grupo_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_subgrupos_subgrupo ON subgrupos(secao_id, grupo_id, subgrupo_id);

-- MARCAS

DROP TABLE IF EXISTS marcas;
CREATE TABLE marcas (
    marca_id INTEGER PRIMARY KEY,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FAMILIAS

DROP TABLE IF EXISTS familias;
CREATE TABLE familias (
    familia_id INTEGER PRIMARY KEY,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PRODUTOS

DROP TABLE IF EXISTS produtos;
CREATE TABLE produtos (
	produto_id INTEGER PRIMARY KEY,
	descricao TEXT NOT NULL,
	descricao_reduzida TEXT NOT NULL,
	secao_id INTEGER,
	grupo_id INTEGER,
	subgrupo_id INTEGER,
	familia_id INTEGER,
	marca_id INTEGER,
	composicao TEXT CHECK(composicao IN ('NORMAL','COMPOSTO','KIT','RENDIMENTO')),
	peso_variavel TEXT CHECK(peso_variavel IN ('SIM','PESO','NAO','UNITARIO','PENDENTE')),
	unidade_compra TEXT NOT NULL,
	itens_embalagem REAL DEFAULT 1,
	unidade_venda TEXT NOT NULL,
	itens_embalagem_venda REAL DEFAULT 1,
	unidade_transf TEXT,
	itens_embalagem_transf REAL DEFAULT 1,
	peso_bruto REAL DEFAULT 0,
	peso_liquido REAL DEFAULT 0,
	rendimento_unidade REAL DEFAULT 0,
	rendimento_custo REAL DEFAULT 0,
	tabela_a TEXT CHECK(tabela_a IN ('NACIONAL','IMPORTACAO_DIRETA','ADQUIRIDO_DO_MERCADO_INTERNO','MERCADORIA_CONTENDO_IMPORTACAO_SUPERIOR_40','CUJO_PRODUCAO_TENHA_SIDO_FEITO','MERCADORIA_COM_CONTEUDO_DE_IMPORTACAO_EM_CONFORMIDADE','IMPORTACAO_DIRETA_SEM_SIMILAR_NACIONAL','ADQUIRIDO_DO_MERCADO_INTERNO_SEM_SIMILAR_NACIONAL','MERCADORIA_COM_CONTEUDO_DE_IMPORTACAO_SUPERIOR_A_70')),
	genero TEXT,
	ncm TEXT,
	cest TEXT,
	situacao_fiscal INTEGER,
	situacao_fiscal_saida INTEGER,
	regime_estadual INTEGER,
	impostos_federais TEXT,
	natureza_imposto INTEGER,
	permite_desconto INTEGER DEFAULT 0,
	desconto_maximo REAL DEFAULT 0,
	controla_estoque INTEGER DEFAULT 0,
	envia_balanca INTEGER DEFAULT 0,
	descricao_variavel INTEGER DEFAULT 0,
	preco_variavel INTEGER DEFAULT 0,
	ativo_ecommerce INTEGER DEFAULT 0,
	controla_validade INTEGER DEFAULT 0,
	validade_dias INTEGER DEFAULT 0,
	finalidade TEXT CHECK(finalidade IN ('COMERCIALIZACAO','CONSUMO','IMOBILIZADO','INDUSTRIALIZADO','MATERIA_PRIMA','OUTROS')),
	producao TEXT CHECK(producao IN ('PROPRIO','TERCEIROS')),
	unidade_referencia TEXT,
	medida_referencial REAL DEFAULT 1,
	indice_at TEXT CHECK(indice_at IN ('ARREDONDA','TRUNCA')),
    fora_linha INTEGER DEFAULT 0,
	data_saida DATETIME,
	data_inclusao DATETIME,
	data_alteracao DATETIME,
	status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (secao_id) REFERENCES secoes(secao_id) ON DELETE SET NULL,
    FOREIGN KEY (grupo_id) REFERENCES grupos(grupo_id) ON DELETE SET NULL,
    FOREIGN KEY (subgrupo_id) REFERENCES subgrupos(subgrupo_id) ON DELETE SET NULL,
    FOREIGN KEY (familia_id) REFERENCES familias(familia_id) ON DELETE SET NULL,
    FOREIGN KEY (marca_id) REFERENCES marcas(marca_id) ON DELETE SET NULL
);

CREATE INDEX idx_produtos_secao ON produtos(secao_id);
CREATE INDEX idx_produtos_grupo ON produtos(grupo_id);
CREATE INDEX idx_produtos_subgrupo ON produtos(subgrupo_id);
CREATE INDEX idx_produtos_familia ON produtos(familia_id);
CREATE INDEX idx_produtos_marca ON produtos(marca_id);

-- ESTOQUE MINIMO E MAXIMO

DROP TABLE IF EXISTS estoque_min_max;
CREATE TABLE estoque_min_max (
    produto_id INTEGER NOT NULL,
    loja_id INTEGER NOT NULL,
    estoque_minimo REAL,
    estoque_maximo REAL,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (produto_id, loja_id),
    FOREIGN KEY (produto_id) REFERENCES produtos(produto_id) ON DELETE CASCADE
);

CREATE INDEX idx_produto_estoque_loja ON estoque_min_max(loja_id);

-- CÓDIGOS AUXILIARES

DROP TABLE IF EXISTS codigos_auxiliares;
CREATE TABLE codigos_auxiliares (
    codigo_id TEXT PRIMARY KEY,
    produto_id INTEGER NOT NULL,
    fator REAL DEFAULT 1,
    ean_tributado INTEGER DEFAULT 0,
    tipo TEXT CHECK(tipo IN ('LITERAL','EAN')),
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(produto_id) ON DELETE CASCADE
);

-- PRODUTOS FORNECEDORES

DROP TABLE IF EXISTS produto_fornecedores;
CREATE TABLE produto_fornecedores (
    id INTEGER PRIMARY KEY,
    produto_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    referencia TEXT NOT NULL,
    unidade TEXT NOT NULL,
    fator REAL NOT NULL DEFAULT 1,
    nivel TEXT CHECK(nivel IN ('PRINCIPAL','SECUNDARIO')),
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id) REFERENCES produtos(produto_id) ON DELETE CASCADE,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(fornecedor_id) ON DELETE CASCADE
);

-- LOCAL DE ESTOQUE

DROP TABLE IF EXISTS local_estoque;
CREATE TABLE local_estoque (
    local_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo_de_estoque TEXT CHECK(tipo_de_estoque IN ('PROPRIO','TERCEIROS')),
    bloqueio INTEGER DEFAULT 0,
    avaria INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SALDO DE ESTOQUE

DROP TABLE IF EXISTS saldo_estoque;
CREATE TABLE saldo_estoque (
    saldo_id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    local_id INTEGER NOT NULL,
    saldo REAL NOT NULL DEFAULT 0,
    criado_em DATETIME,
    atualizado_em DATETIME,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id) ON DELETE SET NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(produto_id) ON DELETE SET NULL,
    FOREIGN KEY (local_id) REFERENCES local_estoque(local_id) ON DELETE SET NULL
);

-- AGENTES

DROP TABLE IF EXISTS agentes;
CREATE TABLE agentes (
	 agente_id INTEGER PRIMARY KEY,
	 nome TEXT,
	 fantasia TEXT,
	 codigo_do_banco TEXT,
	 tipo TEXT CHECK(tipo IN ('FISICA','JURIDICA')),
	 documento TEXT,
	 tipo_contribuinte TEXT CHECK(tipo_contribuinte IN ('CONTRIBUINTE','NAO_CONTRIBUINTE','ISENTO')),
	 inscricao_estadual TEXT,
	 telefone1 TEXT,
	 holding_id TEXT,
	 cep TEXT,
	 logradouro TEXT,
	 numero TEXT,
	 bairro TEXT,
	 municipio TEXT,
	 ibge TEXT,
	 uf TEXT,
	 pais TEXT,
	 tipo_de_endereco TEXT,
	 status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
     retorno TEXT,
	 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIAS

DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias (
    categoria_id INTEGER PRIMARY KEY,
    descricao TEXT,
    categoria_pai_id INTEGER,
    codigo_contabil TEXT,
    inativa INTEGER DEFAULT 0,
    posicao TEXT,
    classificacao TEXT CHECK(classificacao IN ('RECEITA','DESPESA')),
    tipo TEXT CHECK(tipo IN ('SINTETICA','ANALITICA')),
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CONTAS CORRENTES

DROP TABLE IF EXISTS contas_correntes;
CREATE TABLE contas_correntes (
    conta_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo TEXT CHECK(tipo IN ('CAIXA','BANCARIA')),
    ativa INTEGER DEFAULT 1,
    compoe_fluxo_caixa INTEGER DEFAULT 0,
    lancamento_consolidado INTEGER DEFAULT 0,
    loja_id INTEGER,
    nome_loja TEXT,
    agente_financeiro_id INTEGER,
    nome_banco TEXT,
    codigo_banco TEXT,
    agencia TEXT,
    conta TEXT,
    local_de_pagamento TEXT,
    identificacao_ofx TEXT CHECK(identificacao_ofx IN ('AGENCIA_NUMERO','NUMERO')),
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id) ON DELETE SET NULL,
    FOREIGN KEY (agente_financeiro_id) REFERENCES agentes(agente_id) ON DELETE SET NULL
);

-- ESPÉCIES DE DOCUMENTO

DROP TABLE IF EXISTS especies_documentos;
CREATE TABLE especies_documentos (
    especie_id INTEGER PRIMARY KEY,
    descricao TEXT,
    sigla TEXT,
    genero TEXT CHECK(genero IN ('PAGAR','RECEBER')),
    especie_nfe TEXT CHECK(especie_nfe IN ('DINHEIRO','CHEQUE','CARTAO_CREDITO','CARTAO_DEBITO','CARTAO_EM_LOJA','VALE_ALIMENTACAO','VALE_REFEICAO','VALE_PRESENTE','VALE_COMBUSTIVEL','DUPLICATA_MERCANTIL','BOLETO_BANCARIO','DEPOSITO_BANCARIO','PAGAMENTO_INSTANTANEO_PIX_DINAMICO','TRANSFERENCIA_BANCARIA','CASHBACK','PAGAMENTO_INSTANTANEO_PIX_ESTATICO','CREDITO_LOJA','PAGAMENTO_ELETRONICO_NAO_INFORMADO','SEM_PAGAMENTO','OUTROS')),
    modalidade TEXT CHECK(modalidade IN ('SIMPLES','COMPOSTO')),
    dias_para_juros INTEGER,
    tipo_valor_mora_diaria TEXT CHECK(tipo_valor_mora_diaria IN ('VALOR','PERCENTUAL')),
    mora_diaria_por_atraso REAL,
    dias_para_multa INTEGER,
    tipo_valor_multa TEXT CHECK(tipo_valor_multa IN ('VALOR','PERCENTUAL')),
    valor_multa_por_atraso REAL,
    emite_documento_vinculado INTEGER DEFAULT 0,
    quantidade_vias INTEGER,
    quantidade_autenticacoes INTEGER,
    especie_pdv TEXT CHECK(especie_pdv IN ('DINHEIRO','CHEQUE','CARTAO_CREDITO','CARTAO_DEBITO','VALE_ALIMENTACAO','VALE_REFEICAO','VALE_PRESENTE','VALE_COMBUSTIVEL','CREDIARIO','CONVENIO','FATURA','CARTAO_INTERNO','VALE_COMPRA','OUTROS','OUTRAS_MOEDAS','BOLETO_BANCARIO','DEPOSITO_BANCARIO','PAGAMENTO_INSTANTANEO_PIX_DINAMICO','RESGATE_FIDELIDADE','CREDITO_ANTECIPADO','TRANSF_BANCARIA_CARTEIRA_DIGIT','PAGAMENTO_INSTANTANEO_PIX_ESTATICO','CREDITO_LOJA','PAGAMENTO_ELETRONICO_NAO_INFORMADO')),
    controla_limite_credito INTEGER DEFAULT 0,
    tipo TEXT CHECK(tipo IN ('AVULSO','CONVENIO')),
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- HISTÓRICO PADRÃO

DROP TABLE IF EXISTS historico_padrao;
CREATE TABLE historico_padrao (
    historico_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo TEXT CHECK(tipo IN ('CREDITO','DEBITO')),
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- MOTIVOS DE CANCELAMENTO

DROP TABLE IF EXISTS motivos_cancelamento;
CREATE TABLE motivos_cancelamento (
	 motivo_id INTEGER PRIMARY KEY,
	 descricao TEXT,
	 tipo_aplicacao TEXT CHECK(tipo_aplicacao IN ('ITEM','CUPOM','AMBOS')),
	 solicita_justificativa INTEGER DEFAULT 0,
	 status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
     retorno TEXT,
	 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- MOTIVOS DE DESCONTO

DROP TABLE IF EXISTS motivos_desconto;
CREATE TABLE motivos_desconto (
	 motivo_id INTEGER PRIMARY KEY,
	 descricao TEXT,
	 tipo_aplicacao_desconto TEXT CHECK(tipo_aplicacao_desconto IN ('ITEM','SUB_TOTAL','AMBOS')),
	 tipo_calculo_aplicacao_desconto TEXT CHECK(tipo_calculo_aplicacao_desconto IN ('PERCENTUAL','VALOR','PERCENTUAL_E_VALOR')),
	 solicita_justificativa INTEGER DEFAULT 0,
	 desconto_fidelidade INTEGER DEFAULT 0,
	 status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
     retorno TEXT,
	 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- MOTIVOS DE DEVOLUÇÃO

DROP TABLE IF EXISTS motivos_devolucao;
CREATE TABLE motivos_devolucao (
    motivo_id INTEGER PRIMARY KEY,
    descricao TEXT,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FORMAS DE PAGAMENTO

DROP TABLE IF EXISTS formas_pagamento;
CREATE TABLE formas_pagamento (
    forma_pagamento_id          INTEGER PRIMARY KEY,
    descricao                   TEXT,
    especie_de_documento_id     INTEGER,
    categoria_financeira_id     INTEGER,
    agente_financeiro_id        INTEGER,
    controle_de_cartao          INTEGER DEFAULT 0,
    movimenta_conta_corrente    INTEGER DEFAULT 0,
    ativa                       INTEGER DEFAULT 1,
    conta_corrente_id           INTEGER,
    status                      TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno                     TEXT,
    created_at                  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (categoria_financeira_id) REFERENCES categorias(categoria_id)  ON DELETE SET NULL,
    FOREIGN KEY (agente_financeiro_id)    REFERENCES agentes(agente_id)        ON DELETE SET NULL
);

-- PAGAMENTOS PDV

DROP TABLE IF EXISTS pagamentos_pdv;
CREATE TABLE pagamentos_pdv (
    pagamento_id INTEGER PRIMARY KEY,
    descricao TEXT,
    categoria_id INTEGER,
    loja_id INTEGER,
    valor_maximo REAL,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id) ON DELETE SET NULL
);

-- RECEBIMENTOS PDV

DROP TABLE IF EXISTS recebimentos_pdv;
CREATE TABLE recebimentos_pdv (
    recebimento_id INTEGER PRIMARY KEY,
    descricao TEXT,
    categoria_id INTEGER,
    loja_id INTEGER,
    tipo_recebimento TEXT CHECK(tipo_recebimento IN ('PROPRIO','TERCEIRO','TAXA')),
    qtd_autenticacoes INTEGER DEFAULT 0,
    imprime_doc INTEGER DEFAULT 0,
    qtd_impressoes INTEGER DEFAULT 0,
    valor_recebimento REAL DEFAULT 0,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id) ON DELETE SET NULL
);

-- IMPOSTOS FEDERAIS

DROP TABLE IF EXISTS impostos_federais;
CREATE TABLE impostos_federais (
    imposto_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo_imposto TEXT CHECK(tipo_imposto IN ('PIS','COFINS','IRPJ','CSLL','OUTROS')),
    cst_entrada_real TEXT,
    cst_saida_real TEXT,
    aliquota_entrada_real REAL DEFAULT 0,
    aliquota_saida_real REAL DEFAULT 0,
    cst_entrada_presumido TEXT,
    cst_saida_presumido TEXT,
    aliquota_entrada_presumido REAL DEFAULT 0,
    aliquota_saida_presumido REAL DEFAULT 0,
    cst_entrada_simples TEXT,
    cst_saida_simples TEXT,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- REGIME TRIBUTÁRIO

DROP TABLE IF EXISTS regime_tributario;
CREATE TABLE regime_tributario (
    regime_id INTEGER PRIMARY KEY,
    descricao TEXT,
    classificacao TEXT CHECK(classificacao IN ('N','E','A','S')),
    loja INTEGER DEFAULT 0,
    fornecedor INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SITUAÇÕES FISCAIS

DROP TABLE IF EXISTS situacoes_fiscais;
CREATE TABLE situacoes_fiscais (
    situacao_id INTEGER PRIMARY KEY,
    descricao TEXT,
    descricao_completa TEXT,
    substituto INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABELAS TRIBUTÁRIAS ENTRADA

DROP TABLE IF EXISTS tabelas_tributarias_entrada;
CREATE TABLE tabelas_tributarias_entrada (
    tabela_id INTEGER,
    regime_estadual_id INTEGER,
    situacao_fiscal_id INTEGER,
    figura_fiscal_id TEXT,
    uf_origem TEXT,
    classificacao_pessoa TEXT CHECK(classificacao_pessoa IN ('ENTRADA_DE_INDUSTRIA','ENTRADA_DE_DISTRIBUIDOR','ENTRADA_DE_MICROEMPRESA','ENTRADA_DE_VAREJO','ENTRADA_DE_TRANSFERENCIA')),
    uf_destino TEXT,
    tributado_nf REAL DEFAULT 0,
    isento_nf REAL DEFAULT 0,
    outros_nf REAL DEFAULT 0,
    aliquota REAL DEFAULT 0,
    agregado REAL DEFAULT 0,
    tributado_icms REAL DEFAULT 0,
    carga_liquida REAL DEFAULT 0,
    aliquota_interna REAL DEFAULT 0,
    fecop REAL DEFAULT 0,
    fecop_st REAL DEFAULT 0,
    soma_ipi_bc INTEGER DEFAULT 0,
    soma_ipi_bs INTEGER DEFAULT 0,
    st_destacado INTEGER DEFAULT 0,
    cst_id TEXT,
    csosn TEXT,
    tributacao TEXT,
    cfop_id TEXT,
    icms_desonerado INTEGER DEFAULT 0,
    icms_origem TEXT,
    icms_efetivo INTEGER DEFAULT 0,
    reducao_origem REAL DEFAULT 0,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (tabela_id, classificacao_pessoa, uf_destino),
    FOREIGN KEY (regime_estadual_id) REFERENCES regime_tributario(regime_id) ON DELETE SET NULL,
    FOREIGN KEY (situacao_fiscal_id) REFERENCES situacoes_fiscais(situacao_id) ON DELETE SET NULL
);

-- TABELAS TRIBUTÁRIAS SAÍDA

DROP TABLE IF EXISTS tabelas_tributarias_saida;
CREATE TABLE tabelas_tributarias_saida (
    tabela_id INTEGER,
    regime_estadual_id INTEGER,
    situacao_fiscal_id INTEGER,
    figura_fiscal_id TEXT,
    uf_origem TEXT,
    classificacao_pessoa TEXT CHECK(classificacao_pessoa IN ('SAIDA_PARA_CONTRIBUINTE','SAIDA_PARA_NAO_CONTRIBUINTE','SAIDA_PARA_TRANSFERENCIA')),
    uf_destino TEXT,
    tributado_nf REAL DEFAULT 0,
    isento_nf REAL DEFAULT 0,
    outros_nf REAL DEFAULT 0,
    aliquota REAL DEFAULT 0,
    agregado REAL DEFAULT 0,
    tributado_icms REAL DEFAULT 0,
    carga_liquida REAL DEFAULT 0,
    aliquota_interna REAL DEFAULT 0,
    fecop REAL DEFAULT 0,
    fecop_st REAL DEFAULT 0,
    soma_ipi_bc INTEGER DEFAULT 0,
    soma_ipi_bs INTEGER DEFAULT 0,
    st_destacado INTEGER DEFAULT 0,
    cst_id TEXT,
    csosn TEXT,
    tributacao TEXT,
    cfop_id TEXT,
    icms_desonerado INTEGER DEFAULT 0,
    icms_origem TEXT,
    icms_efetivo INTEGER DEFAULT 0,
    reducao_origem REAL DEFAULT 0,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (tabela_id, classificacao_pessoa, uf_destino),
    FOREIGN KEY (regime_estadual_id) REFERENCES regime_tributario(regime_id) ON DELETE SET NULL,
    FOREIGN KEY (situacao_fiscal_id) REFERENCES situacoes_fiscais(situacao_id) ON DELETE SET NULL
);

-- TIPOS DE OPERAÇÕES

DROP TABLE IF EXISTS tipos_operacoes;
CREATE TABLE tipos_operacoes (
    operacao_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo_de_operacao TEXT,
    tipo_geracao_financeiro TEXT,
    modalidade TEXT,
    tipo_documento TEXT,
    origem_da_nota TEXT,
    atualiza_custos INTEGER DEFAULT 0,
    atualiza_estoque INTEGER DEFAULT 0,
    incide_impostos_federais INTEGER DEFAULT 0,
    ipi_compoe_base_pis_cofins INTEGER DEFAULT 0,
    outras_desp_base_pis_cofins INTEGER DEFAULT 0,
    outras_desp_base_icms INTEGER DEFAULT 0,
    gera_fiscal INTEGER DEFAULT 0,
    destaca_ipi INTEGER DEFAULT 0,
    destaca_icms INTEGER DEFAULT 0,
    compoe_abc INTEGER DEFAULT 0,
    imprime_descricao_nfe INTEGER DEFAULT 0,
    envia_observacao_nfe INTEGER DEFAULT 0,
    utiliza_conferencia INTEGER DEFAULT 0,
    cfop_no_estado TEXT,
    cfop_fora_do_estado TEXT,
    cfop_exterior TEXT,
    observacao TEXT,
    codigo_cst TEXT,
    cfops_relacionados TEXT,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TIPOS DE AJUSTES

DROP TABLE IF EXISTS tipos_ajustes;
CREATE TABLE tipos_ajustes (
    ajuste_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo TEXT CHECK(tipo IN ('ENTRADA','SAIDA')),
    tipo_de_operacao TEXT,
    tipo_reservado TEXT,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- LOJAS

DROP TABLE IF EXISTS lojas;
CREATE TABLE lojas (
	loja_id INTEGER PRIMARY KEY,
	nome TEXT,
	fantasia TEXT,
	perfil_fiscal TEXT,
	atividade_economica TEXT,
	ramo_atuacao_id TEXT,
	agente_validacao TEXT,
	crt TEXT,
	matriz INTEGER DEFAULT 0,
	sigla TEXT,
	mail TEXT,
	telefone TEXT,
	cep TEXT,
	uf TEXT,
	cidade TEXT,
	logradouro TEXT,
	numero INTEGER,
	bairro TEXT,
	tipo TEXT,
	tipo_contribuinte TEXT,
	ativo INTEGER DEFAULT 1,
	ecommerce INTEGER DEFAULT 0,
	locais_da_loja_ids TEXT,
	status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTES

DROP TABLE IF EXISTS clientes;
CREATE TABLE clientes (
    cliente_id INTEGER PRIMARY KEY,
    tipo_de_pessoa TEXT CHECK(tipo_de_pessoa IN ('FISICA','JURIDICA','ESTRANGEIRO')),
    documento TEXT,
    nome TEXT,
    fantasia TEXT,
    holding_id INTEGER DEFAULT 1,
    tipo_contribuinte TEXT CHECK(tipo_contribuinte IN ('CONTRIBUINTE','NAO_CONTRIBUINTE','ISENTO')) DEFAULT 'ISENTO',
    inscricao_estadual TEXT DEFAULT 'ISENTO',
    telefone1 TEXT,
    telefone2 TEXT,
    email TEXT,
    data_nascimento DATETIME,
    estado_civil TEXT CHECK(estado_civil IN ('SOLTEIRO','CASADO','DIVORCIADO','VIUVO','OUTROS')),
    sexo TEXT CHECK(sexo IN ('MASCULINO','FEMININO')),
    orgao_publico INTEGER DEFAULT 0,
    retem_iss INTEGER DEFAULT 0,
    ramo INTEGER DEFAULT 0,
    observacao TEXT,
    tipo_preco INTEGER DEFAULT 1,
    tipo_bloqueio INTEGER DEFAULT 0,
    desconto INTEGER DEFAULT 0,
    tabela_prazo TEXT CHECK(tabela_prazo IN ('DF','PRZ','DFM','DFD','DFS','DFQ')) DEFAULT 'PRZ',
    prazo INTEGER DEFAULT 30,
    corte INTEGER,
    vendedor_id INTEGER,
    cep TEXT,
    logradouro TEXT,
    numero INTEGER,
    complemento TEXT,
    referencia TEXT,
    bairro TEXT,
    municipio TEXT,
    ibge INTEGER,
    uf TEXT,
    pais INTEGER,
    data_cadastro DATETIME,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FORNECEDORES

DROP TABLE IF EXISTS fornecedores;
CREATE TABLE fornecedores (
    fornecedor_id INTEGER PRIMARY KEY,
    tipo_pessoa TEXT CHECK(tipo_pessoa IN ('FISICA','JURIDICA','ESTRANGEIRO')),
    documento TEXT,
    nome TEXT,
    fantasia TEXT,
    holding_id INTEGER,
    tipo_contribuinte TEXT CHECK(tipo_contribuinte IN ('CONTRIBUINTE','NAO_CONTRIBUINTE','ISENTO')),
    inscricao_estadual TEXT,
    telefone1 TEXT,
    telefone2 TEXT,
    email TEXT,
    tipo_fornecedor TEXT CHECK(tipo_fornecedor IN ('INDUSTRIA','DISTRIBUIDORA','VAREJO','SIMPLES_NACIONAL','OUTROS')),
    servico INTEGER DEFAULT 0,
    transportadora INTEGER DEFAULT 0,
    produtor_rural INTEGER DEFAULT 0,
    inscricao_municipal TEXT,
    tabela_prazo TEXT CHECK(tabela_prazo IN ('DF','PRZ','DFM','DFD','DFS','DFQ')),
    prazo INTEGER,
    prazo_entrega INTEGER,
    tipo_frete TEXT CHECK(tipo_frete IN ('SEM_FRETE','EMITENTE','DESTINATARIO','TERCEIRO','EMITENTE_PROPRIO','DESTINATARIO_PROPRIO')),
    observacao TEXT,
    desativa_pedido INTEGER DEFAULT 0,
    tipo_pedido TEXT CHECK(tipo_pedido IN ('NAO_GERENCIADO','GERENCIADO_MAESTRO')),
    regime_estadual INTEGER,
    destaca_substituicao TEXT CHECK(destaca_substituicao IN ('DESPESAS_ACESSORIAS','CAMPO_PROPRIO','DADOS_COMPLEMENTARES')),
    considera_desoneracao INTEGER DEFAULT 0,
    cep TEXT,
    logradouro TEXT,
    numero INTEGER,
    complemento TEXT,
    referencia TEXT,
    bairro TEXT,
    municipio TEXT,
    ibge INTEGER,
    uf TEXT,
    pais INTEGER,
    criado_em DATETIME,
    atualizado_em DATETIME,
    status TEXT CHECK(status IN ('C','U','D','E','S')) DEFAULT 'U',
    retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- LOG DE SINCRONIZAÇÃO

DROP TABLE IF EXISTS log_sincronizacao;
CREATE TABLE log_sincronizacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidade TEXT NOT NULL,
    tipo_operacao TEXT CHECK(tipo_operacao IN ('IMPORTACAO','SINCRONIZACAO','DELECAO')),
    registro_id TEXT,
    status TEXT CHECK(status IN ('S','E','PENDENTE')) DEFAULT 'PENDENTE',
    mensagem TEXT,
    data_execucao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_id ON log_sincronizacao(id);
CREATE INDEX idx_log_entidade ON log_sincronizacao(entidade);
CREATE INDEX idx_log_status ON log_sincronizacao(status);
CREATE INDEX idx_log_data ON log_sincronizacao(data_execucao);

-- TRIGGERS 

DROP TRIGGER IF EXISTS trg_secoes_updated_at;
CREATE TRIGGER trg_secoes_updated_at
AFTER UPDATE ON secoes
BEGIN
    UPDATE secoes SET updated_at = CURRENT_TIMESTAMP WHERE secao_id = NEW.secao_id;
END;

DROP TRIGGER IF EXISTS trg_grupos_updated_at;
CREATE TRIGGER trg_grupos_updated_at
AFTER UPDATE ON grupos
BEGIN
    UPDATE grupos SET updated_at = CURRENT_TIMESTAMP WHERE grupo_id = NEW.grupo_id;
END;

DROP TRIGGER IF EXISTS trg_subgrupos_updated_at;
CREATE TRIGGER trg_subgrupos_updated_at
AFTER UPDATE ON subgrupos
BEGIN
    UPDATE subgrupos SET updated_at = CURRENT_TIMESTAMP WHERE subgrupo_id = NEW.subgrupo_id;
END;

DROP TRIGGER IF EXISTS trg_marcas_updated_at;
CREATE TRIGGER trg_marcas_updated_at
AFTER UPDATE ON marcas
BEGIN
    UPDATE marcas SET updated_at = CURRENT_TIMESTAMP WHERE marca_id = NEW.marca_id;
END;

DROP TRIGGER IF EXISTS trg_familias_updated_at;
CREATE TRIGGER trg_familias_updated_at
AFTER UPDATE ON familias
BEGIN
    UPDATE familias SET updated_at = CURRENT_TIMESTAMP WHERE familia_id = NEW.familia_id;
END;

DROP TRIGGER IF EXISTS trg_produtos_updated_at;
CREATE TRIGGER trg_produtos_updated_at
AFTER UPDATE ON produtos
BEGIN
    UPDATE produtos SET updated_at = CURRENT_TIMESTAMP WHERE produto_id = NEW.produto_id;
END;

DROP TRIGGER IF EXISTS trg_estoque_min_max_updated_at;
CREATE TRIGGER trg_estoque_min_max_updated_at
AFTER UPDATE ON estoque_min_max
BEGIN
    UPDATE estoque_min_max SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS trg_codigos_auxiliares_updated_at;
CREATE TRIGGER trg_codigos_auxiliares_updated_at
AFTER UPDATE ON codigos_auxiliares
BEGIN
    UPDATE estoque_min_max SET updated_at = CURRENT_TIMESTAMP WHERE produto_id = NEW.produto_id AND loja_id = NEW.loja_id;
END;

DROP TRIGGER IF EXISTS trg_produto_fornecedores_updated_at;
CREATE TRIGGER trg_produto_fornecedores_updated_at
AFTER UPDATE ON produto_fornecedores
BEGIN
    UPDATE produto_fornecedores SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS trg_lojas_updated_at;
CREATE TRIGGER trg_lojas_updated_at
AFTER UPDATE ON lojas
BEGIN
    UPDATE lojas SET updated_at = CURRENT_TIMESTAMP WHERE loja_id = NEW.loja_id;
END;

DROP TRIGGER IF EXISTS trg_clientes_updated_at;
CREATE TRIGGER trg_clientes_updated_at
AFTER UPDATE ON clientes
BEGIN
    UPDATE clientes SET updated_at = CURRENT_TIMESTAMP WHERE cliente_id = NEW.cliente_id;
END;

DROP TRIGGER IF EXISTS trg_fornecedores_updated_at;
CREATE TRIGGER trg_fornecedores_updated_at
AFTER UPDATE ON fornecedores
BEGIN
    UPDATE fornecedores SET updated_at = CURRENT_TIMESTAMP WHERE fornecedor_id = NEW.fornecedor_id;
END;

DROP TRIGGER IF EXISTS trg_local_estoque_updated_at;
CREATE TRIGGER trg_local_estoque_updated_at
AFTER UPDATE ON local_estoque
BEGIN
    UPDATE local_estoque SET updated_at = CURRENT_TIMESTAMP WHERE local_id = NEW.local_id;
END;

DROP TRIGGER IF EXISTS trg_saldo_estoque_updated_at;
CREATE TRIGGER trg_saldo_estoque_updated_at
AFTER UPDATE ON saldo_estoque
BEGIN
    UPDATE saldo_estoque SET updated_at = CURRENT_TIMESTAMP WHERE saldo_id = NEW.saldo_id;
END;

DROP TRIGGER IF EXISTS trg_agentes_updated_at;
CREATE TRIGGER trg_agentes_updated_at
AFTER UPDATE ON agentes
BEGIN
    UPDATE agentes SET updated_at = CURRENT_TIMESTAMP WHERE agente_id = NEW.agente_id;
END;

DROP TRIGGER IF EXISTS trg_categorias_updated_at;
CREATE TRIGGER trg_categorias_updated_at
AFTER UPDATE ON categorias
BEGIN
    UPDATE categorias SET updated_at = CURRENT_TIMESTAMP WHERE categoria_id = NEW.categoria_id;
END;

DROP TRIGGER IF EXISTS trg_contas_correntes_updated_at;
CREATE TRIGGER trg_contas_correntes_updated_at
AFTER UPDATE ON contas_correntes
BEGIN
    UPDATE contas_correntes SET updated_at = CURRENT_TIMESTAMP WHERE conta_id = NEW.conta_id;
END;

DROP TRIGGER IF EXISTS trg_especies_documentos_updated_at;
CREATE TRIGGER trg_especies_documentos_updated_at
AFTER UPDATE ON especies_documentos
BEGIN
    UPDATE especies_documentos SET updated_at = CURRENT_TIMESTAMP WHERE especie_id = NEW.especie_id;
END;

DROP TRIGGER IF EXISTS trg_historico_padrao_updated_at;
CREATE TRIGGER trg_historico_padrao_updated_at
AFTER UPDATE ON historico_padrao
BEGIN
    UPDATE historico_padrao SET updated_at = CURRENT_TIMESTAMP WHERE historico_id = NEW.historico_id;
END;

DROP TRIGGER IF EXISTS trg_formas_pagamento_updated_at;
CREATE TRIGGER trg_formas_pagamento_updated_at
AFTER UPDATE ON formas_pagamento
BEGIN
    UPDATE formas_pagamento SET updated_at = CURRENT_TIMESTAMP WHERE forma_pagamento_id = NEW.forma_pagamento_id;
END;

DROP TRIGGER IF EXISTS trg_motivos_cancelamento_updated_at;
CREATE TRIGGER trg_motivos_cancelamento_updated_at
AFTER UPDATE ON motivos_cancelamento
BEGIN
    UPDATE motivos_cancelamento SET updated_at = CURRENT_TIMESTAMP WHERE motivo_id = NEW.motivo_id;
END;

DROP TRIGGER IF EXISTS trg_motivos_desconto_updated_at;
CREATE TRIGGER trg_motivos_desconto_updated_at
AFTER UPDATE ON motivos_desconto
BEGIN
    UPDATE motivos_desconto SET updated_at = CURRENT_TIMESTAMP WHERE motivo_id = NEW.motivo_id;
END;

DROP TRIGGER IF EXISTS trg_motivos_devolucao_updated_at;
CREATE TRIGGER trg_motivos_devolucao_updated_at
AFTER UPDATE ON motivos_devolucao
BEGIN
    UPDATE motivos_devolucao SET updated_at = CURRENT_TIMESTAMP WHERE motivo_id = NEW.motivo_id;
END;

DROP TRIGGER IF EXISTS trg_pagamentos_pdv_updated_at;
CREATE TRIGGER trg_pagamentos_pdv_updated_at
AFTER UPDATE ON pagamentos_pdv
BEGIN
    UPDATE pagamentos_pdv SET updated_at = CURRENT_TIMESTAMP WHERE pagamento_id = NEW.pagamento_id;
END;

DROP TRIGGER IF EXISTS trg_recebimentos_pdv_updated_at;
CREATE TRIGGER trg_recebimentos_pdv_updated_at
AFTER UPDATE ON recebimentos_pdv
BEGIN
    UPDATE recebimentos_pdv SET updated_at = CURRENT_TIMESTAMP WHERE recebimento_id = NEW.recebimento_id;
END;

DROP TRIGGER IF EXISTS trg_impostos_federais_updated_at;
CREATE TRIGGER trg_impostos_federais_updated_at
AFTER UPDATE ON impostos_federais
BEGIN
    UPDATE impostos_federais SET updated_at = CURRENT_TIMESTAMP WHERE imposto_id = NEW.imposto_id;
END;

DROP TRIGGER IF EXISTS trg_regime_tributario_updated_at;
CREATE TRIGGER trg_regime_tributario_updated_at
AFTER UPDATE ON regime_tributario
BEGIN
    UPDATE regime_tributario SET updated_at = CURRENT_TIMESTAMP WHERE regime_id = NEW.regime_id;
END;

DROP TRIGGER IF EXISTS trg_situacoes_fiscais_updated_at;
CREATE TRIGGER trg_situacoes_fiscais_updated_at
AFTER UPDATE ON situacoes_fiscais
BEGIN
    UPDATE situacoes_fiscais SET updated_at = CURRENT_TIMESTAMP WHERE situacao_id = NEW.situacao_id;
END;

DROP TRIGGER IF EXISTS trg_tipos_operacoes_updated_at;
CREATE TRIGGER trg_tipos_operacoes_updated_at
AFTER UPDATE ON tipos_operacoes
BEGIN
    UPDATE tipos_operacoes SET updated_at = CURRENT_TIMESTAMP WHERE operacao_id = NEW.operacao_id;
END;

DROP TRIGGER IF EXISTS trg_tipos_ajustes_updated_at;
CREATE TRIGGER trg_tipos_ajustes_updated_at
AFTER UPDATE ON tipos_ajustes
BEGIN
    UPDATE tipos_ajustes SET updated_at = CURRENT_TIMESTAMP WHERE ajuste_id = NEW.ajuste_id;
END;


-- =====================================================
-- VIEWS
-- =====================================================

-- View: Produto com hierarquia mercadológica completa
DROP VIEW IF EXISTS vw_produtos_completo;
CREATE VIEW vw_produtos_completo AS
SELECT
    p.produto_id,
    p.descricao,
    p.descricao_reduzida,
    p.codigo_interno,
    p.secao_id,
    s.descricao AS secao_descricao,
    p.grupo_id,
    g.descricao AS grupo_descricao,
    p.subgrupo_id,
    sg.descricao AS subgrupo_descricao,
    p.familia_id,
    f.descricao AS familia_descricao,
    p.marca_id,
    m.descricao AS marca_descricao,
    p.fora_de_linha,
    p.status,
    p.created_at,
    p.updated_at
FROM produtos p
LEFT JOIN secoes s ON p.secao_id = s.secao_id
LEFT JOIN grupos g ON p.secao_id = s.secao_id and p.grupo_id = g.grupo_id
LEFT JOIN subgrupos sg ON p.secao_id = s.secao_id and p.grupo_id = g.grupo_id and p.subgrupo_id = sg.subgrupo_id
LEFT JOIN familias f ON p.familia_id = f.familia_id
LEFT JOIN marcas m ON p.marca_id = m.marca_id;

-- View: Hierarquia mercadológica (seção → grupo → subgrupo)
DROP VIEW IF EXISTS vw_hierarquia_mercadologica;
CREATE VIEW vw_hierarquia_mercadologica AS
SELECT
    s.secao_id,
    s.descricao_old AS secao_old,
    s.descricao_new AS secao_new,
    g.grupo_id,
    g.descricao_old AS grupo_old,
    g.descricao_new AS grupo_new,
    sg.subgrupo_id,
    sg.descricao_old AS subgrupo_old,
    sg.descricao_new AS subgrupo_new
FROM secoes s
LEFT JOIN grupos g ON s.secao_id = g.secao_id
LEFT JOIN subgrupos sg ON g.grupo_id = sg.grupo_id;

-- VIEW auxiliar: saldo com descrições
DROP VIEW IF EXISTS vw_saldo_estoque_completo;
CREATE VIEW vw_saldo_estoque_completo AS
SELECT
    se.saldo_id,
    se.loja_id,
    se.produto_id,
    p.descricao AS produto_descricao,
    p.codigo_interno AS produto_codigo,
    se.local_id,
    le.descricao AS local_descricao,
    se.saldo,
    se.criado_em,
    se.atualizado_em,
    se.status,
    se.retorno,
    se.created_at,
    se.updated_at
FROM saldo_estoque se
LEFT JOIN produtos p ON se.produto_id = p.produto_id
LEFT JOIN local_estoque le ON se.local_id = le.local_id;

-- View: Relatório geral de sincronização por entidade
DROP VIEW IF EXISTS vw_relatorio_sincronizacao;
CREATE VIEW vw_relatorio_sincronizacao AS
SELECT 'Seções'                   AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM secoes UNION ALL
SELECT 'Grupos'                   AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM grupos UNION ALL
SELECT 'Subgrupos'                AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM subgrupos UNION ALL
SELECT 'Marcas'                   AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM marcas UNION ALL
SELECT 'Famílias'                 AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM familias UNION ALL
SELECT 'Produtos'                 AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM produtos UNION ALL
SELECT 'Estoque Mín Máx'          AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM estoque_min_max UNION ALL
SELECT 'Codigos Auxiliares'       AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM codigos_auxiliares UNION ALL
SELECT 'Produto Fornecedores'     AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM produto_fornecedores UNION ALL
SELECT 'Categorias'               AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM categorias UNION ALL
SELECT 'Agentes'                  AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM agentes UNION ALL
SELECT 'Contas Correntes'         AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM contas_correntes UNION ALL
SELECT 'Espécies Documentos'      AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM especies_documentos UNION ALL
SELECT 'Histórico Padrão'         AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM historico_padrao UNION ALL
SELECT 'Formas de Pagamento'      AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM formas_pagamento UNION ALL
SELECT 'Pagamentos PDV'           AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM pagamentos_pdv UNION ALL
SELECT 'Recebimentos PDV'         AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM recebimentos_pdv UNION ALL
SELECT 'Motivos Desconto'         AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM motivos_desconto UNION ALL
SELECT 'Motivos Devolução'        AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM motivos_devolucao UNION ALL
SELECT 'Motivos Cancelamento'     AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM motivos_cancelamento UNION ALL
SELECT 'Local Estoque'            AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM local_estoque UNION ALL
SELECT 'Tipos Ajustes'            AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM tipos_ajustes UNION ALL
SELECT 'Saldo de Estoque'         AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM saldo_estoque UNION ALL
SELECT 'Regime Tributário'        AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM regime_tributario UNION ALL
SELECT 'Situações Fiscais'        AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM situacoes_fiscais UNION ALL
SELECT 'Tipos Operações'          AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM tipos_operacoes UNION ALL
SELECT 'Impostos Federais'        AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM impostos_federais UNION ALL
SELECT 'Tab. Tributárias Entrada' AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM tabelas_tributarias_entrada UNION ALL
SELECT 'Tab. Tributárias Saída'   AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM tabelas_tributarias_saida UNION ALL
SELECT 'Lojas'                    AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM lojas UNION ALL
SELECT 'Clientes'                 AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM clientes UNION ALL
SELECT 'Fornecedores'             AS entidade, COUNT(*) AS total, SUM(status='U') AS pendentes, SUM(status='C') AS sincronizados, SUM(status='D') AS deletados, SUM(status='E') AS erros FROM fornecedores;

-- =====================================================
SELECT 'Banco de dados criado com sucesso! ✅' AS mensagem;