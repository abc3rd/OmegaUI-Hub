import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Webhook handler for external integrations
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const token = url.searchParams.get('token');
    
    // Validate webhook token for security
    const expectedToken = Deno.env.get('WEBHOOK_SECRET');
    if (expectedToken && token !== expectedToken) {
      return Response.json({ error: 'Invalid webhook token' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    switch (action) {
      case 'create_project': {
        // External service wants to create a project
        const base44 = createClientFromRequest(req);
        const project = await base44.asServiceRole.entities.Project.create({
          name: body.name || 'Imported Project',
          description: body.description,
          canvas_width: body.width || 800,
          canvas_height: body.height || 1200,
          background_color: body.background_color || '#ffffff',
          canvas_data: body.canvas_data || { elements: [] },
          status: 'draft',
          tags: body.tags || [],
        });
        return Response.json({ success: true, project_id: project.id });
      }

      case 'get_project': {
        const base44 = createClientFromRequest(req);
        const projects = await base44.asServiceRole.entities.Project.filter({ id: body.project_id });
        if (!projects[0]) {
          return Response.json({ error: 'Project not found' }, { status: 404 });
        }
        return Response.json({ success: true, project: projects[0] });
      }

      case 'update_project': {
        const base44 = createClientFromRequest(req);
        await base44.asServiceRole.entities.Project.update(body.project_id, body.updates);
        return Response.json({ success: true });
      }

      case 'list_templates': {
        const base44 = createClientFromRequest(req);
        const templates = await base44.asServiceRole.entities.Template.list();
        return Response.json({ success: true, templates });
      }

      case 'create_from_template': {
        const base44 = createClientFromRequest(req);
        const templates = await base44.asServiceRole.entities.Template.filter({ id: body.template_id });
        const template = templates[0];
        
        if (!template) {
          return Response.json({ error: 'Template not found' }, { status: 404 });
        }
        
        const project = await base44.asServiceRole.entities.Project.create({
          name: body.name || `${template.name} - Copy`,
          description: body.description,
          canvas_width: template.canvas_width,
          canvas_height: template.canvas_height,
          background_color: template.background_color,
          canvas_data: template.canvas_data,
          template_id: template.id,
          status: 'draft',
        });
        
        return Response.json({ success: true, project_id: project.id });
      }

      default:
        return Response.json({ 
          error: 'Unknown action',
          available_actions: ['create_project', 'get_project', 'update_project', 'list_templates', 'create_from_template']
        }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});