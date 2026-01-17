import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { action, entryId, ...entryData } = body;
    
    switch (action) {
      case 'list': {
        const entries = await base44.entities.UCPDictionary.filter({});
        return Response.json({ success: true, entries });
      }
      
      case 'get': {
        if (!entryId) {
          return Response.json({ error: 'Entry ID required' }, { status: 400 });
        }
        const entries = await base44.entities.UCPDictionary.filter({ id: entryId });
        if (entries.length === 0) {
          return Response.json({ error: 'Entry not found' }, { status: 404 });
        }
        return Response.json({ success: true, entry: entries[0] });
      }
      
      case 'create': {
        if (!entryData.command_name || !entryData.category) {
          return Response.json({ 
            error: 'Missing required fields: command_name, category' 
          }, { status: 400 });
        }
        
        // Check for duplicate command name
        const existing = await base44.entities.UCPDictionary.filter({ 
          command_name: entryData.command_name 
        });
        if (existing.length > 0) {
          return Response.json({ 
            error: 'Command name already exists' 
          }, { status: 409 });
        }
        
        const newEntry = await base44.entities.UCPDictionary.create({
          command_name: entryData.command_name,
          category: entryData.category,
          schema: entryData.schema || {},
          validation_rules: entryData.validation_rules || [],
          description: entryData.description || '',
          examples: entryData.examples || [],
          version: 1,
          is_active: true,
          created_by: user.email,
          audit_log: [{
            action: 'created',
            by: user.email,
            at: new Date().toISOString(),
            version: 1
          }]
        });
        
        return Response.json({ success: true, entry: newEntry });
      }
      
      case 'update': {
        if (!entryId) {
          return Response.json({ error: 'Entry ID required' }, { status: 400 });
        }
        
        const entries = await base44.entities.UCPDictionary.filter({ id: entryId });
        if (entries.length === 0) {
          return Response.json({ error: 'Entry not found' }, { status: 404 });
        }
        
        const existingEntry = entries[0];
        const newVersion = (existingEntry.version || 1) + 1;
        
        const updateData = {
          version: newVersion,
          audit_log: [
            ...(existingEntry.audit_log || []),
            {
              action: 'updated',
              by: user.email,
              at: new Date().toISOString(),
              version: newVersion,
              changes: Object.keys(entryData).filter(k => k !== 'audit_log')
            }
          ]
        };
        
        if (entryData.command_name) updateData.command_name = entryData.command_name;
        if (entryData.category) updateData.category = entryData.category;
        if (entryData.schema !== undefined) updateData.schema = entryData.schema;
        if (entryData.validation_rules !== undefined) updateData.validation_rules = entryData.validation_rules;
        if (entryData.description !== undefined) updateData.description = entryData.description;
        if (entryData.examples !== undefined) updateData.examples = entryData.examples;
        if (entryData.is_active !== undefined) updateData.is_active = entryData.is_active;
        
        await base44.entities.UCPDictionary.update(entryId, updateData);
        
        const updated = await base44.entities.UCPDictionary.filter({ id: entryId });
        return Response.json({ success: true, entry: updated[0] });
      }
      
      case 'delete': {
        if (!entryId) {
          return Response.json({ error: 'Entry ID required' }, { status: 400 });
        }
        
        const entries = await base44.entities.UCPDictionary.filter({ id: entryId });
        if (entries.length === 0) {
          return Response.json({ error: 'Entry not found' }, { status: 404 });
        }
        
        await base44.entities.UCPDictionary.delete(entryId);
        return Response.json({ success: true });
      }
      
      case 'rollback': {
        if (!entryId || !entryData.targetVersion) {
          return Response.json({ 
            error: 'Entry ID and target version required' 
          }, { status: 400 });
        }
        
        // Note: In a full implementation, you would store version snapshots
        // For now, we just record the rollback in audit log
        const entries = await base44.entities.UCPDictionary.filter({ id: entryId });
        if (entries.length === 0) {
          return Response.json({ error: 'Entry not found' }, { status: 404 });
        }
        
        const existingEntry = entries[0];
        const newVersion = (existingEntry.version || 1) + 1;
        
        await base44.entities.UCPDictionary.update(entryId, {
          version: newVersion,
          audit_log: [
            ...(existingEntry.audit_log || []),
            {
              action: 'rollback_attempted',
              by: user.email,
              at: new Date().toISOString(),
              version: newVersion,
              target_version: entryData.targetVersion,
              note: 'Full rollback requires version snapshots'
            }
          ]
        });
        
        return Response.json({ 
          success: true, 
          message: 'Rollback recorded in audit log' 
        });
      }
      
      case 'seed': {
        // Seed default dictionary entries
        const defaultEntries = [
          {
            command_name: 'intent.code_generation',
            category: 'intent',
            schema: {
              type: 'object',
              properties: {
                language: { type: 'string' },
                framework: { type: 'string' },
                complexity: { type: 'string', enum: ['simple', 'moderate', 'complex'] }
              }
            },
            validation_rules: [
              { rule: 'require_language_if_code', condition: 'intent.type === "code_generation"' }
            ],
            description: 'Intent for code generation tasks',
            examples: ['Write a Python function', 'Create a React component']
          },
          {
            command_name: 'intent.explanation',
            category: 'intent',
            schema: {
              type: 'object',
              properties: {
                depth: { type: 'string', enum: ['brief', 'detailed', 'comprehensive'] },
                audience: { type: 'string', enum: ['beginner', 'intermediate', 'expert'] }
              }
            },
            description: 'Intent for explanation tasks',
            examples: ['Explain quantum computing', 'What is machine learning']
          },
          {
            command_name: 'constraint.format.json',
            category: 'constraint',
            schema: {
              type: 'object',
              properties: {
                schema: { type: 'object' },
                strict: { type: 'boolean' }
              }
            },
            description: 'Constraint for JSON output format',
            examples: ['Output as JSON', 'Return JSON format']
          },
          {
            command_name: 'constraint.format.markdown',
            category: 'constraint',
            schema: {
              type: 'object',
              properties: {
                include_toc: { type: 'boolean' },
                heading_level: { type: 'integer', minimum: 1, maximum: 6 }
              }
            },
            description: 'Constraint for Markdown output format',
            examples: ['Format as markdown', 'Use markdown']
          },
          {
            command_name: 'safety.pii_detection',
            category: 'safety',
            schema: {
              type: 'object',
              properties: {
                detected_types: { type: 'array', items: { type: 'string' } },
                severity: { type: 'string', enum: ['low', 'medium', 'high'] }
              }
            },
            description: 'Safety flag for PII detection',
            examples: []
          },
          {
            command_name: 'tool.code_interpreter',
            category: 'tool',
            schema: {
              type: 'object',
              properties: {
                languages: { type: 'array', items: { type: 'string' } },
                sandbox: { type: 'boolean' }
              }
            },
            description: 'Tool for code interpretation and execution',
            examples: ['Run this code', 'Execute the script']
          },
          {
            command_name: 'execution.sequential',
            category: 'execution',
            schema: {
              type: 'object',
              properties: {
                steps: { type: 'array', items: { type: 'object' } },
                retry_on_failure: { type: 'boolean' }
              }
            },
            description: 'Sequential execution plan',
            examples: []
          },
          {
            command_name: 'fallback.retry',
            category: 'fallback',
            schema: {
              type: 'object',
              properties: {
                max_retries: { type: 'integer' },
                backoff_ms: { type: 'integer' }
              }
            },
            description: 'Fallback strategy with retry',
            examples: []
          }
        ];
        
        const created = [];
        for (const entry of defaultEntries) {
          const existing = await base44.entities.UCPDictionary.filter({ 
            command_name: entry.command_name 
          });
          
          if (existing.length === 0) {
            const newEntry = await base44.entities.UCPDictionary.create({
              ...entry,
              version: 1,
              is_active: true,
              created_by: user.email,
              audit_log: [{
                action: 'seeded',
                by: user.email,
                at: new Date().toISOString(),
                version: 1
              }]
            });
            created.push(newEntry);
          }
        }
        
        return Response.json({ 
          success: true, 
          created_count: created.length,
          entries: created
        });
      }
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('UCP Dictionary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});