import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, prompt } = await req.json();
    
    // Create generation record
    const generation = await base44.asServiceRole.entities.AIGeneration.create({
      type,
      prompt,
      status: 'processing',
      created_by: user.email
    });
    
    let result = '';
    let tokensUsed = 0;
    let modelUsed = '';
    
    try {
      if (type === 'logo' || type === 'image') {
        const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: prompt
        });
        result = imageResult.url;
        modelUsed = 'dall-e-3';
        tokensUsed = 1000; // Placeholder for image generation
      
      } else if (type === 'content' || type === 'text') {
        const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiApiKey) {
          throw new Error('Gemini API key is not configured.');
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
        const geminiPrompt = `As a professional marketing copywriter, create compelling content based on this request: ${prompt}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: geminiPrompt }]
              }]
            })
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            throw new Error(`Gemini API error: ${geminiResponse.status} ${errorBody}`);
        }
        
        const geminiData = await geminiResponse.json();
        result = geminiData.candidates[0].content.parts[0].text;
        modelUsed = 'gemini-pro';
        // Placeholder for token usage
        tokensUsed = Math.floor(prompt.length / 4 + result.length / 4);
      
      } else {
        throw new Error('Invalid generation type');
      }

      // Update generation record on success
      await base44.asServiceRole.entities.AIGeneration.update(generation.id, {
        result,
        tokens_used: tokensUsed,
        model: modelUsed,
        status: 'completed'
      });

      return Response.json({ success: true, result, generationId: generation.id });

    } catch (error) {
      // Update generation record on failure
      await base44.asServiceRole.entities.AIGeneration.update(generation.id, {
        status: 'failed',
        result: error.message
      });
      console.error('AI Generation Error:', error);
      return Response.json({ error: `AI Generation failed: ${error.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});