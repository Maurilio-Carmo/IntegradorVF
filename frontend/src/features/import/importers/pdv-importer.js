// frontend/src/features/import/importers/pdv-importer.js

/**
 * Importador PDV (Frente de Loja)
 * Gerencia importações do domínio de PDV/Frente de Loja
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
import { ESTIMATES } from '../../../config/constants.js';

export class PDVImporter extends ImportBase {
    /**
     * Importar caixas
     */
    async importarCaixas(uiElement) {
        return await this.execute({
            name: 'caixas',
            endpoint: 'importar-caixas',
            apiMethod: API.pdv.buscarCaixas.bind(API.pdv),
            uiElement,
            estimate: ESTIMATES.CAIXAS
        });
    }

    /**
     * Importar motivos de cancelamento
     */
    async importarMotivosCancelamento(uiElement) {
        return await this.execute({
            name: 'motivos de cancelamento',
            endpoint: 'importar-motivos-cancelamento',
            apiMethod: API.pdv.buscarMotivosCancelamento.bind(API.pdv),
            uiElement,
            estimate: ESTIMATES.MOTIVOS_CANCELAMENTO
        });
    }

    /**
     * Importar motivos de desconto
     */
    async importarMotivosDesconto(uiElement) {
        return await this.execute({
            name: 'motivos de desconto',
            endpoint: 'importar-motivos-desconto',
            apiMethod: API.pdv.buscarMotivosDesconto.bind(API.pdv),
            uiElement,
            estimate: ESTIMATES.MOTIVOS_DESCONTO
        });
    }

    /**
     * Importar motivos de devolução
     */
    async importarMotivosDevolucao(uiElement) {
        return await this.execute({
            name: 'motivos de devolução',
            endpoint: 'importar-motivos-devolucao',
            apiMethod: API.pdv.buscarMotivosDevolucao.bind(API.pdv),
            uiElement,
            estimate: ESTIMATES.MOTIVOS_DEVOLUCAO
        });
    }

    /**
     * Importar formas de pagamento PDV
     */
    async importarPagamentosPDV(uiElement) {
        return await this.execute({
            name: 'formas de pagamento PDV',
            endpoint: 'importar-pagamentos-pdv',
            apiMethod: API.pdv.buscarPagamentosPDV.bind(API.pdv),
            transform: (pagamentos) => pagamentos.flatMap(p =>
                (p.lojas || []).map(l => ({
                    id:          p.id,
                    descricao:   p.descricao,
                    categoriaId: p.categoriaId ?? null,
                    lojaId:      l.lojaId      ?? null,
                    valorMaximo: l.valorMaximo ?? null,
                }))
            ),
            uiElement,
            estimate: ESTIMATES.PAGAMENTOS_PDV
        });
    }

    /**
     * Importar formas de recebimento PDV
     */
    async importarRecebimentosPDV(uiElement) {
        return await this.execute({
            name: 'formas de recebimento PDV',
            endpoint: 'importar-recebimentos-pdv',
            apiMethod: API.pdv.buscarRecebimentosPDV.bind(API.pdv),
            transform: (recebimentos) => recebimentos.flatMap(r =>
                (r.lojas || []).map(l => ({
                    id:               r.id,
                    idExterno:        r.idExterno        ?? null,
                    descricao:        r.descricao        ?? null,
                    categoriaId:      r.categoriaId      ?? null,
                    lojaId:           l.lojaId           ?? null,
                    tipoRecebimento:  l.tipoRecebimento  ?? null,
                    qtdAutenticacoes: l.qtdAutenticacoes ?? 0,
                    imprimeDoc:       l.imprimeDoc       ?? false,
                    qtdImpressoes:    l.qtdImpressoes    ?? 0,
                    valorRecebimento: l.valorRecebimento ?? 0,
                }))
            ),
            uiElement,
            estimate: ESTIMATES.RECEBIMENTOS_PDV
        });
    }
}

export default PDVImporter;