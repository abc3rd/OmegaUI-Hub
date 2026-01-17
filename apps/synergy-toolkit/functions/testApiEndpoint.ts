import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    // This function can be called by authenticated users.
    // It's a utility to test external endpoints, so it doesn't need to be restricted to service roles.
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, method, headers, body } = await req.json();

    if (!url || !method) {
        return Response.json({ error: 'URL and method are required' }, { status: 400 });
    }

    try {
        const startTime = performance.now();
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null,
        });
        const endTime = performance.now();

        const responseTime = Math.round(endTime - startTime);
        const responseBody = await response.text();
        
        let parsedBody;
        try {
            parsedBody = JSON.parse(responseBody);
        } catch (e) {
            parsedBody = responseBody;
        }

        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        return Response.json({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: parsedBody,
            responseTime: responseTime,
        });

    } catch (error) {
        return Response.json({ 
            error: 'Failed to fetch', 
            message: error.message,
            cause: error.cause ? String(error.cause) : null
        }, { status: 500 });
    }
});