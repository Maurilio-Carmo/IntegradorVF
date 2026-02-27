// backend/src/modules/sqlite-repository/repositories/estoque.js

const BaseRepository = require('./base-repository');

/**
 * EstoqueRepository
 * Gerencia locais de estoque e tipos de ajustes.
 */

class EstoqueRepository extends BaseRepository {

    // ─── LOCAL DE ESTOQUE ─────────────────────────────────────────────────────

    static importarLocalEstoque(locais) {
        return BaseRepository._executarTransacao(
            'locais de estoque',
            locais,
            (db) => db.prepare(`
                INSERT INTO local_estoque (
                    local_id, descricao, tipo_de_estoque,
                    bloqueio, avaria, status
                ) VALUES (
                    @local_id, @descricao, @tipo_de_estoque,
                    @bloqueio, @avaria, @status
                )
                ON CONFLICT(local_id) DO UPDATE SET
                    descricao       = excluded.descricao,
                    tipo_de_estoque = excluded.tipo_de_estoque,
                    bloqueio        = excluded.bloqueio,
                    avaria          = excluded.avaria,
                    updated_at      = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (l) => [{
                local_id:       l.id              ?? null,
                descricao:      l.descricao       ?? null,
                tipo_de_estoque:l.tipoDeEstoque   ?? null,
                bloqueio:       BaseRepository._bool(l.bloqueio),
                avaria:         BaseRepository._bool(l.avaria),
                status: 'U'
            }]
        );
    }

    // ─── TIPOS DE AJUSTES ─────────────────────────────────────────────────────

    static importarTiposAjustes(tipos) {
        return BaseRepository._executarTransacao(
            'tipos de ajustes',
            tipos,
            (db) => db.prepare(`
                INSERT INTO tipos_ajustes (
                    ajuste_id, descricao, tipo,
                    tipo_de_operacao, tipo_reservado, status
                ) VALUES (
                    @ajuste_id, @descricao, @tipo,
                    @tipo_de_operacao, @tipo_reservado, @status
                )
                ON CONFLICT(ajuste_id) DO UPDATE SET
                    descricao  = excluded.descricao,
                    tipo       = excluded.tipo,
                    tipo_de_operacao = excluded.tipo_de_operacao,
                    tipo_reservado   = excluded.tipo_reservado,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (t) => [{
                ajuste_id:        t.id               ?? null,
                descricao:        t.descricao        ?? null,
                tipo:             t.tipo             ?? null,
                tipo_de_operacao: t.tipoDeOperacao   ?? null,
                tipo_reservado:   t.tipoReservado    ?? null,
                status: 'U'
            }]
        );
    }

    // ─── SALDO DE ESTOQUE ─────────────────────────────────────────────────────

    static importarSaldoEstoque(saldos) {
        return BaseRepository._executarTransacao(
            'saldo de estoque',
            saldos,
            (db) => db.prepare(`
                INSERT INTO saldo_estoque (
                    saldo_id, loja_id, produto_id, local_id, saldo,
                    criado_em, atualizado_em, status
                ) VALUES (
                    @saldo_id, @loja_id, @produto_id, @local_id,
                    @saldo, @criado_em, @atualizado_em, @status
                )
                ON CONFLICT(saldo_id) DO UPDATE SET
                    loja_id       = excluded.loja_id,
                    produto_id    = excluded.produto_id,
                    local_id      = excluded.local_id,
                    saldo         = excluded.saldo,
                    atualizado_em = excluded.atualizado_em,
                    updated_at    = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (s) => [{
                saldo_id:      s.id            ?? null,
                loja_id:       s.lojaId        ?? null,
                produto_id:    s.produtoId     ?? null,
                local_id:      s.localId       ?? null,
                saldo:         BaseRepository._num(s.saldo),
                criado_em:     BaseRepository._date(s.criadoEm),
                atualizado_em: BaseRepository._date(s.atualizadoEm),
                status: 'U',
            }]
        );
    }
}

module.exports = EstoqueRepository;