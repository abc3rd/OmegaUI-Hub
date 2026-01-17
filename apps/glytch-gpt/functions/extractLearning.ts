import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automatically extracts learnings from conversation history
 * Analyzes user patterns, preferences, and implicit feedback
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, conversation_id } = await req.json();

        if (!messages || messages.length === 0) {
            return Response.json({ error: 'No messages provided' }, { status: 400 });
        }

        // Use AI to extract learnings from conversation patterns
        const conversationText = messages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n\n');

        const prompt = `Analyze this conversation and extract 1-3 key learnings about the user's preferences, communication style, or recurring needs.

Conversation:
${conversationText}

Extract learnings that are:
- Specific and actionable
- About user preferences or patterns
- Not obvious facts
- Useful for personalizing future responses

Return ONLY a JSON array of learning strings, no other text:
["learning 1", "learning 2"]`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    learnings: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        const learnings = result.learnings || [];

        // Save learnings to database
        const saved = [];
        for (const fact of learnings) {
            if (fact.trim()) {
                const learning = await base44.entities.Learning.create({ fact });
                saved.push(learning);
            }
        }

        return Response.json({
            success: true,
            extracted_count: saved.length,
            learnings: saved
        });
    } catch (error) {
        console.error('Error extracting learning:', error);
        return Response.json({ 
            error: error.message || 'Failed to extract learning' 
        }, { status: 500 });
    }
});