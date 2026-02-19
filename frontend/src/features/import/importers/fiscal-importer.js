// frontend/src/features/import/importers/fiscal-importer.js

/**
 * Importador Fiscal
 * Gerencia importações do domínio fiscal e tributário
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
export class FiscalImporter extends ImportBase {
    /**
     * Importar impostos federais
     */
    async importarImpostosFederais(uiElement) {
        return await this.execute({
            name: 'impostos federais',
            endpoint: 'importar-impostos-federais',
            apiMethod: API.fiscal.buscarImpostosFederais.bind(API.fiscal),
            transform: (itens) => itens.map(i => {
                const g = i.impostoFederalGeral || {};
                return {
                    id:                          i.id,
                    descricao:                   i.descricao,
                    tipoImposto:                 i.tipoImposto,
                    // campos que o repositório lê como i.cstEntradaReal etc.
                    cstEntradaReal:              g.cstEntrada              ?? null,
                    cstSaidaReal:                g.cstSaida                ?? null,
                    aliquotaEntradaReal:         g.aliquotaEntrada         ?? 0,
                    aliquotaSaidaReal:           g.aliquotaSaida           ?? 0,
                    cstEntradaPresumido:         g.cstEntradaPresumido     ?? null,
                    cstSaidaPresumido:           g.cstSaidaPresumido       ?? null,
                    aliquotaEntradaPresumido:    g.aliquotaEntradaPresumido ?? 0,
                    aliquotaSaidaPresumido:      g.aliquotaSaidaPresumido  ?? 0,
                    cstEntradaSimples:           g.cstEntradaSimples       ?? null,
                    cstSaidaSimples:             g.cstSaidaSimples         ?? null,
                };
            }),
            uiElement,
        });
    }

    /**
     * Importar regime tributário
     */
    async importarRegimeTributario(uiElement) {
        return await this.execute({
            name: 'regime tributário',
            endpoint: 'importar-regime-tributario',
            apiMethod: API.fiscal.buscarRegimeTributario.bind(API.fiscal),
            uiElement,
        });
    }

    /**
     * Importar situações fiscais
     */
    async importarSituacoesFiscais(uiElement) {
        return await this.execute({
            name: 'situações fiscais',
            endpoint: 'importar-situacoes-fiscais',
            apiMethod: API.fiscal.buscarSituacoesFiscais.bind(API.fiscal),
            uiElement,
        });
    }

    /**
     * Importar tipos de operações
     */
    async importarTiposOperacoes(uiElement) {
        return await this.execute({
            name: 'tipos de operações',
            endpoint: 'importar-tipos-operacoes',
            apiMethod: API.fiscal.buscarTiposOperacoes.bind(API.fiscal),
            uiElement,
        });
    }

    /**
     * Importar tabelas tributárias
     */
    async importarTabelasTributarias(uiElement) {
        return await this.execute({
            name: 'tabelas tributárias',
            endpoint: 'importar-tabelas-tributarias',
            apiMethod: API.fiscal.buscarTabelasTributarias.bind(API.fiscal),
            uiElement,
        });
    }


    /**
     * A API retorna um único endpoint "fiscal/tabelas-tributarias" com estrutura:
     *   [
     *     { id, tipoDeOperacao: "ENTRADA", regimeEstadualId, situacaoFiscalId, ...,
     *       itens: [{ classificacaoDePessoa, uf, tributadoNF, ... }] },
     *     { id, tipoDeOperacao: "SAIDA", ..., itens: [...] },
     *   ]
     *
     * O repositório espera um array FLAT — um objeto por item:
     *   { tabela_id, tipo_de_operacao, classificacao_pessoa, uf_destino, tributado_nf, ... }
     *
     * Este transform:
     *   1. Filtra por tipoDeOperacao === "ENTRADA"
     *   2. Faz flatMap de itens[] para gerar um registro por item
     *   3. Mescla campos do pai (tabela) com campos do filho (item)
     */
    async importarTabelasTributariasEntrada(uiElement) {
        return await this.execute({
            name: 'tabelas tributárias de entrada',
            endpoint: 'importar-tabelas-tributarias-entrada',
            apiMethod: API.fiscal.buscarTabelasTributarias.bind(API.fiscal),
            transform: (tabelas) => tabelas
                .filter(t => t.tipoDeOperacao === 'ENTRADA')
                .flatMap(t => (t.itens || []).map(i => ({
                    // campos do pai (tabela)
                    id:                  t.id,
                    regimeEstadualId:    t.regimeEstadualId    ?? null,
                    situacaoFiscalId:    t.situacaoFiscalId    ?? null,
                    figuraFiscalId:      t.figuraFiscalId      ?? null,
                    ufOrigem:            t.uf                  ?? null,
                    tipoDeOperacao:      t.tipoDeOperacao,
                    // campos do filho (item)
                    classificacaoPessoa: i.classificacaoDePessoa ?? null,
                    ufDestino:           i.uf                    ?? null,
                    tributadoNf:         i.tributadoNF           ?? 0,
                    isentoNf:            i.isentoNF              ?? 0,
                    outrosNf:            i.outrosNF              ?? 0,
                    aliquota:            i.aliquota              ?? 0,
                    agregado:            i.agregado              ?? 0,
                    tributadoIcms:       i.tributadoICMS         ?? 0,
                    cargaLiquida:        i.cargaLiquida          ?? 0,
                    aliquotaInterna:     i.aliquotaInterna       ?? 0,
                    fecop:               i.fecop                 ?? 0,
                    fecopSt:             i.fecopST               ?? 0,
                    somaIpiBc:           i.somaIpiBc             ?? false,
                    somaIpiBs:           i.somaIpiBs             ?? false,
                    stDestacado:         i.stDestacado           ?? false,
                    cstId:               i.cstId                 ?? null,
                    csosn:               i.csosn                 ?? null,
                    tributacao:          i.tributacao            ?? null,
                    cfopId:              i.cfopId                ?? null,
                    icmsDesonerado:      i.icmsDesonerado        ?? false,
                    icmsOrigem:          i.icmsOrigem            ?? null,
                    icmsEfetivo:         i.icmsEfetivo           ?? false,
                    reducaoOrigem:       i.reducaoOrigem         ?? 0,
                }))),
            uiElement,
        });
    }

    async importarTabelasTributariasSaida(uiElement) {
        return await this.execute({
            name: 'tabelas tributárias de saída',
            endpoint: 'importar-tabelas-tributarias-saida',
            apiMethod: API.fiscal.buscarTabelasTributarias.bind(API.fiscal),
            transform: (tabelas) => tabelas
                .filter(t => t.tipoDeOperacao === 'SAIDA')
                .flatMap(t => (t.itens || []).map(i => ({
                    id:                  t.id,
                    regimeEstadualId:    t.regimeEstadualId    ?? null,
                    situacaoFiscalId:    t.situacaoFiscalId    ?? null,
                    figuraFiscalId:      t.figuraFiscalId      ?? null,
                    ufOrigem:            t.uf                  ?? null,
                    tipoDeOperacao:      t.tipoDeOperacao,
                    classificacaoPessoa: i.classificacaoDePessoa ?? null,
                    ufDestino:           i.uf                    ?? null,
                    tributadoNf:         i.tributadoNF           ?? 0,
                    isentoNf:            i.isentoNF              ?? 0,
                    outrosNf:            i.outrosNF              ?? 0,
                    aliquota:            i.aliquota              ?? 0,
                    agregado:            i.agregado              ?? 0,
                    tributadoIcms:       i.tributadoICMS         ?? 0,
                    cargaLiquida:        i.cargaLiquida          ?? 0,
                    aliquotaInterna:     i.aliquotaInterna       ?? 0,
                    fecop:               i.fecop                 ?? 0,
                    fecopSt:             i.fecopST               ?? 0,
                    somaIpiBc:           i.somaIpiBc             ?? false,
                    somaIpiBs:           i.somaIpiBs             ?? false,
                    stDestacado:         i.stDestacado           ?? false,
                    cstId:               i.cstId                 ?? null,
                    csosn:               i.csosn                 ?? null,
                    tributacao:          i.tributacao            ?? null,
                    cfopId:              i.cfopId                ?? null,
                    icmsDesonerado:      i.icmsDesonerado        ?? false,
                    icmsOrigem:          i.icmsOrigem            ?? null,
                    icmsEfetivo:         i.icmsEfetivo           ?? false,
                    reducaoOrigem:       i.reducaoOrigem         ?? 0,
                }))),
            uiElement,
        });
    }
}

export default FiscalImporter;