// backend/src/services/ImportacaoService.js

const dbSQLite = require('../config/database-sqlite');

class ImportacaoService {
    /**
     * Importar seções
     */
    static async importarSecoes(secoes) {
        try {
            console.log(`📥 Importando ${secoes.length} seções...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO secoes (
                        secao_id_old, descricao_old, status,
                        secao_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const secao of secoes) {
                    stmt.run(
                        secao.id?.toString() || null,
                        secao.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${secoes.length} seções importadas`);
            return { success: true, count: secoes.length };
        } catch (error) {
            console.error('❌ Erro ao importar seções:', error);
            throw error;
        }
    }

    /**
     * Importar grupos
     */
    static async importarGrupos(grupos) {
        try {
            console.log(`📥 Importando ${grupos.length} grupos...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO grupos (
                        secao_id_old, grupo_id_old, descricao_old, status,
                        secao_id_new, grupo_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const grupo of grupos) {
                    stmt.run(
                        grupo.secaoId?.toString() || null,
                        grupo.id?.toString() || null,
                        grupo.descricao || null,
                        'U',
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${grupos.length} grupos importados`);
            return { success: true, count: grupos.length };
        } catch (error) {
            console.error('❌ Erro ao importar grupos:', error);
            throw error;
        }
    }

    /**
     * Importar subgrupos
     */
    static async importarSubgrupos(subgrupos) {
        try {
            console.log(`📥 Importando ${subgrupos.length} subgrupos...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO subgrupos (
                        secao_id_old, grupo_id_old, subgrupo_id_old, descricao_old, status,
                        secao_id_new, grupo_id_new, subgrupo_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const subgrupo of subgrupos) {
                    stmt.run(
                        subgrupo.secaoId?.toString() || null,
                        subgrupo.grupoId?.toString() || null,
                        subgrupo.id?.toString() || null,
                        subgrupo.descricao || null,
                        'U',
                        null,
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${subgrupos.length} subgrupos importados`);
            return { success: true, count: subgrupos.length };
        } catch (error) {
            console.error('❌ Erro ao importar subgrupos:', error);
            throw error;
        }
    }

    /**
     * Importar marcas
     */
    static async importarMarcas(marcas) {
        try {
            console.log(`📥 Importando ${marcas.length} marcas...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO marcas (
                        marca_id_old, descricao_old, status,
                        marca_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const marca of marcas) {
                    stmt.run(
                        marca.id?.toString() || null,
                        marca.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${marcas.length} marcas importadas`);
            return { success: true, count: marcas.length };
        } catch (error) {
            console.error('❌ Erro ao importar marcas:', error);
            throw error;
        }
    }

    /**
     * Importar famílias
     */
    static async importarFamilias(familias) {
        try {
            console.log(`📥 Importando ${familias.length} famílias...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO familias (
                        familia_id_old, descricao_old, status,
                        familia_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const familia of familias) {
                    stmt.run(
                        familia.id?.toString() || null,
                        familia.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${familias.length} famílias importadas`);
            return { success: true, count: familias.length };
        } catch (error) {
            console.error('❌ Erro ao importar famílias:', error);
            throw error;
        }
    }

    /**
     * Importar produtos
     */
    static async importarProdutos(produtos) {
        try {
            console.log(`📥 Importando ${produtos.length} produtos...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO produtos (
                        produto_id_old, descricao_old, descricao_reduzida_old,
                        secao_id_old, grupo_id_old, subgrupo_id_old,
                        familia_id_old, marca_id_old, status,
                        produto_id_new, descricao_new, descricao_reduzida_new,
                        secao_id_new, grupo_id_new, subgrupo_id_new,
                        familia_id_new, marca_id_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const produto of produtos) {
                    stmt.run(
                        produto.id?.toString() || null,
                        produto.descricao || null,
                        produto.descricaoReduzida || null,
                        produto.secaoId?.toString() || null,
                        produto.grupoId?.toString() || null,
                        produto.subgrupoId?.toString() || null,
                        produto.familiaId?.toString() || null,
                        produto.marcaId?.toString() || null,
                        'U',
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${produtos.length} produtos importados`);
            return { success: true, count: produtos.length };
        } catch (error) {
            console.error('❌ Erro ao importar produtos:', error);
            throw error;
        }
    }

