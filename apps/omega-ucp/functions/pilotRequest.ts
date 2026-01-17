import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Require authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });
        }

        const body = await req.json();
        const {
            name, email, company, role,
            decisionRole, timeline, budget, useCase, volume, pain,
            commitAck, preparedToPilot, evalFeeOk,
            score, qualified,
            pageUrl
        } = body;

        // Validate required fields
        if (!name || !email || !company || !role) {
            return Response.json({ 
                ok: false, 
                error: 'Missing required fields: name, email, company, role' 
            }, { status: 400 });
        }

        // Create PilotRequest record
        const pilotRequest = await base44.entities.PilotRequest.create({
            name,
            email,
            company,
            role,
            decision_role: decisionRole,
            timeline,
            budget,
            use_case: useCase,
            volume,
            pain,
            commit_ack: commitAck,
            prepared_to_pilot: preparedToPilot,
            eval_fee_ok: evalFeeOk,
            score,
            qualified,
            source: 'ucp_demo',
            page_url: pageUrl,
            user_id: user.id,
            status: 'new'
        });

        // If not qualified, return early
        if (!qualified) {
            return Response.json({
                ok: true,
                qualified: false,
                pilotRequestId: pilotRequest.id
            });
        }

        // If qualified, push to GoHighLevel
        const ghlApiKey = Deno.env.get('GHL_API_KEY');
        const ghlLocationId = Deno.env.get('GHL_LOCATION_ID');
        const ghlPipelineId = Deno.env.get('GHL_PIPELINE_ID');
        const ghlStageId = Deno.env.get('GHL_STAGE_ID');

        if (!ghlApiKey || !ghlLocationId || !ghlPipelineId || !ghlStageId) {
            // Save but warn about missing GHL config
            await base44.entities.PilotRequest.update(pilotRequest.id, {
                status: 'ghl_config_missing'
            });
            return Response.json({
                ok: true,
                qualified: true,
                pilotRequestId: pilotRequest.id,
                warning: 'GHL credentials not configured'
            });
        }

        try {
            // Create/Upsert contact
            const contactPayload = {
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || name,
                email,
                companyName: company,
                tags: ['UCP', 'Pilot Qualified', 'UCP Demo'],
                source: 'UCP Demo',
                locationId: ghlLocationId
            };

            const contactResponse = await fetch('https://services.leadconnector.io/contacts/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ghlApiKey}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactPayload)
            });

            if (!contactResponse.ok) {
                throw new Error(`GHL Contact API error: ${contactResponse.status}`);
            }

            const contactData = await contactResponse.json();
            const ghlContactId = contactData.contact?.id;

            // Create opportunity
            const opportunityPayload = {
                pipelineId: ghlPipelineId,
                locationId: ghlLocationId,
                name: `UCP Pilot - ${company}`,
                pipelineStageId: ghlStageId,
                status: 'open',
                contactId: ghlContactId,
                monetaryValue: 0,
                source: 'UCP Demo'
            };

            const opportunityResponse = await fetch('https://services.leadconnector.io/opportunities/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ghlApiKey}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(opportunityPayload)
            });

            if (!opportunityResponse.ok) {
                throw new Error(`GHL Opportunity API error: ${opportunityResponse.status}`);
            }

            const opportunityData = await opportunityResponse.json();
            const ghlOpportunityId = opportunityData.opportunity?.id;

            // Update PilotRequest with GHL IDs
            await base44.entities.PilotRequest.update(pilotRequest.id, {
                ghl_contact_id: ghlContactId,
                ghl_opportunity_id: ghlOpportunityId,
                status: 'pushed_to_ghl'
            });

            return Response.json({
                ok: true,
                qualified: true,
                pilotRequestId: pilotRequest.id,
                ghlContactId,
                ghlOpportunityId
            });

        } catch (ghlError) {
            // GHL failed but request is saved
            await base44.entities.PilotRequest.update(pilotRequest.id, {
                status: 'ghl_failed'
            });

            return Response.json({
                ok: true,
                qualified: true,
                pilotRequestId: pilotRequest.id,
                warning: `GHL push failed: ${ghlError.message}`
            });
        }

    } catch (error) {
        return Response.json({ 
            ok: false, 
            error: error.message 
        }, { status: 500 });
    }
});