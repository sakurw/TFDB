require('dotenv').config();
const express = require('express');
const https = require('https');
const path = require('path');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5500;
console.log('PORT:', port);

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


async function makeApiRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.API_KEY
            }
        };

        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
        }

        const req = https.request(process.env.API_URL + url, options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch (error) {
                    reject(new Error('Failed to parse API response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`API request failed: ${error.message}`));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

app.get('https://tfdb.onrender.com/api/users', async (req, res) => {
    try {
        const data = await makeApiRequest('GET', '/users');
        res.json(data);
    } catch (error) {
        console.error('Error in /api/users:', error);
        res.status(500).json({ error: "Error calling external API" });
    }
});

app.post('https://tfdb.onrender.com/api/searchid', async (req, res) => {
    try {
        const data = await makeApiRequest('POST', '/searchid', req.body);
        res.json(data);
    } catch (error) {
        console.error('Error in /api/searchid:', error);
        res.status(500).json({ error: "Error calling external API" });
    }
});

app.post('https://tfdb.onrender.com/api/search', async (req, res) => {
    console.log('Received search request:', req.url);
    try {
        const data = await makeApiRequest('POST', '/search', req.body);
        res.json(data);
    } catch (error) {
        console.error('Error in /api/search:', error);
        res.status(500).json({ error: "Error calling external API" });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});