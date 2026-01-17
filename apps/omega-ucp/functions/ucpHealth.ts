Deno.serve(async (req) => {
    return Response.json({ 
        ok: true, 
        version: "v1",
        timestamp: new Date().toISOString()
    });
});