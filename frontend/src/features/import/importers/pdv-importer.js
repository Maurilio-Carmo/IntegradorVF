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
            endpoint: 'caixas',
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
            endpoint: 'motivos-cancelamento',
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
            endpoint: 'motivos-desconto',
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
            endpoint: 'motivos-devolucao',
            apiMethod: API.pdv.buscarMotivosDevolucao.bind(API.pdv),
            uiElement,
            estimate: ESTIMATES.MOTIVOS_DEVOLUCAO
        });
    }

    /**
     * Importar formas de pagamento do PDV
     */
    async importarPagamentosPDV(uiElement) {
        return await this.execute({
            name: 'formas de pagamento',
            endpoint: 'pagamentos-pdv',
            apiMethod: API.pdv.buscarPagamentosPDV.bind(API.pdv),
            uiElement,
            estimate: ESTIMATES.PAGAMENTOS_PDV
        });
    }

    /**
     * Importar formas de recebimento do PDV
     */
    async importarRecebimentosPDV(uiElement) {
        return await this.execute({
            name: 'formas de recebimento',
            endpoint: 'recebimentos-pdv',
            apiMethod: API.pdv.buscarRecebimentosPDV.bind(API.pdv),
            uiElement,
            estimate: ESTIMATES.RECEBIMENTOS_PDV
        });
    }
}

export default PDVImporter;