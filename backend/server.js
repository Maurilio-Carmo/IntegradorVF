// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rotas
const importacaoRoutes = require('./src/routes/importacao');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// IMPORTANTE: Servir arquivos estáticos ANTES das rotas
const frontendPath = path.join(__dirname, '../frontend');
console.log('📂 Servindo arquivos estáticos de:', frontendPath);

app.use(express.static(frontendPath));

// Rotas da API
app.use('/api/importacao', importacaoRoutes);

// Proxy para API Varejo Fácil - COM TRATAMENTO DE ERRO MELHORADO
app.all('/api/vf/*', async (req, res) => {
    try {
        const apiUrl = req.headers['x-api-url'];
        const apiKey = req.headers['x-api-key'];
        const pathParam = req.params[0];

        // Validar headers necessários
        if (!apiUrl || !apiKey) {
            console.error('❌ Headers faltando:', { apiUrl: !!apiUrl, apiKey: !!apiKey });
            return res.status(400).json({ 
                error: 'Headers x-api-url e x-api-key são obrigatórios',
                details: 'Configure a API antes de fazer requisições'
            });
        }

        // Montar URL completa
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        const fullUrl = `${apiUrl}/${pathParam}${queryString}`;

        console.log(`🔄 Proxy request: ${req.method} ${fullUrl}`);

        // Fazer requisição para API externa - CÓDIGO CORRIGIDO
        const response = await fetch(fullUrl, {
            method: req.method,
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' 
            ? JSON.stringify(req.body) 
            : undefined
        });

        // Log do status da resposta
        console.log(`📥 Response status: ${response.status} ${response.statusText}`);

        // Se a resposta não for ok, retornar o erro da API
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: response.statusText };
            }
            
            console.error('❌ API Error:', errorData);
            
            return res.status(response.status).json({ 
                error: `API retornou erro ${response.status}`,
                details: errorData,
                apiUrl: fullUrl
            });
        }

        // Tentar parsear resposta JSON
        const data = await response.json();
        console.log('✅ Proxy success');
        res.json(data);

    } catch (error) {
        console.error('❌ Proxy error:', error);
        
        // Tratar erros de rede
        if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: 'Não foi possível conectar à API Varejo Fácil',
                details: 'Verifique se a URL da API está correta e se o servidor está acessível',
                originalError: error.message
            });
        }

        res.status(500).json({ 
            error: error.message,
            details: 'Erro ao fazer proxy para API Varejo Fácil',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        nodeVersion: process.version
    });
});

// Rota principal - DEVE VIR POR ÚLTIMO
app.get('*', (req, res) => {
    // Ignorar rotas da API
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Pasta frontend: ${frontendPath}`);
    console.log(`✅ CORS habilitado`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
