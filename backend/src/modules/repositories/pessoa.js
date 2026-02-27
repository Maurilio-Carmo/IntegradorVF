// backend/src/modules/sqlite-repository/repositories/pessoa.js

const BaseRepository = require('./base-repository');

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
                cep:                l.enderecos?.cep          ?? null,
                uf:                 l.enderecos?.uf           ?? null,
                cidade:             l.enderecos?.municipio    ?? null,
                logradouro:         l.enderecos?.logradouro   ?? null,
                numero:             l.enderecos?.numero       ?? null,
                bairro:             l.enderecos?.bairro       ?? null,
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
                    ramo, observacao, tipo_preco, tipo_bloqueio,
                    desconto, tabela_prazo, prazo, corte, vendedor_id,
                    cep, logradouro, numero, complemento, referencia,
                    bairro, municipio, ibge, uf, pais, data_cadastro, status
                ) VALUES (
                    @cliente_id, @tipo_de_pessoa, @documento, @nome, @fantasia,
                    @holding_id, @tipo_contribuinte, @inscricao_estadual,
                    @telefone1, @telefone2, @email, @data_nascimento,
                    @estado_civil, @sexo, @orgao_publico, @retem_iss,
                    @ramo, @observacao, @tipo_preco, @tipo_bloqueio,
                    @desconto, @tabela_prazo, @prazo, @corte, @vendedor_id,
                    @cep, @logradouro, @numero, @complemento, @referencia,
                    @bairro, @municipio, @ibge, @uf, @pais, @data_cadastro, @status
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
                    ramo             = excluded.ramo,
                    observacao       = excluded.observacao,
                    tipo_preco       = excluded.tipo_preco,
                    tipo_bloqueio    = excluded.tipo_bloqueio,
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
                    data_cadastro    = excluded.data_cadastro,
                    updated_at       = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D', 'S')
            `),
            (c) => {
                const end = c.enderecos?.find(e => e.tipoDeEndereco === 'PRINCIPAL')
                        ?? c.enderecos?.[0]
                        ?? {};

                return [{
                    cliente_id:        c.id,
                    tipo_de_pessoa:    c.tipoDePessoa,
                    documento:         c.numeroDoDocumento              ?? null,
                    nome:              c.nome                           ?? null,
                    fantasia:          c.fantasia                       ?? null,
                    holding_id:        c.holdingId                      ?? 1,
                    tipo_contribuinte: c.tipoContribuinte               ?? 'ISENTO',
                    inscricao_estadual:c.numeroDeIdentificacao          ?? 'ISENTO',
                    telefone1:         c.telefone1                      ?? null,
                    telefone2:         c.telefone2                      ?? null,
                    email:             c.email                          ?? null,
                    data_nascimento:   c.dataNascimento                 ?? null,
                    estado_civil:      c.estadoCivil                    ?? null,
                    sexo:              c.sexo                           ?? null,
                    orgao_publico:     BaseRepository._bool(c.orgaoPublico === 'S'),
                    retem_iss:         BaseRepository._bool(c.clienteRetemISS === 'S'),
                    ramo:              c.ramoId                         ?? 0,
                    observacao:        c.observacao                     ?? null,
                    tipo_preco:        c.tipoDePreco                    ?? 1,
                    tipo_bloqueio:     c.statusId                       ?? 0,
                    desconto:          c.descontoConcedidoAoCliente     ?? 0,
                    tabela_prazo:      c.tabelaPrazo                    ?? 'PRZ',
                    prazo:             c.prazo                          ?? 30,
                    corte:             c.diaDeFechamento                ?? null,
                    vendedor_id:       c.vendedorId                     ?? null,
                    cep:               BaseRepository._cep(end.cep)     ?? null,
                    logradouro:        end.logradouro                   ?? null,
                    numero:            end.numero                       ?? null,
                    complemento:       end.complemento                  ?? null,
                    referencia:        end.pontoDeReferencia            ?? null,
                    bairro:            end.bairro                       ?? null,
                    municipio:         end.municipio                    ?? null,
                    ibge:              end.codigoIbge                   ?? null,
                    uf:                end.uf                           ?? null,
                    pais:              end.codigoDoPais                 ?? null,
                    data_cadastro:     c.dataDeCadastro                 ?? null,
                    status: 'U'
                }];
            },
        );
    }

    // ─── FORNECEDORES ─────────────────────────────────────────────────────────

    static importarFornecedores(fornecedores) {
        return BaseRepository._executarTransacao(
            'fornecedores',
            fornecedores,
            (db) => db.prepare(`
                INSERT INTO fornecedores (
                    fornecedor_id, tipo_pessoa, documento, nome, fantasia,
                    holding_id, tipo_contribuinte, inscricao_estadual,
                    telefone1, telefone2, email, tipo_fornecedor,
                    servico, transportadora, produtor_rural, inscricao_municipal,
                    tabela_prazo, prazo, prazo_entrega, tipo_frete,
                    observacao, desativa_pedido, tipo_pedido,
                    regime_estadual, destaca_substituicao,
                    considera_desoneracao,
                    cep, logradouro, numero, complemento, referencia,
                    bairro, municipio, ibge, uf, pais,
                    criado_em, atualizado_em, status
                ) VALUES (
                    @fornecedor_id, @tipo_pessoa, @documento, @nome, @fantasia,
                    @holding_id, @tipo_contribuinte, @inscricao_estadual,
                    @telefone1, @telefone2, @email, @tipo_fornecedor,
                    @servico, @transportadora, @produtor_rural, @inscricao_municipal,
                    @tabela_prazo, @prazo, @prazo_entrega, @tipo_frete,
                    @observacao, @desativa_pedido, @tipo_pedido,
                    @regime_estadual, @destaca_substituicao,
                    @considera_desoneracao,
                    @cep, @logradouro, @numero, @complemento, @referencia,
                    @bairro, @municipio, @ibge, @uf, @pais,
                    @criado_em, @atualizado_em, @status
                )
                ON CONFLICT(fornecedor_id) DO UPDATE SET
                    tipo_pessoa = excluded.tipo_pessoa,
                    documento = excluded.documento,
                    nome = excluded.nome,
                    fantasia = excluded.fantasia,
                    holding_id = excluded.holding_id,
                    tipo_contribuinte = excluded.tipo_contribuinte,
                    inscricao_estadual = excluded.inscricao_estadual,
                    telefone1 = excluded.telefone1,
                    telefone2 = excluded.telefone2,
                    email = excluded.email,
                    tipo_fornecedor = excluded.tipo_fornecedor,
                    servico = excluded.servico,
                    transportadora = excluded.transportadora,
                    produtor_rural = excluded.produtor_rural,
                    inscricao_municipal = excluded.inscricao_municipal,
                    tabela_prazo = excluded.tabela_prazo,
                    prazo = excluded.prazo,
                    prazo_entrega = excluded.prazo_entrega,
                    tipo_frete = excluded.tipo_frete,
                    observacao = excluded.observacao,
                    desativa_pedido = excluded.desativa_pedido,
                    tipo_pedido = excluded.tipo_pedido,
                    regime_estadual = excluded.regime_estadual,
                    destaca_substituicao = excluded.destaca_substituicao,
                    considera_desoneracao = excluded.considera_desoneracao,
                    cep = excluded.cep,
                    logradouro = excluded.logradouro,
                    numero = excluded.numero,
                    complemento = excluded.complemento,
                    referencia = excluded.referencia,
                    bairro = excluded.bairro,
                    municipio = excluded.municipio,
                    ibge = excluded.ibge,
                    uf = excluded.uf,
                    pais = excluded.pais,
                    criado_em = excluded.criado_em,
                    atualizado_em = excluded.atualizado_em,
                    status = excluded.status
                WHERE status NOT IN ('C', 'D', 'S')
            `),
            (f) => {
                const end = f.endereco ?? {};
                
                return [{
                fornecedor_id:                  f.id                                                        ?? null,
                tipo_pessoa:                    f.tipoDePessoa                                              ?? null,
                documento:                      f.numeroDoDocumento                                         ?? null,
                nome:                           f.nome                                                      ?? null,
                fantasia:                       f.fantasia                                                  ?? null,
                holding_id:                     f.holdingId                                                 ?? null,
                tipo_contribuinte:              f.tipoContribuinte                                          ?? 'ISENTO',
                inscricao_estadual:             f.numeroDeIdentificacao                                     ?? 'ISENTO',
                telefone1:                      f.telefone1                                                 ?? null,
                telefone2:                      f.telefone2                                                 ?? null,
                email:                          f.email                                                     ?? null,
                tipo_fornecedor:                f.tipoDeFornecedor                                          ?? null,
                servico:                        BaseRepository._bool(f.servico),
                transportadora:                 BaseRepository._bool(f.transportadora),
                produtor_rural:                 BaseRepository._bool(f.produtorRural),
                inscricao_municipal:            f.inscricaoMunicipal                                        ?? null,
                tabela_prazo:                   f.tabelaPrazo                                               ?? 'PRZ',
                prazo:                          f.prazo                                                     ?? 30,
                prazo_entrega:                  f.prazoDeEntrega                                            ?? null,
                tipo_frete:                     f.tipoDeFrete                                               ?? null,
                observacao:                     f.observacao                                                ?? null,
                desativa_pedido:                BaseRepository._bool(f.desativaAtendimentoDoPedido),
                tipo_pedido:                    f.tipoPedidoCompra                                          ?? null,
                regime_estadual:                f.regimeEstadualTributarioId                                ?? null,
                destaca_substituicao:           f.destacaSubstituicaoEmDevolucaoDeCompra                    ?? null,
                considera_desoneracao:          BaseRepository._bool(f.consideraDesoneracaoComoDesconto),
                cep:                            BaseRepository._cep(end.cep)                                ?? null,
                logradouro:                     end.logradouro                                              ?? null,
                numero:                         end.numero                                                  ?? null,
                complemento:                    end.complemento                                             ?? null,
                referencia:                     end.pontoDeReferencia                                         ?? null,
                bairro:                         end.bairro                                                  ?? null,
                municipio:                      end.municipio                                               ?? null,
                ibge:                           end.codigoIbge                                              ?? null,
                uf:                             end.uf                                                      ?? null,
                pais:                           end.codigoDoPais                                            ?? null,
                criado_em:                      BaseRepository._date(f.criadoEm),
                atualizado_em:                  BaseRepository._date(f.atualizadoEm),
                status: 'U'
            }];
        });
    }
}

module.exports = PessoaRepository;