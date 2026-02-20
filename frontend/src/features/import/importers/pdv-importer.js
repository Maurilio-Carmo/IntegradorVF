// frontend/src/features/import/importers/pdv-importer.js

/**
 * Importador PDV (Frente de Loja)
 * Gerencia importações do domínio de PDV/Frente de Loja
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
export class PDVImporter extends ImportBase {    
    /**
     * Importar formas de pagamento PDV
     */
    async importarPagamentosPDV(uiElement) {
        return await this.execute({
            name: 'formas de pagamento PDV',
            endpoint: 'pagamentosPDV',
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
        });
    }

    /**
     * Importar formas de recebimento PDV
     */
    async importarRecebimentosPDV(uiElement) {
        return await this.execute({
            name: 'formas de recebimento PDV',
            endpoint: 'recebimentosPDV',
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
        });
    }

    /**
     * Importar motivos de desconto
     */
    async importarMotivosDesconto(uiElement) {
        return await this.execute({
            name: 'motivos de desconto',
            endpoint: 'motivosDesconto',
            apiMethod: API.pdv.buscarMotivosDesconto.bind(API.pdv),
            uiElement,
        });
    }

    /**
     * Importar motivos de devolução
     */
    async importarMotivosDevolucao(uiElement) {
        return await this.execute({
            name: 'motivos de devolução',
            endpoint: 'motivosDevolucao',
            apiMethod: API.pdv.buscarMotivosDevolucao.bind(API.pdv),
            uiElement,
        });
    }

    /**
     * Importar motivos de cancelamento
     */
    async importarMotivosCancelamento(uiElement) {
        return await this.execute({
            name: 'motivos de cancelamento',
            endpoint: 'motivosCancelamento',
            apiMethod: API.pdv.buscarMotivosCancelamento.bind(API.pdv),
            uiElement,
        });
    }
}

export default PDVImporter;