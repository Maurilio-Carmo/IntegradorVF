// backend/src/routes/api-proxy.js

const express = require('express');
const router = express.Router();

// Proxy para API Varejo Fácil
router.all('/vf/*', async (req, res) => {
    try {
        const apiUrl = req.headers['x-api-url'];
        const apiKey = req.headers['x-api-key'];
        const path = req.params[0];

        const response = await fetch(`${apiUrl}/${path}`, {
            method: req.method,
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;