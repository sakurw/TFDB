require('dotenv').config();
const express = require('express');
const https = require('https');
const path = require('path');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5500;
console.log('PORT:', process.env.PORT);

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


app.use((req, res, next) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    const origin = req.headers.origin;
    if (origin === allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/users', async (req, res) => {
    try {
        const apiKey = process.env.API_KEY;
        const apiUrl = 'https://tfdbapi.com/users';

        const options = {
            headers: {
                'Authorization': `${apiKey}`
            }
        };
        https.get(apiUrl, options, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => {
                data += chunk;
            });
            apiRes.on('end', () => {
                res.json(JSON.parse(data));
            });
        }).on('error', (error) => {
            console.error('Error calling API:', error);
            res.status(500).json({ error: "Error calling external API" });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/searchid', express.json(), async (req, res) => {

    try {
        const apiKey = process.env.API_KEY;
        const apiUrl = 'https://tfdbapi.com/searchid';

        const postData = JSON.stringify(req.body);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': `${apiKey}`
            }
        };

        const apiReq = https.request(apiUrl, options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                res.json(JSON.parse(data));
            });
        });

        apiReq.on('error', (error) => {
            console.error('Error calling API:', error);
            res.status(500).json({ error: "Error calling external API" });
        });

        apiReq.write(postData);
        apiReq.end();

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/search', express.json(), async (req, res) => {
    console.log('Received search request:', req.url);
    try {
        const apiKey = process.env.API_KEY;
        const apiUrl = 'https://tfdbapi.com/search';

        const postData = JSON.stringify(req.body);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': `${apiKey}`
            }
        };

        const apiReq = https.request(apiUrl, options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                res.json(JSON.parse(data));
            });
        });

        apiReq.on('error', (error) => {
            console.error('Error calling API:', error);
            res.status(500).json({ error: "Error calling external API" });
        });

        apiReq.write(postData);
        apiReq.end();

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: "Internal server error" });
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