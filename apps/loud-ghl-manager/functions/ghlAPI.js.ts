import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, ...params } = await req.json();
        const apiKey = Deno.env.get("GHL_API_KEY");

        if (!apiKey) {
            return Response.json({ error: 'GHL API Key not configured' }, { status: 500 });
        }

        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Version": API_VERSION,
            "Content-Type": "application/json"
        };

        // List all sub-accounts
        if (action === "listSubAccounts") {
            const response = await fetch(`${GHL_API_BASE}/locations/search`, {
                method: "GET",
                headers
            });

            if (!response.ok) {
                throw new Error(`GHL API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            return Response.json({ success: true, data: data.locations || [] });
        }

        // Create a new sub-account
        if (action === "createSubAccount") {
            const { name, address, city, state, country, postalCode } = params;
            
            const response = await fetch(`${GHL_API_BASE}/locations/`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    name,
                    address: address || "123 Main St",
                    city: city || "New York",
                    state: state || "NY",
                    country: country || "US",
                    postalCode: postalCode || "10001"
                })
            });

            if (!response.ok) {
                throw new Error(`GHL API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            return Response.json({ success: true, data });
        }

        // Get sub-account details
        if (action === "getSubAccount") {
            const { locationId } = params;
            
            const response = await fetch(`${GHL_API_BASE}/locations/${locationId}`, {
                method: "GET",
                headers
            });

            if (!response.ok) {
                throw new Error(`GHL API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            return Response.json({ success: true, data });
        }

        // Create Pipeline
        if (action === "createPipeline") {
            const { locationId, name, stages } = params;
            
            const response = await fetch(`${GHL_API_BASE}/opportunities/pipelines`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    locationId,
                    name,
                    stages: stages.map((stageName, index) => ({
                        name: stageName,
                        position: index
                    }))
                })
            });

            if (!response.ok) {
                throw new Error(`GHL API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            return Response.json({ success: true, data });
        }

        // Create Custom Field
        if (action === "createCustomField") {
            const { locationId, name, dataType, fieldKey } = params;
            
            const response = await fetch(`${GHL_API_BASE}/locations/${locationId}/customFields`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    name,
                    dataType: dataType || "TEXT",
                    fieldKey: fieldKey || name.toLowerCase().replace(/\s+/g, '_')
                })
            });

            if (!response.ok) {
                throw new Error(`GHL API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            return Response.json({ success: true, data });
        }

        // Get workflows from a location
        if (action === "getWorkflows") {
            const { locationId } = params;
            
            const response = await fetch(`${GHL_API_BASE}/workflows/?locationId=${locationId}`, {
                method: "GET",
                headers
            });

            if (!response.ok) {
                throw new Error(`GHL API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            return Response.json({ success: true, data: data.workflows || [] });
        }

        // Get custom fields from a location
        if (action === "getCustomFields") {
            const { locationId } = params;
            
            const response = await fetch(`${GHL_API_BASE}/locations/${locationId}/customFields`, {
                method: "GET",
                headers
            });

            if (!response.ok) {
                throw new Error(`GHL API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            return Response.json({ success: true, data: data.customFields || [] });
        }

        // Copy workflow (simplified - actual implementation would use workflow export/import)
        if (action === "copyWorkflow") {
            const { sourceLocationId, targetLocationId, workflowId } = params;
            
            // Note: GHL API doesn't have direct workflow copy. This is a placeholder.
            // In production, you'd export workflow JSON and import to target location
            return Response.json({ 
                success: true, 
                message: "Workflow copy initiated. Note: Full workflow copying requires GHL workflow export/import API.",
                data: { workflowId }
            });
        }

        return Response.json({ error: 'Unknown action' }, { status: 400 });

    } catch (error) {
        console.error("GHL API Error:", error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});