    /**
     * Importar clientes
     */
    static async importarClientes(clientes) {
        try {
            console.log(`📥 Importando ${clientes.length} clientes...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO clientes (
                        cliente_id_old, nome_old, cpf_cnpj_old, status,
                        cliente_id_new, nome_new, cpf_cnpj_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const cliente of clientes) {
                    stmt.run(
                        cliente.id?.toString() || null,
                        cliente.nome || null,
                        cliente.cpfCnpj || null,
                        'U',
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${clientes.length} clientes importados`);
            return { success: true, count: clientes.length };
        } catch (error) {
            console.error('❌ Erro ao importar clientes:', error);
            throw error;
        }
    }

    /**
     * Importar fornecedores
     */
    static async importarFornecedores(fornecedores) {
        try {
            console.log(`📥 Importando ${fornecedores.length} fornecedores...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO fornecedores (
                        fornecedor_id_old, nome_old, cpf_cnpj_old, status,
                        fornecedor_id_new, nome_new, cpf_cnpj_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const fornecedor of fornecedores) {
                    stmt.run(
                        fornecedor.id?.toString() || null,
                        fornecedor.nome || null,
                        fornecedor.cpfCnpj || null,
                        'U',
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${fornecedores.length} fornecedores importados`);
            return { success: true, count: fornecedores.length };
        } catch (error) {
            console.error('❌ Erro ao importar fornecedores:', error);
            throw error;
        }
    }

    /**
     * Importar lojas
     */
    static async importarLojas(lojas) {
        try {
            console.log(`📥 Importando ${lojas.length} lojas...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO lojas (
                        loja_id_old, nome_old, cnpj_old, status,
                        loja_id_new, nome_new, cnpj_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const loja of lojas) {
                    stmt.run(
                        loja.id?.toString() || null,
                        loja.nome || null,
                        loja.cnpj || null,
                        'U',
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${lojas.length} lojas importadas`);
            return { success: true, count: lojas.length };
        } catch (error) {
            console.error('❌ Erro ao importar lojas:', error);
            throw error;
        }
    }

    /**
     * Importar caixas
     */
    static async importarCaixas(caixas) {
        try {
            console.log(`📥 Importando ${caixas.length} caixas...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO caixas (
                        caixa_id_old, descricao_old, loja_id_old, status,
                        caixa_id_new, descricao_new, loja_id_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const caixa of caixas) {
                    stmt.run(
                        caixa.id?.toString() || null,
                        caixa.descricao || null,
                        caixa.lojaId?.toString() || null,
                        'U',
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${caixas.length} caixas importados`);
            return { success: true, count: caixas.length };
        } catch (error) {
            console.error('❌ Erro ao importar caixas:', error);
            throw error;
        }
    }

    /**
     * Importar agentes
     */
    static async importarAgentes(agentes) {
        try {
            console.log(`📥 Importando ${agentes.length} agentes...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO agentes (
                        agente_id_old, nome_old, fantasia_old, codigo_banco_old, 
                        tipo_pessoa_old, documento_old, status,
                        agente_id_new, nome_new, fantasia_new, codigo_banco_new,
                        tipo_pessoa_new, documento_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const agente of agentes) {
                    stmt.run(
                        agente.id?.toString() || null,
                        agente.nome || null,
                        agente.nomeFantasia || null,
                        agente.codigoBanco || null,
                        agente.pessoaFisicaOuJuridica || null,
                        agente.cpfCnpj || null,
                        'U',
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${agentes.length} agentes importados`);
            return { success: true, count: agentes.length };
        } catch (error) {
            console.error('❌ Erro ao importar agentes:', error);
            throw error;
        }
    }

    /**
     * Importar categorias
     */
    static async importarCategorias(categorias) {
        try {
            console.log(`📥 Importando ${categorias.length} categorias...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO categorias (
                        categoria_id_old, descricao_old, categoria_pai_old, 
                        classificacao_old, tipo_old, status,
                        categoria_id_new, descricao_new, categoria_pai_new,
                        classificacao_new, tipo_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const categoria of categorias) {
                    stmt.run(
                        categoria.id?.toString() || null,
                        categoria.descricao || null,
                        categoria.categoriaPai?.toString() || null,
                        categoria.classificacao || null,
                        categoria.tipo || null,
                        'U',
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${categorias.length} categorias importadas`);
            return { success: true, count: categorias.length };
        } catch (error) {
            console.error('❌ Erro ao importar categorias:', error);
            throw error;
        }
    }

