import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    try {
        const webhookData = await req.json();
        const base44 = createClientFromRequest(req);
        
        // Log incoming webhook
        await base44.asServiceRole.entities.N8nWebhookLog.create({
            webhook_data: webhookData,
            received_at: new Date().toISOString()
        });

        // Process different types of N8n webhooks
        const { action, entityType, data } = webhookData;

        switch (action) {
            case 'create_contact':
                if (data.email && data.full_name) {
                    await base44.asServiceRole.entities.Contact.create({
                        full_name: data.full_name,
                        email: data.email,
                        phone: data.phone || '',
                        company: data.company || '',
                        notes: `Created via N8n automation - ${new Date().toLocaleString()}`
                    });
                }
                break;
                
            case 'create_task':
                if (data.title) {
                    await base44.asServiceRole.entities.Todo.create({
                        title: data.title,
                        description: data.description || '',
                        priority: data.priority || 'medium',
                        status: data.status || 'todo',
                        due_date: data.due_date || null
                    });
                }
                break;
                
            case 'create_lead':
                if (data.email && data.full_name) {
                    await base44.asServiceRole.entities.Lead.create({
                        full_name: data.full_name,
                        email: data.email,
                        company: data.company || '',
                        source: data.source || 'N8n Automation',
                        status: data.status || 'new',
                        value: data.value || 0
                    });
                }
                break;
                
            default:
                console.log('Unknown webhook action:', action);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Webhook processed successfully' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('N8n Webhook Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});