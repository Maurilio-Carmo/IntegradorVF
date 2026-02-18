// backend/src/routes/importacao.js

'use strict';

const express = require('express');
const router  = express.Router();
const ImportacaoService = require('../services/importacao-service.js');

// ===========================================================================
// CONTRATO COM O FRONTEND
//
// O frontend (db-client.js) chama:
//   POST /api/importacao/<endpoint>  com body { data: [...] }
//
// O ImportacaoService recebe o array 'data' e persiste via repositórios SQLite.
// A busca na API externa é responsabilidade do frontend (via /api/vf/* proxy).
//
// ENDPOINTS seguem a ordem do actionMap do button-manager.js:
//   PRODUTO → FINANCEIRO → PDV/FRENTE DE LOJA → ESTOQUE → FISCAL → PESSOA
// ===========================================================================

// ---------------------------------------------------------------------------
// Helper: extrai e valida o array 'data' do body
// ---------------------------------------------------------------------------
function extrairData(req, res) {
    const { data } = req.body;

    if (!Array.isArray(data)) {
        res.status(400).json({
            error: 'Body inválido: esperado { data: Array }',
            recebido: typeof data,
        });
        return null;
    }

    return data;
}

// ===========================================================================
// PRODUTO
// ===========================================================================

/**
 * POST /api/importacao/importar-mercadologia
 *
 * Persiste seções, grupos e subgrupos em uma única chamada.
 * O frontend (arvore-importer.js) já busca as 3 entidades hierarquicamente
 * e as envia juntas.
 *
 * Body esperado:
 * {
 *   data: {
 *     secoes:    [...],   // itens de GET /produto/secoes
 *     grupos:    [...],   // itens de GET /produto/secoes/:id/grupos  (com secaoId injetado)
 *     subgrupos: [...]    // itens de GET /produto/secoes/:id/grupos/:id/subgrupos (com secaoId + grupoId)
 *   }
 * }
 */
