// backend/src/modules/sqlite-repository/repositories/pessoa.js

const BaseRepository = require('../base-repository');

/**
 * PessoaRepository
 * Gerencia: lojas, clientes e fornecedores.
 */

class PessoaRepository extends BaseRepository {

    // ─── LOJAS ────────────────────────────────────────────────────────────────

    static importarLojas(lojas) {
        return BaseRepository._executarTransacao(
            'lojas',
            lojas,
            (db) => db.prepare(`
                INSERT INTO lojas (
                    loja_id, nome, fantasia, perfil_fiscal, atividade_economica,
                    ramo_atuacao_id, agente_validacao, crt, matriz, sigla,
                    mail, telefone, cep, uf, cidade, logradouro,
                    numero, bairro, tipo, tipo_contribuinte,
                    ativo, ecommerce, locais_da_loja_ids, status
                ) VALUES (
                    @loja_id, @nome, @fantasia, @perfil_fiscal, @atividade_economica,
                    @ramo_atuacao_id, @agente_validacao, @crt, @matriz, @sigla,
                    @mail, @telefone, @cep, @uf, @cidade, @logradouro,
                    @numero, @bairro, @tipo, @tipo_contribuinte,
                    @ativo, @ecommerce, @locais_da_loja_ids, @status
                )
                ON CONFLICT(loja_id) DO UPDATE SET
                    nome           = excluded.nome,
                    fantasia       = excluded.fantasia,
                    perfil_fiscal  = excluded.perfil_fiscal,
                    atividade_economica = excluded.atividade_economica,
                    ramo_atuacao_id    = excluded.ramo_atuacao_id,
                    agente_validacao   = excluded.agente_validacao,
                    crt                = excluded.crt,
                    matriz             = excluded.matriz,
                    sigla              = excluded.sigla,
                    mail               = excluded.mail,
                    telefone           = excluded.telefone,
                    cep                = excluded.cep,
                    uf                 = excluded.uf,
                    cidade             = excluded.cidade,
                    logradouro         = excluded.logradouro,
                    numero             = excluded.numero,
                    bairro             = excluded.bairro,
                    tipo               = excluded.tipo,
                    tipo_contribuinte  = excluded.tipo_contribuinte,
                    ativo          = excluded.ativo,
                    ecommerce      = excluded.ecommerce,
                    locais_da_loja_ids = excluded.locais_da_loja_ids,
                    updated_at     = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (l) => [{
                loja_id:            l.id                     ?? null,
                nome:               l.nome                   ?? null,
                fantasia:           l.nomeFantasia           ?? null,
                perfil_fiscal:      l.perfilFiscal           ?? null,
                atividade_economica:l.atividadeEconomica     ?? null,
                ramo_atuacao_id:    l.ramoAtuacaoId          ?? null,
                agente_validacao:   l.agenteValidacao        ?? null,
                crt:                l.crt                    ?? null,
                matriz:             BaseRepository._bool(l.matriz),
                sigla:              l.sigla                  ?? null,
                mail:               l.email                  ?? null,
                telefone:           l.telefone               ?? null,
                cep:                l.endereco?.cep          ?? null,
                uf:                 l.endereco?.uf           ?? null,
                cidade:             l.endereco?.municipio    ?? null,
                logradouro:         l.endereco?.logradouro   ?? null,
                numero:             l.endereco?.numero       ?? null,
                bairro:             l.endereco?.bairro       ?? null,
                tipo:               l.tipo                   ?? null,
                tipo_contribuinte:  l.tipoContribuinte       ?? null,
                ativo:              BaseRepository._bool(l.ativo !== false),
                ecommerce:          BaseRepository._bool(l.ecommerce),
                locais_da_loja_ids: BaseRepository._ids(l.locaisDaLojaIds),
                status: 'U'
            }]
        );
    }
    
    // ─── CLIENTES ─────────────────────────────────────────────────────────────

    static importarClientes(clientes) {
        return BaseRepository._executarTransacao(
            'clientes',
            clientes,
            (db) => db.prepare(`
                INSERT INTO clientes (
                    cliente_id, tipo_de_pessoa, documento, nome, fantasia,
                    holding_id, tipo_contribuinte, inscricao_estadual,
                    telefone1, telefone2, email, data_nascimento,
                    estado_civil, sexo, orgao_publico, retem_iss,
                    observacao, tipo_de_preco, data_de_bloqueio, tipo_de_bloqueio,
                    desconto, tabela_prazo, prazo, corte, vendedor_id,
                    cep, logradouro, numero, complemento, referencia,
                    bairro, municipio, ibge, uf, pais, status
                ) VALUES (
                    @cliente_id, @tipo_de_pessoa, @documento, @nome, @fantasia,
                    @holding_id, @tipo_contribuinte, @inscricao_estadual,
                    @telefone1, @telefone2, @email, @data_nascimento,
                    @estado_civil, @sexo, @orgao_publico, @retem_iss,
                    @observacao, @tipo_de_preco, @data_de_bloqueio, @tipo_de_bloqueio,
                    @desconto, @tabela_prazo, @prazo, @corte, @vendedor_id,
                    @cep, @logradouro, @numero, @complemento, @referencia,
                    @bairro, @municipio, @ibge, @uf, @pais, @status
                )
                ON CONFLICT(cliente_id) DO UPDATE SET
                    tipo_de_pessoa  = excluded.tipo_de_pessoa,
                    documento        = excluded.documento,
                    nome             = excluded.nome,
                    fantasia         = excluded.fantasia,
                    holding_id       = excluded.holding_id,
                    tipo_contribuinte= excluded.tipo_contribuinte,
                    inscricao_estadual = excluded.inscricao_estadual,
                    telefone1        = excluded.telefone1,
                    telefone2        = excluded.telefone2,
                    email            = excluded.email,
                    data_nascimento  = excluded.data_nascimento,
                    estado_civil     = excluded.estado_civil,
                    sexo             = excluded.sexo,
                    orgao_publico    = excluded.orgao_publico,
                    retem_iss        = excluded.retem_iss,
                    observacao       = excluded.observacao,
                    tipo_de_preco    = excluded.tipo_de_preco,
                    data_de_bloqueio = excluded.data_de_bloqueio,
                    tipo_de_bloqueio = excluded.tipo_de_bloqueio,
                    desconto         = excluded.desconto,
                    tabela_prazo     = excluded.tabela_prazo,
                    prazo            = excluded.prazo,
                    corte            = excluded.corte,
                    vendedor_id      = excluded.vendedor_id,
                    cep              = excluded.cep,
                    logradouro       = excluded.logradouro,
                    numero           = excluded.numero,
                    complemento      = excluded.complemento,
                    referencia       = excluded.referencia,
                    bairro           = excluded.bairro,
                    municipio        = excluded.municipio,
                    ibge             = excluded.ibge,
                    uf               = excluded.uf,
                    pais             = excluded.pais,
                    updated_at       = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (c) => [{
                cliente_id:        c.id             ?? null,
                tipo_de_pessoa:    c.tipoDePessoa   ?? null,
                documento:         c.cpfCnpj        ?? null,
                nome:              c.nome           ?? null,
                fantasia:          c.nomeFantasia   ?? null,
                holding_id:        c.holdingId      ?? null,
                tipo_contribuinte: c.tipoContribuinte ?? null,
                inscricao_estadual:c.inscricaoEstadual ?? null,
                telefone1:         c.telefone1      ?? null,
                telefone2:         c.telefone2      ?? null,
                email:             c.email          ?? null,
                data_nascimento:   BaseRepository._date(c.dataNascimento),
                estado_civil:      c.estadoCivil    ?? null,
                sexo:              c.sexo           ?? null,
                orgao_publico:     BaseRepository._bool(c.orgaoPublico),
                retem_iss:         BaseRepository._bool(c.retemIss),
                observacao:        c.observacao     ?? null,
                tipo_de_preco:     c.tipoDePrecoPadrao ?? null,
                data_de_bloqueio:  BaseRepository._date(c.dataDeBloqueio),
                tipo_de_bloqueio:  c.tipoDeBloqueio ?? null,
                desconto:          c.desconto       ?? null,
                tabela_prazo:      c.tabelaPrazo    ?? null,
                prazo:             c.prazo          ?? null,
                corte:             c.corte          ?? null,
                vendedor_id:       c.vendedorId     ?? null,
                cep:               c.endereco?.cep         ?? null,
                logradouro:        c.endereco?.logradouro   ?? null,
                numero:            c.endereco?.numero       ?? null,
                complemento:       c.endereco?.complemento  ?? null,
                referencia:        c.endereco?.referencia   ?? null,
                bairro:            c.endereco?.bairro       ?? null,
                municipio:         c.endereco?.municipio    ?? null,
                ibge:              c.endereco?.ibge         ?? null,
                uf:                c.endereco?.uf           ?? null,
                pais:              c.endereco?.pais         ?? null,
                status: 'U'
            }]
        );
    }

    // ─── FORNECEDORES ─────────────────────────────────────────────────────────

    static importarFornecedores(fornecedores) {
        return BaseRepository._executarTransacao(
            'fornecedores',
            fornecedores,
            (db) => db.prepare(`
                INSERT INTO fornecedores (
                    fornecedor_id, tipo_de_pessoa, documento, nome, fantasia,
                    holding_id, tipo_contribuinte, inscricao_estadual,
                    telefone1, telefone2, email, tipo_de_fornecedor,
                    servico, transportadora, produtor_rural, inscricao_municipal,
                    tabela_prazo, prazo, prazo_de_entrega, tipo_de_frete,
                    desativa_atendimento_pedido, tipo_pedido_compra,
                    regime_estadual_tributario_id, destaca_substituicao,
                    considera_desoneração,
                    cep, logradouro, numero, complemento, bairro,
                    municipio, ibge, uf, pais,
                    criado_em, atualizado_em, status
                ) VALUES (
                    @fornecedor_id, @tipo_de_pessoa, @documento, @nome, @fantasia,
                    @holding_id, @tipo_contribuinte, @inscricao_estadual,
                    @telefone1, @telefone2, @email, @tipo_de_fornecedor,
                    @servico, @transportadora, @produtor_rural, @inscricao_municipal,
                    @tabela_prazo, @prazo, @prazo_de_entrega, @tipo_de_frete,
                    @desativa_atendimento_pedido, @tipo_pedido_compra,
                    @regime_estadual_tributario_id, @destaca_substituicao,
                    @considera_desoneração,
                    @cep, @logradouro, @numero, @complemento, @bairro,
                    @municipio, @ibge, @uf, @pais,
                    @criado_em, @atualizado_em, @status
                )
                ON CONFLICT(fornecedor_id) DO UPDATE SET
                    tipo_de_pessoa  = excluded.tipo_de_pessoa,
                    documento       = excluded.documento,
                    nome            = excluded.nome,
                    fantasia        = excluded.fantasia,
                    holding_id      = excluded.holding_id,
                    tipo_contribuinte = excluded.tipo_contribuinte,
                    inscricao_estadual = excluded.inscricao_estadual,
                    telefone1       = excluded.telefone1,
                    telefone2       = excluded.telefone2,
                    email           = excluded.email,
                    tipo_de_fornecedor = excluded.tipo_de_fornecedor,
                    servico         = excluded.servico,
                    transportadora  = excluded.transportadora,
                    produtor_rural  = excluded.produtor_rural,
                    inscricao_municipal = excluded.inscricao_municipal,
                    tabela_prazo    = excluded.tabela_prazo,
                    prazo           = excluded.prazo,
                    prazo_de_entrega = excluded.prazo_de_entrega,
                    tipo_de_frete   = excluded.tipo_de_frete,
                    desativa_atendimento_pedido = excluded.desativa_atendimento_pedido,
                    tipo_pedido_compra = excluded.tipo_pedido_compra,
                    regime_estadual_tributario_id = excluded.regime_estadual_tributario_id,
                    destaca_substituicao = excluded.destaca_substituicao,
                    considera_desoneração = excluded.considera_desoneração,
                    cep             = excluded.cep,
                    logradouro      = excluded.logradouro,
                    numero          = excluded.numero,
                    complemento     = excluded.complemento,
                    bairro          = excluded.bairro,
                    municipio       = excluded.municipio,
                    ibge            = excluded.ibge,
                    uf              = excluded.uf,
                    pais            = excluded.pais,
                    atualizado_em   = excluded.atualizado_em,
                    updated_at      = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (f) => [{
                fornecedor_id:                  f.id                          ?? null,
                tipo_de_pessoa:                 f.tipoDePessoa                ?? null,
                documento:                      f.cpfCnpj                     ?? null,
                nome:                           f.nome                        ?? null,
                fantasia:                       f.nomeFantasia                ?? null,
                holding_id:                     f.holdingId                   ?? null,
                tipo_contribuinte:              f.tipoContribuinte            ?? null,
                inscricao_estadual:             f.inscricaoEstadual           ?? null,
                telefone1:                      f.telefone1                   ?? null,
                telefone2:                      f.telefone2                   ?? null,
                email:                          f.email                       ?? null,
                tipo_de_fornecedor:             f.tipoDeFornecedor            ?? null,
                servico:                        BaseRepository._bool(f.servico),
                transportadora:                 BaseRepository._bool(f.transportadora),
                produtor_rural:                 BaseRepository._bool(f.produtorRural),
                inscricao_municipal:            f.inscricaoMunicipal          ?? null,
                tabela_prazo:                   f.tabelaPrazo                 ?? null,
                prazo:                          f.prazo                       ?? null,
                prazo_de_entrega:               f.prazoDeEntrega              ?? null,
                tipo_de_frete:                  f.tipoDeFrete                 ?? null,
                desativa_atendimento_pedido:    BaseRepository._bool(f.desativaAtendimentoPedido),
                tipo_pedido_compra:             f.tipoPedidoCompra            ?? null,
                regime_estadual_tributario_id:  f.regimeEstadualTributarioId  ?? null,
                destaca_substituicao:           f.destacaSubstituicao         ?? null,
                considera_desoneração:          BaseRepository._bool(f.consideraDesoneração),
                cep:                            f.endereco?.cep               ?? null,
                logradouro:                     f.endereco?.logradouro        ?? null,
                numero:                         f.endereco?.numero            ?? null,
                complemento:                    f.endereco?.complemento       ?? null,
                bairro:                         f.endereco?.bairro            ?? null,
                municipio:                      f.endereco?.municipio         ?? null,
                ibge:                           f.endereco?.ibge              ?? null,
                uf:                             f.endereco?.uf                ?? null,
                pais:                           f.endereco?.pais              ?? null,
                criado_em:                      BaseRepository._date(f.criadoEm),
                atualizado_em:                  BaseRepository._date(f.atualizadoEm),
                status: 'U'
            }]
        );
    }
}

module.exports = PessoaRepository;