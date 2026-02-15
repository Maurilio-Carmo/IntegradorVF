// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar node-fetch dinamicamente
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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

// Proxy para API Varejo Fácil
app.all('/api/vf/*', async (req, res) => {
    try {
        const apiUrl = req.headers['x-api-url'];
        const apiKey = req.headers['x-api-key'];
        const pathParam = req.params[0];

        if (!apiUrl || !apiKey) {
            return res.status(400).json({
                error: 'Headers x-api-url e x-api-key são obrigatórios'
            });
        }

        console.log('🔄 Proxy request:', {
            url: `${apiUrl}/${pathParam}`,
            method: req.method
        });

        const response = await fetch(
            `${apiUrl}/${pathParam}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`,
            {
                method: req.method,
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API retornou erro:', response.status, errorText);
            throw new Error(`API retornou status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Proxy response OK');
        res.json(data);
        
    } catch (error) {
        console.error('❌ Erro no proxy:', error.message);
        res.status(500).json({ 
            error: error.message,
            details: 'Erro ao fazer proxy para API Varejo Fácil'
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
    console.log(`🚀 Servidor rodando em http://localhost:3000`);
    console.log(`📁 Pasta frontend: ${frontendPath}`);
    console.log(`✅ CORS habilitado`);
    console.log(`🔗 Health check: http://localhost:3000/health`);
});