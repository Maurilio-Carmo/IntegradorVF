// backend/src/database/schema/produto/index.ts
// ⚠️  Ordem importa: dependências antes dos dependentes

export * from './secoes.schema';
export * from './marcas.schema';
export * from './familias.schema';
export * from './grupos.schema';
export * from './subgrupos.schema';
export * from './produtos.schema';
export * from './produto-componentes.schema';
export * from './produto-min-max.schema';
export * from './produto-regimes.schema';
export * from './produto-impostos-federais.schema';
export * from './produto-auxiliares.schema';
export * from './produto-fornecedores.schema';
