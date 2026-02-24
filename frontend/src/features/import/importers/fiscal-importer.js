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
    async importarTabelasTributarias(uiElement) {
        return await this.execute({
            name:      'tabelas tributárias',
            endpoint:  'tabelasTributarias',
            apiMethod: API.fiscal.buscarTabelasTributarias.bind(API.fiscal),
            transform: (tabelas) => tabelas
                .flatMap(t => (t.itens || []).map(i => this._flatItem(t, i))),
            uiElement,
        });
    }

    /** Mescla campos da tabela-pai com campos do item-filho */
    _flatItem(t, i) {
        return {
            id:                  t.id,
            regimeEstadualId:    t.regimeEstadualId                     ?? null,
            situacaoFiscalId:    t.situacaoFiscalId                     ?? null,
            figuraFiscalId:      t.figuraFiscalId                       ?? null,
            ufOrigem:            t.uf                                   ?? null,
            tipoDeOperacao:      t.tipoDeOperacao,
            classificacaoPessoa: i.classificacaoDePessoa                ?? null,
            ufDestino:           i.uf                                   ?? null,
            tributadoNf:         i.tributadoNF                          ?? 0,
            isentoNf:            i.isentoNF                             ?? 0,
            outrosNf:            i.outrosNF                             ?? 0,
            aliquota:            i.aliquota                             ?? 0,
            agregado:            i.agregado                             ?? 0,
            tributadoIcms:       i.tributadoICMS                        ?? 0,
            cargaLiquida:        i.cargaLiquida                         ?? 0,
            aliquotaInterna:     i.aliquotaInterna                      ?? 0,
            fecop:               i.fecop                                ?? 0,
            fecopSt:             i.fecopST                              ?? 0,
            somaIpiBc:           i.somaIPINaBaseDeCalculo               ?? false,
            somaIpiBs:           i.somaIPINaBaseDeCalculoSubstituicao   ?? false,
            stDestacado:         i.stDestacado                          ?? false,
            csosn:               i.csosn                                ?? null,
            csosnCupomFiscal:    i.csosnCupomFiscal                     ?? null,
            cstId:               i.cstId                                ?? null,
            tributacao:          i.tributacao                           ?? null,
            cfopId:              i.cfopId                               ?? null,
            icmsDesonerado:      i.icmsDesonerado                       ?? false,
            icmsOrigem:          i.icmsOrigem                           ?? null,
            icmsEfetivo:         i.icmsEfetivo                          ?? false,
            reducaoOrigem:       i.reducaoOrigem                        ?? 0,
        };
    }

    /**
     * Importar cenários fiscais NCM
     * @param {*} uiElement 
     * @returns 
     */
    async importarCenariosFiscais(uiElement) {
        return await this.execute({
            name:      'cenários fiscais NCM',
            endpoint:  'cenariosFiscais',
            apiMethod: API.fiscal.buscarCenariosFiscais.bind(API.fiscal),
            transform: (itens) => itens.map(c => ({
                id:          c.id          ?? null,
                descricao:   c.descricao   ?? null,
                cst:         c.cst         ?? null,
                cClassTrib:  c.cclassTrib  ?? null,
                ncms:        (c.ncms        || []).map(n => ({
                    codigoNcm:           n.codigoNcm           ?? null,
                    descricaoNcm:        n.descricaoNcm        ?? null,
                    codigoCenarioFiscal: n.codigoCenarioFiscal ?? c.id,
                })),
                lojas:       (c.lojas       || []).map(l => ({
                    codigoLoja:          l.codigoLoja          ?? null,
                    descricaoLoja:       l.descricaoLoja       ?? null,
                    ufOrigem:            l.ufOrigem            ?? null,
                    codigoCenarioFiscal: l.codigoCenarioFiscal ?? c.id,
                })),
                ufsDestino:  (c.ufsDestino  || []).map(u => ({
                    ufDestino:           u.ufDestino           ?? null,
                    codigoCenarioFiscal: u.codigoCenarioFiscal ?? c.id,
                })),
            })),
            uiElement,
        });
    }
}

export default FiscalImporter;