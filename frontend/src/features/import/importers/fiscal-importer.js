// frontend/src/features/import/importers/fiscal-importer.js

/**
 * Importador Fiscal
 * Gerencia importações do domínio fiscal e tributário
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
export class FiscalImporter extends ImportBase {
    /**
     * Importar regime tributário
     */
    async importarRegimeTributario(uiElement) {
        return await this.execute({
            name: 'regime tributário',
            endpoint: 'regimeTributario',
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
            endpoint: 'situacoesFiscais',
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
            endpoint: 'tiposOperacoes',
            apiMethod: API.fiscal.buscarTiposOperacoes.bind(API.fiscal),
            uiElement,
        });
    }

    /**
     * Importar impostos federais
     */
    async importarImpostosFederais(uiElement) {
        return await this.execute({
            name: 'impostos federais',
            endpoint: 'impostosFederais',
            apiMethod: API.fiscal.buscarImpostosFederais.bind(API.fiscal),
            transform: (itens) => itens.map(i => {
                const g = i.impostoFederalGeral || {};
                return {
                    id:                          i.id,
                    descricao:                   i.descricao,
                    tipoImposto:                 i.tipoImposto,
                    // campos que o repositório lê como i.cstEntradaReal etc.
                    cstEntradaReal:              g.cstEntrada               ?? null,
                    cstSaidaReal:                g.cstSaida                 ?? null,
                    aliquotaEntradaReal:         g.aliquotaEntrada          ?? 0,
                    aliquotaSaidaReal:           g.aliquotaSaida            ?? 0,
                    cstEntradaPresumido:         g.cstEntradaPresumido      ?? null,
                    cstSaidaPresumido:           g.cstSaidaPresumido        ?? null,
                    aliquotaEntradaPresumido:    g.aliquotaEntradaPresumido ?? 0,
                    aliquotaSaidaPresumido:      g.aliquotaSaidaPresumido   ?? 0,
                    cstEntradaSimples:           g.cstEntradaSimples        ?? null,
                    cstSaidaSimples:             g.cstSaidaSimples          ?? null,
                };
            }),
            uiElement,
        });
    }

    /**
     * Importar tabelas tributárias
     */
    async importarTabelasTributariasEntrada(uiElement) {
        return await this.execute({
            name:      'tabelas tributárias — entrada',
            endpoint:  'tabelasTributariasEntrada',
            apiMethod: API.fiscal.buscarTabelasTributarias.bind(API.fiscal),
            transform: (tabelas) => tabelas
                .filter(t => t.tipoDeOperacao === 'ENTRADA')
                .flatMap(t => (t.itens || []).map(i => this._flatItem(t, i))),
            uiElement,
        });
    }

    async importarTabelasTributariasSaida(uiElement) {
        return await this.execute({
            name:      'tabelas tributárias — saída',
            endpoint:  'tabelasTributariasSaida',
            apiMethod: API.fiscal.buscarTabelasTributarias.bind(API.fiscal),
            transform: (tabelas) => tabelas
                .filter(t => t.tipoDeOperacao === 'SAIDA')
                .flatMap(t => (t.itens || []).map(i => this._flatItem(t, i))),
            uiElement,
        });
    }

    /** Mescla campos da tabela-pai com campos do item-filho */
    _flatItem(t, i) {
        return {
            id:                  t.id,
            regimeEstadualId:    t.regimeEstadualId      ?? null,
            situacaoFiscalId:    t.situacaoFiscalId      ?? null,
            figuraFiscalId:      t.figuraFiscalId        ?? null,
            ufOrigem:            t.uf                    ?? null,
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
        };
    }
}

export default FiscalImporter;