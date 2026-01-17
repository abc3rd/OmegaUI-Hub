import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Get user's dictionary size (count of their prompts)
    const userPrompts = await base44.entities.UCPPrompt.filter({ created_by: user.email });
    const dictionarySize = userPrompts.length;

    // Calculate cache hit rate based on dictionary size (more prompts = better caching)
    // Start at 70% for first prompt, increase by 2% per prompt up to 95%
    const baseCacheRate = 70;
    const incrementPerPrompt = 2;
    const maxCacheRate = 95;
    const cacheHitRate = Math.min(
      maxCacheRate,
      baseCacheRate + (dictionarySize * incrementPerPrompt)
    );

    // Generate realistic metrics based on cache efficiency
    // Better cache = lower power consumption
    const avgWatts = Math.round(280 - (cacheHitRate * 1.8)); // 280W baseline, reduces with better cache
    const utilization = Math.round(85 - (cacheHitRate * 0.6)); // 85% baseline, reduces with cache
    const tasksPerMin = 45 + Math.round((cacheHitRate / 10)); // More cache = slightly more throughput
    const joulesPerTask = Number((avgWatts * 60 / tasksPerMin / 10).toFixed(1));
    
    // Generate AI response using GLYTCH personality
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are GLYTCH AI, a high-performance AI system with UCP (Universal Command Protocol) caching. 
      
Respond to this user prompt in a concise, technical manner (1-2 sentences max):
"${prompt}"

Keep it brief and efficient - you're optimized for speed.`,
    });

    const response = aiResponse || 'Command processed successfully.';

    // Calculate tokens generated (estimate)
    const tokensGenerated = Math.round(response.length / 4);

    // Store the prompt and metrics
    const metrics = {
      cacheHitRate,
      avgWatts,
      utilization,
      tasksPerMin,
      joulesPerTask,
      tokensGenerated,
    };

    await base44.entities.UCPPrompt.create({
      prompt,
      response,
      metrics,
      dictionary_size: dictionarySize + 1,
    });

    return Response.json({
      response,
      metrics,
      dictionarySize: dictionarySize + 1,
      improvement: dictionarySize > 0 ? `${incrementPerPrompt}% better cache efficiency` : 'Building initial dictionary',
    });
  } catch (error) {
    console.error('Error processing prompt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});