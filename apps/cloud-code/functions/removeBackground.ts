import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

const API_KEY = Deno.env.get("REMOVE_BG_API_KEY");
const API_ENDPOINT = 'https://api.remove.bg/v1/removebg';

Deno.serve(async (req) => {
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: 'API key for remove.bg is not configured.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const imageFile = formData.get('image_file');

        if (!imageFile) {
            return new Response(JSON.stringify({ error: 'No image file provided.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const apiFormData = new FormData();
        apiFormData.append('image_file', imageFile);
        apiFormData.append('size', 'auto');

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
            },
            body: apiFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('remove.bg API error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to remove background.', details: errorText }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const imageBlob = await response.blob();
        
        return new Response(imageBlob, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
            },
        });

    } catch (error) {
        console.error('Function error:', error);
        return new Response(JSON.stringify({ error: 'An internal error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});