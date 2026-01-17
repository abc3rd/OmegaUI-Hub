import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            operation_type,
            operation_name,
            tokens_used,
            input_tokens,
            output_tokens,
            model_used,
            cost_usd,
            request_metadata,
            success = true,
            error_message
        } = await req.json();

        // Validate required fields
        if (!operation_type || !tokens_used) {
            return Response.json({ 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        // Create usage record
        const usageRecord = await base44.entities.TokenUsage.create({
            user_email: user.email,
            operation_type,
            operation_name: operation_name || operation_type,
            tokens_used: parseInt(tokens_used),
            input_tokens: input_tokens ? parseInt(input_tokens) : 0,
            output_tokens: output_tokens ? parseInt(output_tokens) : 0,
            cost_usd: parseFloat(cost_usd || 0),
            model_used: model_used || 'unknown',
            request_metadata: request_metadata || {},
            success,
            error_message
        });

        // Update user's quota
        const quotas = await base44.entities.TokenQuota.list();
        let userQuota = quotas.find(q => q.user_email === user.email);

        if (!userQuota) {
            // Create default quota
            userQuota = await base44.entities.TokenQuota.create({
                user_email: user.email,
                quota_type: 'free',
                monthly_token_limit: 10000,
                tokens_used_this_month: parseInt(tokens_used),
                reset_date: getNextMonthDate(),
                overage_allowed: false,
                alert_threshold: 0.8,
                alerted: false
            });
        } else {
            // Check if quota needs reset
            const resetDate = new Date(userQuota.reset_date);
            if (resetDate < new Date()) {
                await base44.entities.TokenQuota.update(userQuota.id, {
                    tokens_used_this_month: parseInt(tokens_used),
                    reset_date: getNextMonthDate(),
                    alerted: false
                });
            } else {
                // Update usage
                const newUsage = userQuota.tokens_used_this_month + parseInt(tokens_used);
                await base44.entities.TokenQuota.update(userQuota.id, {
                    tokens_used_this_month: newUsage
                });

                // Check if alert needed
                const usagePercentage = newUsage / userQuota.monthly_token_limit;
                if (usagePercentage >= userQuota.alert_threshold && !userQuota.alerted) {
                    await base44.entities.TokenQuota.update(userQuota.id, {
                        alerted: true
                    });

                    // Send alert email
                    try {
                        await base44.integrations.Core.SendEmail({
                            to: user.email,
                            subject: 'Token Usage Alert - Face to Face',
                            body: `You've used ${(usagePercentage * 100).toFixed(1)}% of your monthly token quota (${newUsage.toLocaleString()} / ${userQuota.monthly_token_limit.toLocaleString()} tokens). Consider upgrading your plan to avoid service interruption.`
                        });
                    } catch (emailError) {
                        console.error('Failed to send alert email:', emailError);
                    }
                }

                // Check if quota exceeded
                if (newUsage > userQuota.monthly_token_limit && !userQuota.overage_allowed) {
                    return Response.json({
                        success: false,
                        error: 'Monthly token quota exceeded',
                        quota_exceeded: true,
                        usage: newUsage,
                        limit: userQuota.monthly_token_limit
                    }, { status: 429 });
                }
            }
        }

        return Response.json({
            success: true,
            usage_recorded: true,
            record_id: usageRecord.id,
            tokens_remaining: userQuota ? userQuota.monthly_token_limit - (userQuota.tokens_used_this_month + parseInt(tokens_used)) : null
        });

    } catch (error) {
        console.error('Token tracking error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});

function getNextMonthDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
}