// backend/server.js

'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

// Importar rotas
const importacaoRoutes = require('./src/routes/importacao');
const apiProxyRoutes   = require('./src/routes/api-proxy');   // ← módulo completo
const app  = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// IMPORTANTE: Servir arquivos estáticos ANTES das rotas
const frontendPath = path.join(__dirname, '../frontend');
console.log('📂 Servindo frontend de:', frontendPath);

app.use(express.static(frontendPath));

// Rotas da API
app.use('/api/importacao', importacaoRoutes);
app.use('/api/vf',         apiProxyRoutes);

// HEALTH CHECK
app.get('/health', (_req, res) => {
    res.json({
        status:      'ok',
        timestamp:   new Date().toISOString(),
        nodeVersion: process.version,
        env:         process.env.NODE_ENV || 'development'
    });
});

// Rota principal - DEVE VIR POR ÚLTIMO
app.get('*', (req, res) => {
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint não encontrado' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor:    http://localhost:${PORT}`);
    console.log(`🔗 Health:      http://localhost:${PORT}/health`);
    console.log(`📡 Proxy API:   http://localhost:${PORT}/api/vf/*`);
    console.log(`💾 Importação:  http://localhost:${PORT}/api/importacao/*`);
    console.log(`✅ CORS habilitado | Limite JSON: 50mb`);
});