    /**
     * Importar contas correntes
     */
    static async importarContasCorrentes(contas) {
        try {
            console.log(`📥 Importando ${contas.length} contas correntes...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO contas_correntes (
                        conta_id_old, descricao_old, tipo_old, loja_id_old,
                        agente_id_old, status,
                        conta_id_new, descricao_new, tipo_new, loja_id_new,
                        agente_id_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const conta of contas) {
                    stmt.run(
                        conta.id?.toString() || null,
                        conta.descricao || null,
                        conta.tipo || null,
                        conta.lojaId?.toString() || null,
                        conta.agenteFinanceiroId?.toString() || null,
                        'U',
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${contas.length} contas correntes importadas`);
            return { success: true, count: contas.length };
        } catch (error) {
            console.error('❌ Erro ao importar contas correntes:', error);
            throw error;
        }
    }

    /**
     * Importar espécies de documento
     */
    static async importarEspeciesDocumento(especies) {
        try {
            console.log(`📥 Importando ${especies.length} espécies de documento...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO especies_documento (
                        especie_id_old, descricao_old, sigla_old, genero_old,
                        modalidade_old, status,
                        especie_id_new, descricao_new, sigla_new, genero_new,
                        modalidade_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const especie of especies) {
                    stmt.run(
                        especie.id?.toString() || null,
                        especie.descricao || null,
                        especie.sigla || null,
                        especie.genero || null,
                        especie.modalidade || null,
                        'U',
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${especies.length} espécies de documento importadas`);
            return { success: true, count: especies.length };
        } catch (error) {
            console.error('❌ Erro ao importar espécies de documento:', error);
            throw error;
        }
    }

    /**
     * Importar histórico padrão
     */
    static async importarHistoricoPadrao(historicos) {
        try {
            console.log(`📥 Importando ${historicos.length} históricos padrão...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO historico_padrao (
                        historico_id_old, descricao_old, status,
                        historico_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const historico of historicos) {
                    stmt.run(
                        historico.id?.toString() || null,
                        historico.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${historicos.length} históricos padrão importados`);
            return { success: true, count: historicos.length };
        } catch (error) {
            console.error('❌ Erro ao importar histórico padrão:', error);
            throw error;
        }
    }

    /**
     * Importar motivos de cancelamento
     */
    static async importarMotivosCancelamento(motivos) {
        try {
            console.log(`📥 Importando ${motivos.length} motivos de cancelamento...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO motivos_cancelamento (
                        motivo_id_old, descricao_old, status,
                        motivo_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const motivo of motivos) {
                    stmt.run(
                        motivo.id?.toString() || null,
                        motivo.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${motivos.length} motivos de cancelamento importados`);
            return { success: true, count: motivos.length };
        } catch (error) {
            console.error('❌ Erro ao importar motivos de cancelamento:', error);
            throw error;
        }
    }

    /**
     * Importar motivos de desconto
     */
    static async importarMotivosDesconto(motivos) {
        try {
            console.log(`📥 Importando ${motivos.length} motivos de desconto...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO motivos_desconto (
                        motivo_id_old, descricao_old, percentual_old, status,
                        motivo_id_new, descricao_new, percentual_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const motivo of motivos) {
                    stmt.run(
                        motivo.id?.toString() || null,
                        motivo.descricao || null,
                        motivo.percentual || null,
                        'U',
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${motivos.length} motivos de desconto importados`);
            return { success: true, count: motivos.length };
        } catch (error) {
            console.error('❌ Erro ao importar motivos de desconto:', error);
            throw error;
        }
    }

    /**
     * Importar motivos de devolução
     */
    static async importarMotivosDevolucao(motivos) {
        try {
            console.log(`📥 Importando ${motivos.length} motivos de devolução...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO motivos_devolucao (
                        motivo_id_old, descricao_old, status,
                        motivo_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const motivo of motivos) {
                    stmt.run(
                        motivo.id?.toString() || null,
                        motivo.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${motivos.length} motivos de devolução importados`);
            return { success: true, count: motivos.length };
        } catch (error) {
            console.error('❌ Erro ao importar motivos de devolução:', error);
            throw error;
        }
    }

    /**
     * Importar pagamentos PDV
     */
    static async importarPagamentosPDV(pagamentos) {
        try {
            console.log(`📥 Importando ${pagamentos.length} pagamentos PDV...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO pagamentos_pdv (
                        pagamento_id_old, descricao_old, status,
                        pagamento_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const pagamento of pagamentos) {
                    stmt.run(
                        pagamento.id?.toString() || null,
                        pagamento.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${pagamentos.length} pagamentos PDV importados`);
            return { success: true, count: pagamentos.length };
        } catch (error) {
            console.error('❌ Erro ao importar pagamentos PDV:', error);
            throw error;
        }
    }