router.post('/importar-mercadologia', async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return res.status(400).json({
                error: 'Body inválido: esperado { data: { secoes, grupos, subgrupos } }',
            });
        }

        const { secoes = [], grupos = [], subgrupos = [] } = data;

        // Persiste as 3 entidades em paralelo (não há dependência entre upserts)
        const [rSecoes, rGrupos, rSubgrupos] = await Promise.all([
            ImportacaoService.importarSecoes(secoes),
            ImportacaoService.importarGrupos(grupos),
            ImportacaoService.importarSubgrupos(subgrupos),
        ]);

        res.json({
            success:   true,
            secoes:    rSecoes,
            grupos:    rGrupos,
            subgrupos: rSubgrupos,
        });
    } catch (error) {
        console.error('[importar-mercadologia]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-marcas
 * Body: { data: [ ...marcas ] }
 */
router.post('/importar-marcas', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarMarcas(data));
    } catch (error) {
        console.error('[importar-marcas]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-familias
 * Body: { data: [ ...familias ] }
 */
router.post('/importar-familias', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarFamilias(data));
    } catch (error) {
        console.error('[importar-familias]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-produtos
 * Body: { data: [ ...produtos ], lojaId?: string | number }
 *
 * lojaId é necessário para resolver estoque e regime fiscal por loja.
 */
router.post('/importar-produtos', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;

        const lojaId = req.body.lojaId ?? null;
        res.json(await ImportacaoService.importarProdutos(data, lojaId));
    } catch (error) {
        console.error('[importar-produtos]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================================================
// FINANCEIRO
// ===========================================================================

/**
 * POST /api/importacao/importar-categorias
 * Body: { data: [ ...categorias ] }
 */
router.post('/importar-categorias', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarCategorias(data));
    } catch (error) {
        console.error('[importar-categorias]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-agentes
 * Body: { data: [ ...agentes ] }
 */
router.post('/importar-agentes', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarAgentes(data));
    } catch (error) {
        console.error('[importar-agentes]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-contas-correntes
 * Body: { data: [ ...contas ] }
 */
router.post('/importar-contas-correntes', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarContasCorrentes(data));
    } catch (error) {
        console.error('[importar-contas-correntes]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-especies-documento
 * Body: { data: [ ...especies ] }
 */
router.post('/importar-especies-documento', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarEspeciesDocumento(data));
    } catch (error) {
        console.error('[importar-especies-documento]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-historico-padrao
 * Body: { data: [ ...historicos ] }
 */
router.post('/importar-historico-padrao', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarHistoricoPadrao(data));
    } catch (error) {
        console.error('[importar-historico-padrao]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================================================
// PDV / FRENTE DE LOJA
// ===========================================================================

/**
 * POST /api/importacao/importar-caixas
 * Body: { data: [ ...caixas ] }
 */
router.post('/importar-caixas', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarCaixas(data));
    } catch (error) {
        console.error('[importar-caixas]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-pagamentos-pdv
 * Body: { data: [ ...pagamentos ] }
 */
router.post('/importar-pagamentos-pdv', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarPagamentosPDV(data));
    } catch (error) {
        console.error('[importar-pagamentos-pdv]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-recebimentos-pdv
 * Body: { data: [ ...recebimentos ] }
 */
router.post('/importar-recebimentos-pdv', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarRecebimentosPDV(data));
    } catch (error) {
        console.error('[importar-recebimentos-pdv]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-motivos-desconto
 * Body: { data: [ ...motivos ] }
 */
router.post('/importar-motivos-desconto', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarMotivosDesconto(data));
    } catch (error) {
        console.error('[importar-motivos-desconto]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-motivos-devolucao
 * Body: { data: [ ...motivos ] }
 */
router.post('/importar-motivos-devolucao', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarMotivosDevolucao(data));
    } catch (error) {
        console.error('[importar-motivos-devolucao]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-motivos-cancelamento
 * Body: { data: [ ...motivos ] }
 */
router.post('/importar-motivos-cancelamento', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarMotivosCancelamento(data));
    } catch (error) {
        console.error('[importar-motivos-cancelamento]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================================================
// ESTOQUE
// ===========================================================================

/**
 * POST /api/importacao/importar-local-estoque
 * Body: { data: [ ...locais ] }
 */
router.post('/importar-local-estoque', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarLocalEstoque(data));
    } catch (error) {
        console.error('[importar-local-estoque]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-tipos-ajustes
 * Body: { data: [ ...tipos ] }
 */
router.post('/importar-tipos-ajustes', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarTiposAjustes(data));
    } catch (error) {
        console.error('[importar-tipos-ajustes]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================================================
// FISCAL
// ===========================================================================

/**
 * POST /api/importacao/importar-regime-tributario
 * Body: { data: [ ...regimes ] }
 */
router.post('/importar-regime-tributario', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarRegimeTributario(data));
    } catch (error) {
        console.error('[importar-regime-tributario]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-situacoes-fiscais
 * Body: { data: [ ...situacoes ] }
 */
router.post('/importar-situacoes-fiscais', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarSituacoesFiscais(data));
    } catch (error) {
        console.error('[importar-situacoes-fiscais]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-tipos-operacoes
 * Body: { data: [ ...tipos ] }
 */
router.post('/importar-tipos-operacoes', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarTiposOperacoes(data));
    } catch (error) {
        console.error('[importar-tipos-operacoes]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-impostos-federais
 * Body: { data: [ ...impostos ] }
 */
router.post('/importar-impostos-federais', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarImpostosFederais(data));
    } catch (error) {
        console.error('[importar-impostos-federais]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-tabelas-tributarias
 * Body: { data: [ ...tabelas ] }
 */
router.post('/importar-tabelas-tributarias', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarTabelasTributarias(data));
    } catch (error) {
        console.error('[importar-tabelas-tributarias]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================================================
// PESSOA
// ===========================================================================

/**
 * POST /api/importacao/importar-lojas
 * Body: { data: [ ...lojas ] }
 */
router.post('/importar-lojas', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarLojas(data));
    } catch (error) {
        console.error('[importar-lojas]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-clientes
 * Body: { data: [ ...clientes ] }
 */
router.post('/importar-clientes', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarClientes(data));
    } catch (error) {
        console.error('[importar-clientes]', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/importar-fornecedores
 * Body: { data: [ ...fornecedores ] }
 */
router.post('/importar-fornecedores', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarFornecedores(data));
    } catch (error) {
        console.error('[importar-fornecedores]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===========================================================================
// ROTAS LEGADAS — mantidas para não quebrar chamadas existentes
// ===========================================================================

/** @deprecated → use /importar-marcas */
router.post('/marcas', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarMarcas(data));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

/** @deprecated → use /importar-mercadologia */
router.post('/secoes', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarSecoes(data));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/grupos', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarGrupos(data));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/subgrupos', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        res.json(await ImportacaoService.importarSubgrupos(data));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ===========================================================================
// UTILITÁRIOS
// ===========================================================================

/**
 * GET /api/importacao/estatisticas
 * Retorna contagem de registros de cada tabela no SQLite.
 * Consumido por DatabaseClient.getStatistics() no frontend.
 */
router.get('/estatisticas', async (req, res) => {
    try {
        const stats = await ImportacaoService.obterEstatisticas();
        res.json(stats);
    } catch (error) {
        console.error('[estatisticas]', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;