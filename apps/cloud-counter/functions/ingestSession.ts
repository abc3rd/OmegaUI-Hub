import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get the payload
        const payload = await req.json();
        
        // Validate required fields
        const { appName, workflowId, runType, model, promptTokens, completionTokens, latencyMs } = payload;
        
        if (!appName || !workflowId || !runType || !model || 
            promptTokens === undefined || completionTokens === undefined || latencyMs === undefined) {
            return Response.json({ 
                error: 'Missing required fields: appName, workflowId, runType, model, promptTokens, completionTokens, latencyMs' 
            }, { status: 400 });
        }
        
        // Validate runType
        if (!['baseline', 'ucp'].includes(runType)) {
            return Response.json({ error: 'runType must be "baseline" or "ucp"' }, { status: 400 });
        }
        
        // Calculate total tokens
        const totalTokens = promptTokens + completionTokens;
        
        // Prepare session data
        const sessionData = {
            appName: String(appName).substring(0, 200),
            workflowId: String(workflowId).substring(0, 200),
            runType,
            model: String(model).substring(0, 100),
            promptTokens: Number(promptTokens),
            completionTokens: Number(completionTokens),
            totalTokens,
            latencyMs: Number(latencyMs),
            source: payload.source || 'unknown',
            ucpPacketId: payload.ucpPacketId || null,
            notes: payload.notes ? String(payload.notes).substring(0, 1000) : null
        };
        
        // Handle energy
        if (payload.energyWh !== undefined && payload.energyWh !== null) {
            sessionData.energyWh = Number(payload.energyWh);
            sessionData.energyMode = payload.energyMode || 'measured';
            if (payload.avgPowerW) {
                sessionData.avgPowerW = Number(payload.avgPowerW);
            }
        } else {
            // Estimate energy
            // Try to get model profile
            let avgPowerW = 150; // Default fallback
            
            try {
                const profiles = await base44.asServiceRole.entities.ModelProfile.filter({ model });
                if (profiles.length > 0) {
                    avgPowerW = profiles[0].avgPowerW;
                }
            } catch (err) {
                console.log('Could not fetch model profile, using default power:', err);
            }
            
            // Energy (Wh) = Power (W) * Time (hours)
            const timeHours = latencyMs / 1000 / 3600;
            sessionData.energyWh = avgPowerW * timeHours;
            sessionData.energyMode = 'estimated';
            sessionData.avgPowerW = avgPowerW;
        }
        
        // Calculate CO2 (using default grid intensity of 400 g/kWh)
        const gridIntensity = 400; // g/kWh
        sessionData.co2g = (sessionData.energyWh / 1000) * gridIntensity;
        
        // Calculate cost if model profile has pricing
        try {
            const profiles = await base44.asServiceRole.entities.ModelProfile.filter({ model });
            if (profiles.length > 0 && profiles[0].costPer1kPrompt && profiles[0].costPer1kCompletion) {
                const promptCost = (promptTokens / 1000) * profiles[0].costPer1kPrompt;
                const completionCost = (completionTokens / 1000) * profiles[0].costPer1kCompletion;
                sessionData.costUsd = promptCost + completionCost;
            }
        } catch (err) {
            console.log('Could not calculate cost:', err);
        }
        
        // Create session
        const session = await base44.asServiceRole.entities.Session.create(sessionData);
        
        return Response.json({ 
            success: true, 
            sessionId: session.id,
            session 
        });
        
    } catch (error) {
        console.error('Ingestion error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});