    /**
     * Importar recebimentos PDV
     */
    static async importarRecebimentosPDV(recebimentos) {
        try {
            console.log(`📥 Importando ${recebimentos.length} recebimentos PDV...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO recebimentos_pdv (
                        recebimento_id_old, descricao_old, status,
                        recebimento_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const recebimento of recebimentos) {
                    stmt.run(
                        recebimento.id?.toString() || null,
                        recebimento.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${recebimentos.length} recebimentos PDV importados`);
            return { success: true, count: recebimentos.length };
        } catch (error) {
            console.error('❌ Erro ao importar recebimentos PDV:', error);
            throw error;
        }
    }

    /**
     * Importar impostos federais
     */
    static async importarImpostosFederais(impostos) {
        try {
            console.log(`📥 Importando ${impostos.length} impostos federais...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO impostos_federais (
                        imposto_id_old, descricao_old, status,
                        imposto_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const imposto of impostos) {
                    stmt.run(
                        imposto.id?.toString() || null,
                        imposto.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${impostos.length} impostos federais importados`);
            return { success: true, count: impostos.length };
        } catch (error) {
            console.error('❌ Erro ao importar impostos federais:', error);
            throw error;
        }
    }

    /**
     * Importar regime tributário
     */
    static async importarRegimeTributario(regimes) {
        try {
            console.log(`📥 Importando ${regimes.length} regimes tributários...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO regime_tributario (
                        regime_id_old, descricao_old, status,
                        regime_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const regime of regimes) {
                    stmt.run(
                        regime.id?.toString() || null,
                        regime.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${regimes.length} regimes tributários importados`);
            return { success: true, count: regimes.length };
        } catch (error) {
            console.error('❌ Erro ao importar regime tributário:', error);
            throw error;
        }
    }

    /**
     * Importar situações fiscais
     */
    static async importarSituacoesFiscais(situacoes) {
        try {
            console.log(`📥 Importando ${situacoes.length} situações fiscais...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO situacoes_fiscais (
                        situacao_id_old, descricao_old, status,
                        situacao_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const situacao of situacoes) {
                    stmt.run(
                        situacao.id?.toString() || null,
                        situacao.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${situacoes.length} situações fiscais importadas`);
            return { success: true, count: situacoes.length };
        } catch (error) {
            console.error('❌ Erro ao importar situações fiscais:', error);
            throw error;
        }
    }

    /**
     * Importar tabelas tributárias entrada
     */
    static async importarTabelasTributariasEntrada(tabelas) {
        try {
            console.log(`📥 Importando ${tabelas.length} tabelas tributárias de entrada...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO tabelas_tributarias_entrada (
                        tabela_id_old, descricao_old, status,
                        tabela_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const tabela of tabelas) {
                    stmt.run(
                        tabela.id?.toString() || null,
                        tabela.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${tabelas.length} tabelas tributárias de entrada importadas`);
            return { success: true, count: tabelas.length };
        } catch (error) {
            console.error('❌ Erro ao importar tabelas tributárias entrada:', error);
            throw error;
        }
    }

    /**
     * Importar tabelas tributárias saída
     */
    static async importarTabelasTributariasSaida(tabelas) {
        try {
            console.log(`📥 Importando ${tabelas.length} tabelas tributárias de saída...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO tabelas_tributarias_saida (
                        tabela_id_old, descricao_old, status,
                        tabela_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const tabela of tabelas) {
                    stmt.run(
                        tabela.id?.toString() || null,
                        tabela.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${tabelas.length} tabelas tributárias de saída importadas`);
            return { success: true, count: tabelas.length };
        } catch (error) {
            console.error('❌ Erro ao importar tabelas tributárias saída:', error);
            throw error;
        }
    }

    /**
     * Importar tipos de operações
     */
    static async importarTiposOperacoes(tipos) {
        try {
            console.log(`📥 Importando ${tipos.length} tipos de operações...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO tipos_operacoes (
                        tipo_id_old, descricao_old, status,
                        tipo_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const tipo of tipos) {
                    stmt.run(
                        tipo.id?.toString() || null,
                        tipo.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${tipos.length} tipos de operações importados`);
            return { success: true, count: tipos.length };
        } catch (error) {
            console.error('❌ Erro ao importar tipos de operações:', error);
            throw error;
        }
    }

