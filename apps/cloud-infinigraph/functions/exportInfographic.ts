import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, format } = await req.json();
    
    if (!projectId) {
      return Response.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get project data
    const projects = await base44.entities.Project.filter({ id: projectId });
    const project = projects[0];
    
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // For SVG export, generate SVG from canvas data
    if (format === 'svg') {
      const svgContent = generateSVG(project);
      return new Response(svgContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="${project.name || 'infographic'}.svg"`,
        },
      });
    }

    // For other formats, return the canvas data for client-side rendering
    return Response.json({
      success: true,
      project: {
        name: project.name,
        canvas_width: project.canvas_width,
        canvas_height: project.canvas_height,
        background_color: project.background_color,
        canvas_data: project.canvas_data,
      },
      format,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateSVG(project) {
  const { canvas_width = 800, canvas_height = 1200, background_color = '#ffffff', canvas_data } = project;
  const elements = canvas_data?.elements || [];

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas_width}" height="${canvas_height}" viewBox="0 0 ${canvas_width} ${canvas_height}">`;
  
  // Background
  svgContent += `<rect width="100%" height="100%" fill="${background_color}"/>`;
  
  // Sort elements by zIndex
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  
  for (const element of sortedElements) {
    if (element.hidden) continue;
    
    switch (element.type) {
      case 'text':
        svgContent += `<text 
          x="${element.x}" 
          y="${element.y + (element.fontSize || 16)}" 
          font-family="${element.fontFamily || 'Inter'}" 
          font-size="${element.fontSize || 16}" 
          font-weight="${element.fontWeight || 400}" 
          fill="${element.color || '#000000'}"
          transform="rotate(${element.rotation || 0} ${element.x} ${element.y})"
        >${escapeXml(element.content || '')}</text>`;
        break;
        
      case 'shape':
        if (element.shape === 'rectangle') {
          svgContent += `<rect 
            x="${element.x}" 
            y="${element.y}" 
            width="${element.width || 100}" 
            height="${element.height || 100}" 
            fill="${element.fill || '#3b82f6}" 
            rx="${element.borderRadius || 0}"
            opacity="${element.opacity || 1}"
            ${element.strokeWidth ? `stroke="${element.stroke || '#000'}" stroke-width="${element.strokeWidth}"` : ''}
            transform="rotate(${element.rotation || 0} ${element.x + (element.width || 100)/2} ${element.y + (element.height || 100)/2})"
          />`;
        } else if (element.shape === 'circle') {
          const cx = element.x + (element.width || 100) / 2;
          const cy = element.y + (element.height || 100) / 2;
          const r = Math.min(element.width || 100, element.height || 100) / 2;
          svgContent += `<circle 
            cx="${cx}" 
            cy="${cy}" 
            r="${r}" 
            fill="${element.fill || '#3b82f6}"
            opacity="${element.opacity || 1}"
            ${element.strokeWidth ? `stroke="${element.stroke || '#000'}" stroke-width="${element.strokeWidth}"` : ''}
          />`;
        } else if (element.shape === 'line') {
          svgContent += `<line 
            x1="${element.x}" 
            y1="${element.y}" 
            x2="${element.x + (element.width || 200)}" 
            y2="${element.y}" 
            stroke="${element.stroke || '#000000}" 
            stroke-width="${element.strokeWidth || 2}"
            transform="rotate(${element.rotation || 0} ${element.x} ${element.y})"
          />`;
        }
        break;
        
      case 'icon':
        if (element.svgContent) {
          svgContent += `<g transform="translate(${element.x}, ${element.y}) rotate(${element.rotation || 0}) scale(${(element.width || 48) / 24})" fill="none" stroke="${element.color || '#000000'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${extractSvgPaths(element.svgContent)}
          </g>`;
        }
        break;
        
      case 'image':
        svgContent += `<image 
          href="${element.src}" 
          x="${element.x}" 
          y="${element.y}" 
          width="${element.width || 200}" 
          height="${element.height || 200}"
          preserveAspectRatio="xMidYMid slice"
          transform="rotate(${element.rotation || 0} ${element.x + (element.width || 200)/2} ${element.y + (element.height || 200)/2})"
        />`;
        break;
    }
  }
  
  svgContent += '</svg>';
  return svgContent;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractSvgPaths(svgContent) {
  // Extract the inner content from SVG tags
  const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return match ? match[1] : '';
}