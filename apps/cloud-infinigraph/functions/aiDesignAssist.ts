import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// AI-powered design assistance
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'suggest_colors': {
        // Generate color palette suggestions based on a base color
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate a professional color palette for an infographic based on the primary color: ${data.baseColor || '#3b82f6'}. 
          Consider complementary, analogous, and accent colors.
          The palette should be suitable for data visualization and easy readability.`,
          response_json_schema: {
            type: 'object',
            properties: {
              primary: { type: 'string', description: 'Primary color hex' },
              secondary: { type: 'string', description: 'Secondary color hex' },
              accent: { type: 'string', description: 'Accent color hex' },
              background: { type: 'string', description: 'Background color hex' },
              text: { type: 'string', description: 'Text color hex' },
              chartColors: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Array of chart/graph colors'
              }
            }
          }
        });
        return Response.json({ success: true, palette: result });
      }

      case 'suggest_layout': {
        // Suggest layout based on content type
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Suggest an infographic layout structure for the following content type: ${data.contentType || 'general'}.
          Consider visual hierarchy, spacing, and readability.
          Content categories: ${data.categories?.join(', ') || 'general information'}
          Number of data points: ${data.dataPoints || 5}`,
          response_json_schema: {
            type: 'object',
            properties: {
              layoutType: { type: 'string', description: 'e.g., timeline, comparison, hierarchical' },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    position: { type: 'string' },
                    suggestedElements: { type: 'array', items: { type: 'string' } }
                  }
                }
              },
              recommendedWidth: { type: 'number' },
              recommendedHeight: { type: 'number' },
              tips: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json({ success: true, layout: result });
      }

      case 'generate_content': {
        // Generate text content for infographic elements
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate concise, impactful text content for an infographic about: ${data.topic || 'business growth'}.
          Style: ${data.style || 'professional'}
          Tone: ${data.tone || 'informative'}
          Create headlines, subheadings, and key points.`,
          response_json_schema: {
            type: 'object',
            properties: {
              headline: { type: 'string', description: 'Main headline (max 8 words)' },
              subheadline: { type: 'string', description: 'Supporting subheadline' },
              keyPoints: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    statistic: { type: 'string' }
                  }
                }
              },
              callToAction: { type: 'string' }
            }
          }
        });
        return Response.json({ success: true, content: result });
      }

      case 'analyze_image': {
        // Analyze uploaded image for design suggestions
        if (!data.imageUrl) {
          return Response.json({ error: 'Image URL required' }, { status: 400 });
        }
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this image and provide design suggestions for incorporating it into an infographic.
          Consider color extraction, composition, and placement recommendations.`,
          file_urls: [data.imageUrl],
          response_json_schema: {
            type: 'object',
            properties: {
              dominantColors: { type: 'array', items: { type: 'string' } },
              suggestedPlacements: { type: 'array', items: { type: 'string' } },
              styleRecommendations: { type: 'array', items: { type: 'string' } },
              cropSuggestions: { type: 'string' }
            }
          }
        });
        return Response.json({ success: true, analysis: result });
      }

      default:
        return Response.json({ 
          error: 'Unknown action',
          available_actions: ['suggest_colors', 'suggest_layout', 'generate_content', 'analyze_image']
        }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});