    /**
     * Importar tipos de ajustes
     */
    static async importarTiposAjustes(tipos) {
        try {
            console.log(`📥 Importando ${tipos.length} tipos de ajustes...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO tipos_ajustes (
                        tipo_id_old, descricao_old, status,
                        tipo_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const tipo of tipos) {
                    stmt.run(
                        tipo.id?.toString() || null,
                        tipo.descricao || null,
                        'U',
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${tipos.length} tipos de ajustes importados`);
            return { success: true, count: tipos.length };
        } catch (error) {
            console.error('❌ Erro ao importar tipos de ajustes:', error);
            throw error;
        }
    }

    /**
     * Importar local estoque
     */
    static async importarLocalEstoque(locais) {
        try {
            console.log(`📥 Importando ${locais.length} locais de estoque...`);
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO local_estoque (
                        local_id_old, descricao_old, loja_id_old, status,
                        local_id_new, descricao_new, loja_id_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const local of locais) {
                    stmt.run(
                        local.id?.toString() || null,
                        local.descricao || null,
                        local.lojaId?.toString() || null,
                        'U',
                        null,
                        null,
                        null
                    );
                }
            });

            transaction();
            console.log(`✅ ${locais.length} locais de estoque importados`);
            return { success: true, count: locais.length };
        } catch (error) {
            console.error('❌ Erro ao importar local estoque:', error);
            throw error;
        }
    }

    /**
     * Obter estatísticas do banco
     */
    static async obterEstatisticas() {
        try {
            dbSQLite.getConnection();

            const stats = {
                secoes: dbSQLite.count('secoes'),
                grupos: dbSQLite.count('grupos'),
                subgrupos: dbSQLite.count('subgrupos'),
                marcas: dbSQLite.count('marcas'),
                familias: dbSQLite.count('familias'),
                produtos: dbSQLite.count('produtos'),
                clientes: dbSQLite.count('clientes'),
                fornecedores: dbSQLite.count('fornecedores'),
                lojas: dbSQLite.count('lojas'),
                caixas: dbSQLite.count('caixas'),
                agentes: dbSQLite.count('agentes'),
                categorias: dbSQLite.count('categorias'),
                contas_correntes: dbSQLite.count('contas_correntes'),
                especies_documento: dbSQLite.count('especies_documento'),
                historico_padrao: dbSQLite.count('historico_padrao'),
                motivos_cancelamento: dbSQLite.count('motivos_cancelamento'),
                motivos_desconto: dbSQLite.count('motivos_desconto'),
                motivos_devolucao: dbSQLite.count('motivos_devolucao'),
                pagamentos_pdv: dbSQLite.count('pagamentos_pdv'),
                recebimentos_pdv: dbSQLite.count('recebimentos_pdv'),
                impostos_federais: dbSQLite.count('impostos_federais'),
                regime_tributario: dbSQLite.count('regime_tributario'),
                situacoes_fiscais: dbSQLite.count('situacoes_fiscais'),
                tabelas_tributarias_entrada: dbSQLite.count('tabelas_tributarias_entrada'),
                tabelas_tributarias_saida: dbSQLite.count('tabelas_tributarias_saida'),
                tipos_operacoes: dbSQLite.count('tipos_operacoes'),
                tipos_ajustes: dbSQLite.count('tipos_ajustes'),
                local_estoque: dbSQLite.count('local_estoque')
            };

            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                secoes: 0,
                grupos: 0,
                subgrupos: 0,
                marcas: 0,
                familias: 0,
                produtos: 0,
                clientes: 0,
                fornecedores: 0,
                lojas: 0,
                caixas: 0,
                agentes: 0,
                categorias: 0,
                contas_correntes: 0,
                especies_documento: 0,
                historico_padrao: 0,
                motivos_cancelamento: 0,
                motivos_desconto: 0,
                motivos_devolucao: 0,
                pagamentos_pdv: 0,
                recebimentos_pdv: 0,
                impostos_federais: 0,
                regime_tributario: 0,
                situacoes_fiscais: 0,
                tabelas_tributarias_entrada: 0,
                tabelas_tributarias_saida: 0,
                tipos_operacoes: 0,
                tipos_ajustes: 0,
                local_estoque: 0
            };
        }
    }
}

module.exports = ImportacaoService;