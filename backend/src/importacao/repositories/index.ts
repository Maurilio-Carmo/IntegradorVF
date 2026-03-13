// repositories/index.ts
// Ponto de entrada único — exporta todos os repositórios organizados por domínio.
// Registre todos como providers no importacao.module.ts.

// ── MERCADOLOGIA ──────────────────────────────────────────────────────────────
export { SecoesRepository }    from './mercadologia/secoes.repository';
export { GruposRepository }    from './mercadologia/grupos.repository';
export { SubgruposRepository } from './mercadologia/subgrupos.repository';

// ── PRODUTO ───────────────────────────────────────────────────────────────────
export { MarcasRepository }                  from './produto/marcas.repository';
export { FamiliasRepository }                from './produto/familias.repository';
export { ProdutosRepository }                from './produto/produtos.repository';
export { ProdutoAuxiliaresRepository }       from './produto/produto-auxiliares.repository';
export { ProdutoFornecedoresRepository }     from './produto/produto-fornecedores.repository';
export { ProdutoMinMaxRepository }           from './produto/produto-min-max.repository';
export { ProdutoRegimesRepository }          from './produto/produto-regimes.repository';
export { ProdutoComponentesRepository }      from './produto/produto-componentes.repository';
export { ProdutoImpostosFederaisRepository } from './produto/produto-impostos-federais.repository';

// ── FINANCEIRO ────────────────────────────────────────────────────────────────
export { CategoriasRepository }         from './financeiro/categorias.repository';
export { AgentesRepository }            from './financeiro/agentes.repository';
export { ContasCorrentesRepository }    from './financeiro/contas-correntes.repository';
export { EspeciesDocumentosRepository } from './financeiro/especies-documentos.repository';
export { HistoricoPadraoRepository }    from './financeiro/historico-padrao.repository';

// ── FRENTE DE LOJA ────────────────────────────────────────────────────────────
export { FormasPagamentoRepository }     from './frente-loja/formas-pagamento.repository';
export { PagamentosPdvRepository }       from './frente-loja/pagamentos-pdv.repository';
export { RecebimentosPdvRepository }     from './frente-loja/recebimentos-pdv.repository';
export { MotivoDescontoRepository }      from './frente-loja/motivos-desconto.repository';
export { MotivosDevolucaoRepository }    from './frente-loja/motivos-devolucao.repository';
export { MotivosCancelamentoRepository } from './frente-loja/motivos-cancelamento.repository';

// ── ESTOQUE ───────────────────────────────────────────────────────────────────
export { LocalEstoqueRepository } from './estoque/local-estoque.repository';
export { TiposAjustesRepository } from './estoque/tipos-ajustes.repository';
export { SaldoEstoqueRepository } from './estoque/saldo-estoque.repository';

// ── FISCAL ────────────────────────────────────────────────────────────────────
export { RegimeTributarioRepository }   from './fiscal/regime-tributario.repository';
export { SituacoesFiscaisRepository }   from './fiscal/situacoes-fiscais.repository';
export { TiposOperacoesRepository }     from './fiscal/tipos-operacoes.repository';
export { ImpostosFederaisRepository }   from './fiscal/impostos-federais.repository';
export { TabelasTributariasRepository } from './fiscal/tabelas-tributarias.repository';
export { CenariosFiscaisRepository }    from './fiscal/cenarios-fiscais.repository';

// ── PESSOA ────────────────────────────────────────────────────────────────────
export { LojasRepository }       from './pessoa/lojas.repository';
export { ClientesRepository }    from './pessoa/clientes.repository';
export { FornecedoresRepository } from './pessoa/fornecedores.repository';
