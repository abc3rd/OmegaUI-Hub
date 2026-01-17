import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const { workflowId, data, n8nUrl = 'http://localhost:5678' } = await req.json();

        if (!workflowId) {
            return new Response(JSON.stringify({ error: 'Workflow ID is required' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Trigger N8n workflow
        const n8nResponse = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: user.email,
                data: data,
                timestamp: new Date().toISOString(),
                source: 'abc_dashboard'
            })
        });

        const n8nResult = await n8nResponse.text();
        
        // Log the workflow trigger
        await base44.asServiceRole.entities.N8nWorkflowLog.create({
            workflow_id: workflowId,
            trigger_data: data,
            status: n8nResponse.ok ? 'success' : 'failed',
            response_data: n8nResult,
            triggered_by: user.email
        });

        return new Response(JSON.stringify({
            success: n8nResponse.ok,
            status: n8nResponse.status,
            data: n8nResult
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('N8n Trigger Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});