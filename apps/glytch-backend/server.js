const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// AI model endpoints
const AI_ENDPOINTS = {
    mytho: 'http://localhost:1234/v1/chat/completions',
    deepseek: 'http://localhost:1235/v1/chat/completions',
    autocoder: 'http://localhost:1236/v1/chat/completions',
    ocr: 'http://localhost:8188/prompt',
    anythingllm: 'http://localhost:3001/api/v1/workspace/chat'
};

// Module status store (overridden by POST /api/module-update)
const moduleStatus = {
    mytho: 'offline',
    deepseek: 'offline',
    autocoder: 'offline',
    ocr: 'offline',
    anythingllm: 'offline'
};

// Proxy for OpenAI-compatible endpoints
async function proxyToOpenAI(endpoint, userInput, modelName = "local-model") {
    const payload = {
        model: modelName,
        messages: [{ role: "user", content: userInput }],
        stream: false,
        temperature: 0.7,
        max_tokens: 2048
    };

    const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
    });

    return response.data.choices[0].message.content;
}

// Specialized proxy for ComfyUI OCR
async function proxyToComfyUI(endpoint, userInput) {
    const payload = {
        prompt: userInput,
        workflow: "ocr_workflow"
    };

    const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 180000
    });

    return response.data.output || response.data.result || response.data;
}

// Proxy for AnythingLLM
async function proxyToAnythingLLM(endpoint, userInput) {
    const payload = {
        message: userInput,
        mode: "chat"
    };

    const response = await axios.post(endpoint, payload, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.ANYTHINGLLM_API_KEY || ''
        },
        timeout: 120000
    });

    return response.data.textResponse || response.data.response || response.data;
}

// Routes
app.post('/api/mytho', async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) return res.status(400).json({ error: 'Input is required' });
        const output = await proxyToOpenAI(AI_ENDPOINTS.mytho, input, "mythomax");
        res.json({ output });
    } catch (err) {
        console.error('MythoMax Error:', err.message);
        res.status(500).json({ error: 'MythoMax service unavailable', details: err.response?.data || err.message });
    }
});

app.post('/api/deepseek', async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) return res.status(400).json({ error: 'Input is required' });
        const output = await proxyToOpenAI(AI_ENDPOINTS.deepseek, input, "deepseek-coder");
        res.json({ output });
    } catch (err) {
        console.error('DeepSeek Error:', err.message);
        res.status(500).json({ error: 'DeepSeek service unavailable', details: err.response?.data || err.message });
    }
});

app.post('/api/autocoder', async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) return res.status(400).json({ error: 'Input is required' });
        const output = await proxyToOpenAI(AI_ENDPOINTS.autocoder, input, "autocoder-33b");
        res.json({ output });
    } catch (err) {
        console.error('AutoCoder Error:', err.message);
        res.status(500).json({ error: 'AutoCoder service unavailable', details: err.response?.data || err.message });
    }
});

app.post('/api/ocr', async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) return res.status(400).json({ error: 'Input is required' });
        const output = await proxyToComfyUI(AI_ENDPOINTS.ocr, input);
        res.json({ output });
    } catch (err) {
        console.error('OCR Error:', err.message);
        res.status(500).json({ error: 'OCR service unavailable', details: err.response?.data || err.message });
    }
});

app.post('/api/anythingllm', async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) return res.status(400).json({ error: 'Input is required' });
        const output = await proxyToAnythingLLM(AI_ENDPOINTS.anythingllm, input);
        res.json({ output });
    } catch (err) {
        console.error('AnythingLLM Error:', err.message);
        res.status(500).json({ error: 'AnythingLLM service unavailable', details: err.response?.data || err.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: Object.keys(AI_ENDPOINTS)
    });
});

// Module status override
app.post('/api/module-update', (req, res) => {
    const { module, status } = req.body;
    if (module in moduleStatus) {
        moduleStatus[module] = status;
        return res.json({ success: true, module, status });
    } else {
        return res.status(400).json({ error: 'Invalid module' });
    }
});

// Final status output
app.get('/api/status', (req, res) => {
    res.json({
        status: moduleStatus,
        timestamp: new Date().toISOString()
    });
});

// Root homepage
app.get('/', (req, res) => {
    res.send(`
        <h1>🧠 GLYTCH API Online</h1>
        <p>Visit <code>/api/health</code> or <code>/api/status</code> for live module status.</p>
    `);
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 fallback
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 GLYTCH Backend running on port ${PORT}`);
});
