import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Allowlist of permitted base URLs
const ALLOWLIST = [
    'http://100.119.81.65:1234',
    'http://100.119.81.65:1234/v1'
];

// Allowlist of permitted paths
const ALLOWED_PATHS = [
    '/models',
    '/v1/models',
    '/chat/completions',
    '/v1/chat/completions',
    '/responses',
    '/v1/responses',
    '/completions',
    '/v1/completions',
    '/embeddings',
    '/v1/embeddings'
];

// Maximum response size (10MB)
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

// Request timeout (30 seconds)
const TIMEOUT_MS = 30000;

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { baseUrl, path, method = 'GET', headers = {}, body } = await req.json();

        // Validate baseUrl
        if (!baseUrl || typeof baseUrl !== 'string') {
            return Response.json({ 
                error: 'Invalid baseUrl' 
            }, { status: 400 });
        }

        // Normalize baseUrl (remove trailing slash)
        let normalizedBaseUrl = baseUrl.trim();
        if (normalizedBaseUrl.endsWith('/')) {
            normalizedBaseUrl = normalizedBaseUrl.slice(0, -1);
        }

        // Check allowlist
        const isAllowed = ALLOWLIST.some(allowed => {
            if (normalizedBaseUrl === allowed) return true;
            if (normalizedBaseUrl.startsWith(allowed + '/')) return true;
            return false;
        });

        if (!isAllowed) {
            return Response.json({ 
                error: 'Base URL not in allowlist',
                allowlist: ALLOWLIST
            }, { status: 403 });
        }

        // Validate path
        if (!path || typeof path !== 'string' || !path.startsWith('/')) {
            return Response.json({ 
                error: 'Invalid path - must start with /' 
            }, { status: 400 });
        }

        // Check if path is in allowed list
        const isPathAllowed = ALLOWED_PATHS.includes(path);
        if (!isPathAllowed) {
            return Response.json({ 
                error: 'Path not in allowlist',
                allowedPaths: ALLOWED_PATHS
            }, { status: 403 });
        }

        // Validate body size for requests with body
        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            const bodySize = JSON.stringify(body).length;
            if (bodySize > 20 * 1024) { // 20KB max
                return Response.json({ 
                    error: 'Request body too large',
                    maxSize: '20KB'
                }, { status: 413 });
            }
        }

        // Build full URL
        const fullUrl = `${normalizedBaseUrl}${path}`;

        // Prepare fetch options
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            signal: AbortSignal.timeout(TIMEOUT_MS)
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            fetchOptions.body = JSON.stringify(body);
        }

        // Make request
        const startTime = Date.now();
        const response = await fetch(fullUrl, fetchOptions);
        const latencyMs = Date.now() - startTime;

        // Check response size
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
            return Response.json({ 
                error: 'Response too large',
                maxSize: MAX_RESPONSE_SIZE
            }, { status: 413 });
        }

        // Parse response
        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Return proxied response
        return Response.json({
            status: response.status,
            statusText: response.statusText,
            data,
            latencyMs
        }, { status: 200 });

    } catch (error) {
        console.error('Proxy error:', error);
        
        if (error.name === 'TimeoutError') {
            return Response.json({ 
                error: 'Request timeout',
                timeoutMs: TIMEOUT_MS
            }, { status: 504 });
        }
        
        return Response.json({ 
            error: error.message || 'Proxy request failed' 
        }, { status: 500 });
    }
});