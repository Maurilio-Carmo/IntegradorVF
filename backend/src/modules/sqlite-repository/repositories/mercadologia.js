// backend/src/modules/sqlite-repository/repositories/mercadologia.js

const BaseRepository = require('../base-repository');

/**
 * MercadologiaRepository
 * Gerencia as entidades da hierarquia mercadológica:
 */

class MercadologiaRepository extends BaseRepository {

    // ─── SEÇÕES ──────────────────────────────────────────────────────────────

    static importarSecoes(secoes) {
        return BaseRepository._executarTransacao(
            'seções',
            secoes,
            (db) => db.prepare(`
                INSERT INTO secoes (secao_id, descricao_old, status)
                VALUES (@secao_id, @descricao_old, 'U')
                ON CONFLICT(secao_id) DO UPDATE SET
                    descricao_old = excluded.descricao_old,
                    updated_at    = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (s) => [{ secao_id: s.id, descricao_old: s.descricao || null }]
        );
    }

    // ─── GRUPOS ──────────────────────────────────────────────────────────────

    static importarGrupos(grupos) {
        return BaseRepository._executarTransacao(
            'grupos',
            grupos,
            (db) => db.prepare(`
                INSERT INTO grupos (grupo_id, secao_id, descricao_old, status)
                VALUES (@grupo_id, @secao_id, @descricao_old, 'U')
                ON CONFLICT(grupo_id) DO UPDATE SET
                    secao_id      = excluded.secao_id,
                    descricao_old = excluded.descricao_old,
                    updated_at    = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (g) => [{
                grupo_id:     g.id,
                secao_id:     g.secaoId,
                descricao_old: g.descricao || null
            }]
        );
    }

    // ─── SUBGRUPOS ────────────────────────────────────────────────────────────

    static importarSubgrupos(subgrupos) {
        return BaseRepository._executarTransacao(
            'subgrupos',
            subgrupos,
            (db) => db.prepare(`
                INSERT INTO subgrupos (subgrupo_id, secao_id, grupo_id, descricao_old, status)
                VALUES (@subgrupo_id, @secao_id, @grupo_id, @descricao_old, 'U')
                ON CONFLICT(subgrupo_id) DO UPDATE SET
                    secao_id      = excluded.secao_id,
                    grupo_id      = excluded.grupo_id,
                    descricao_old = excluded.descricao_old,
                    updated_at    = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (s) => [{
                subgrupo_id:   s.id,
                secao_id:      s.secaoId,
                grupo_id:      s.grupoId,
                descricao_old: s.descricao || null
            }]
        );
    }
}

module.exports = MercadologiaRepository;