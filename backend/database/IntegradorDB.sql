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
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
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
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (secao_id) REFERENCES secoes(secao_id) ON UPDATE CASCADE ON DELETE RESTRICT
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
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (secao_id) REFERENCES secoes(secao_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (grupo_id) REFERENCES grupos(grupo_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_subgrupos_subgrupo ON subgrupos(secao_id, grupo_id, subgrupo_id);

-- MARCAS

DROP TABLE IF EXISTS marcas;
CREATE TABLE marcas (
    marca_id INTEGER PRIMARY KEY,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FAMILIAS

DROP TABLE IF EXISTS familias;
CREATE TABLE familias (
    familia_id INTEGER PRIMARY KEY,
    descricao_old TEXT,
    descricao_new TEXT,
    status TEXT CHECK (status IN ('C','U','D')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PRODUTOS

DROP TABLE IF EXISTS produtos;
CREATE TABLE produtos (
	produto_id INTEGER PRIMARY KEY, 
	descricao TEXT, 
	descricao_reduzida TEXT, 
	codigo_interno TEXT, 
	secao_id INTEGER, 
	grupo_id INTEGER, 
	subgrupo_id INTEGER, 
	familia_id INTEGER, 
	marca_id INTEGER, 
	estoque_minimo REAL, 
	estoque_maximo REAL, 
	composicao TEXT CHECK(composicao IN ('NORMAL','COMPOSTO','KIT','RENDIMENTO')),
	peso_variavel TEXT CHECK(peso_variavel IN ('SIM','PESO','NAO','UNITARIO','PENDENTE')),
	unidade_compra TEXT, 
	itens_embalagem INTEGER, 
	unidade_venda TEXT, 
	itens_embalagem_venda INTEGER, 
	unidade_transf TEXT, 
	itens_embalagem_transf INTEGER, 
	peso_bruto REAL DEFAULT 0, 
	peso_liquido REAL DEFAULT 0, 
	fator_rendimento_unidade REAL DEFAULT 0,
	fator_rendimento_custo REAL DEFAULT 0,
	tabela_a TEXT CHECK(tabela_a IN ('NACIONAL','IMPORTACAO_DIRETA','ADQUIRIDO_DO_MERCADO_INTERNO','MERCADORIA_CONTENDO_IMPORTACAO_SUPERIOR_40','CUJO_PRODUCAO_TENHA_SIDO_FEITO','MERCADORIA_COM_CONTEUDO_DE_IMPORTACAO_EM_CONFORMIDADE','IMPORTACAO_DIRETA_SEM_SIMILAR_NACIONAL','ADQUIRIDO_DO_MERCADO_INTERNO_SEM_SIMILAR_NACIONAL','MERCADORIA_COM_CONTEUDO_DE_IMPORTACAO_SUPERIOR_A_70')),
	genero_id TEXT,
	ncm TEXT,
	cest TEXT,
	situacao_fiscal_id INTEGER,
	situacao_fiscal_saida_id INTEGER,
	regime_estadual_id INTEGER,
	impostos_federais_ids TEXT,
	natureza_imposto_id INTEGER,
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
	medida_referencial REAL DEFAULT 0,
	indice_at TEXT CHECK(indice_at IN ('ARREDONDA','TRUNCA')),
    fora_de_linha INTEGER DEFAULT 0,
	data_saida DATETIME,
	data_inclusao DATETIME,
	data_alteracao DATETIME,
	status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
	status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    holding_id TEXT,
    tipo_contribuinte TEXT CHECK(tipo_contribuinte IN ('CONTRIBUINTE','NAO_CONTRIBUINTE','ISENTO')),
    inscricao_estadual TEXT,
    telefone1 TEXT,
    telefone2 TEXT,
    email TEXT,
    data_nascimento DATETIME,
    estado_civil TEXT CHECK(estado_civil IN ('SOLTEIRO','CASADO','DIVORCIADO','VIUVO','OUTROS')),
    sexo TEXT CHECK(sexo IN ('MASCULINO','FEMININO')),
    orgao_publico INTEGER DEFAULT 0,
    retem_iss INTEGER DEFAULT 0,
    observacao TEXT,
    tipo_de_preco INTEGER,
    data_de_bloqueio DATETIME,
    tipo_de_bloqueio TEXT,
    desconto TEXT,
    tabela_prazo TEXT CHECK(tabela_prazo IN ('','DF','PRZ','DFM','DFD','DFS','DFQ')),
    prazo INTEGER,
    corte INTEGER,
    vendedor_id INTEGER,
    cep TEXT,
    logradouro TEXT,
    numero INTEGER,
    complemento TEXT,
    referencia TEXT,
    bairro TEXT,
    municipio TEXT,
    ibge TEXT,
    uf TEXT,
    pais TEXT,
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id) ON DELETE SET NULL
);

-- FORNECEDORES

DROP TABLE IF EXISTS fornecedores;
CREATE TABLE fornecedores (
    fornecedor_id INTEGER PRIMARY KEY,
    tipo_de_pessoa TEXT CHECK(tipo_de_pessoa IN ('FISICA','JURIDICA','ESTRANGEIRO')),
    documento TEXT,
    nome TEXT,
    fantasia TEXT,
    holding_id TEXT,
    tipo_contribuinte TEXT CHECK(tipo_contribuinte IN ('CONTRIBUINTE','NAO_CONTRIBUINTE','ISENTO')),
    inscricao_estadual TEXT,
    telefone1 TEXT,
    telefone2 TEXT,
    email TEXT,
    tipo_de_fornecedor TEXT CHECK(tipo_de_fornecedor IN ('INDUSTRIA','DISTRIBUIDORA','VAREJO','SIMPLES_NACIONAL','OUTROS')),
    servico INTEGER DEFAULT 0,
    transportadora INTEGER DEFAULT 0,
    produtor_rural INTEGER DEFAULT 0,
    inscricao_municipal TEXT,
    tabela_prazo TEXT CHECK(tabela_prazo IN ('','DF','PRZ','DFM','DFD','DFS','DFQ')),
    prazo INTEGER,
    prazo_de_entrega INTEGER,
    tipo_de_frete TEXT CHECK(tipo_de_frete IN ('','SEM_FRETE','EMITENTE','DESTINATARIO','TERCEIRO','EMITENTE_PROPRIO','DESTINATARIO_PROPRIO')),
    desativa_atendimento_pedido INTEGER DEFAULT 0,
    tipo_pedido_compra TEXT CHECK(tipo_pedido_compra IN ('NAO_GERENCIADO','GERENCIADO_MAESTRO')),
    regime_estadual_tributario_id TEXT,
    destaca_substituicao TEXT CHECK(destaca_substituicao IN ('DESPESAS_ACESSORIAS','CAMPO_PROPRIO','DADOS_COMPLEMENTARES')),
    considera_desoneração INTEGER DEFAULT 0,
    cep TEXT,
    logradouro TEXT,
    numero INTEGER,
    complemento TEXT,
    bairro TEXT,
    municipio TEXT,
    ibge TEXT,
    uf TEXT,
    pais TEXT,
    criado_em DATETIME,
    atualizado_em DATETIME,
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CAIXAS

DROP TABLE IF EXISTS caixas;
CREATE TABLE caixas (
    loja_id INTEGER,
    caixa_id INTEGER PRIMARY KEY,
    numero INTEGER,
    serie_do_equipamento TEXT,
    versao TEXT,
    data_ultima_venda TEXT,
    hora TEXT,
    visivel_monitoramento INTEGER DEFAULT 1,
    tipo_frente_loja TEXT CHECK(tipo_frente_loja IN ('SYSPDV','EASY_ASSIST')),
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id) ON DELETE SET NULL
);

-- LOCAL DE ESTOQUE

DROP TABLE IF EXISTS local_estoque;
CREATE TABLE local_estoque (
    local_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo_de_estoque TEXT CHECK(tipo_de_estoque IN ('PROPRIO','TERCEIROS')),
    bloqueio INTEGER DEFAULT 0,
    avaria INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
	 status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_pai_id) REFERENCES categorias(categoria_id) ON DELETE SET NULL
);

-- CONTAS CORRENTES

DROP TABLE IF EXISTS contas_correntes;
CREATE TABLE contas_correntes (
    conta_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo TEXT CHECK(tipo IN ('CAIXA','BANCARIA')),
    ativa INTEGER DEFAULT 1,
    compoe_fluxo_de_caixa INTEGER DEFAULT 0,
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- HISTÓRICO PADRÃO

DROP TABLE IF EXISTS historico_padrao;
CREATE TABLE historico_padrao (
    historico_id INTEGER PRIMARY KEY,
    descricao TEXT,
    tipo TEXT CHECK(tipo IN ('CREDITO','DEBITO')),
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
	 status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
	 status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
	 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- MOTIVOS DE DEVOLUÇÃO

DROP TABLE IF EXISTS motivos_devolucao;
CREATE TABLE motivos_devolucao (
    motivo_id INTEGER PRIMARY KEY,
    descricao TEXT,
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PAGAMENTOS PDV

DROP TABLE IF EXISTS pagamentos_pdv;
CREATE TABLE pagamentos_pdv (
    pagamento_id INTEGER PRIMARY KEY,
    descricao TEXT,
    categoria_id INTEGER,
    loja_id INTEGER,
    valor_maximo REAL,
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id) ON DELETE SET NULL
);

-- RECEBIMENTOS PDV

DROP TABLE IF EXISTS recebimentos_pdv;
CREATE TABLE recebimentos_pdv (
    recebimento_id INTEGER PRIMARY KEY,
    id_externo TEXT,
    descricao TEXT,
    categoria_id INTEGER,
    loja_id INTEGER,
    tipo_recebimento TEXT CHECK(tipo_recebimento IN ('PROPRIO','TERCEIRO','TAXA')),
    qtd_autenticacoes INTEGER DEFAULT 0,
    imprime_doc INTEGER DEFAULT 0,
    qtd_impressoes INTEGER DEFAULT 0,
    valor_recebimento REAL DEFAULT 0,
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
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
    status TEXT CHECK(status IN ('C','U','D','E')) DEFAULT 'U',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- LOGS DE SINCRONIZAÇÃO

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

-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA

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

-- VIEWS ÚTEIS

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

-- FIM DO SCRIPT

SELECT 'Banco de dados criado com sucesso! ✅' AS mensagem;