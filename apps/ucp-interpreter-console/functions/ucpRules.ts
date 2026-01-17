import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { action, ruleId, ...ruleData } = body;
    
    switch (action) {
      case 'list': {
        const rules = await base44.entities.UCPRule.filter({});
        rules.sort((a, b) => a.priority - b.priority);
        return Response.json({ success: true, rules });
      }
      
      case 'get': {
        if (!ruleId) {
          return Response.json({ error: 'Rule ID required' }, { status: 400 });
        }
        const rules = await base44.entities.UCPRule.filter({ id: ruleId });
        if (rules.length === 0) {
          return Response.json({ error: 'Rule not found' }, { status: 404 });
        }
        return Response.json({ success: true, rule: rules[0] });
      }
      
      case 'create': {
        if (!ruleData.rule_name || !ruleData.rule_type) {
          return Response.json({ 
            error: 'Missing required fields: rule_name, rule_type' 
          }, { status: 400 });
        }
        
        // Check for duplicate rule name
        const existing = await base44.entities.UCPRule.filter({ 
          rule_name: ruleData.rule_name 
        });
        if (existing.length > 0) {
          return Response.json({ 
            error: 'Rule name already exists' 
          }, { status: 409 });
        }
        
        const newRule = await base44.entities.UCPRule.create({
          rule_name: ruleData.rule_name,
          rule_type: ruleData.rule_type,
          priority: ruleData.priority || 100,
          condition: ruleData.condition || {},
          action: ruleData.action || {},
          description: ruleData.description || '',
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
        
        return Response.json({ success: true, rule: newRule });
      }
      
      case 'update': {
        if (!ruleId) {
          return Response.json({ error: 'Rule ID required' }, { status: 400 });
        }
        
        const rules = await base44.entities.UCPRule.filter({ id: ruleId });
        if (rules.length === 0) {
          return Response.json({ error: 'Rule not found' }, { status: 404 });
        }
        
        const existingRule = rules[0];
        const newVersion = (existingRule.version || 1) + 1;
        
        const updateData = {
          version: newVersion,
          audit_log: [
            ...(existingRule.audit_log || []),
            {
              action: 'updated',
              by: user.email,
              at: new Date().toISOString(),
              version: newVersion,
              changes: Object.keys(ruleData).filter(k => k !== 'audit_log')
            }
          ]
        };
        
        if (ruleData.rule_name) updateData.rule_name = ruleData.rule_name;
        if (ruleData.rule_type) updateData.rule_type = ruleData.rule_type;
        if (ruleData.priority !== undefined) updateData.priority = ruleData.priority;
        if (ruleData.condition !== undefined) updateData.condition = ruleData.condition;
        if (ruleData.action !== undefined) updateData.action = ruleData.action;
        if (ruleData.description !== undefined) updateData.description = ruleData.description;
        if (ruleData.is_active !== undefined) updateData.is_active = ruleData.is_active;
        
        await base44.entities.UCPRule.update(ruleId, updateData);
        
        const updated = await base44.entities.UCPRule.filter({ id: ruleId });
        return Response.json({ success: true, rule: updated[0] });
      }
      
      case 'delete': {
        if (!ruleId) {
          return Response.json({ error: 'Rule ID required' }, { status: 400 });
        }
        
        const rules = await base44.entities.UCPRule.filter({ id: ruleId });
        if (rules.length === 0) {
          return Response.json({ error: 'Rule not found' }, { status: 404 });
        }
        
        await base44.entities.UCPRule.delete(ruleId);
        return Response.json({ success: true });
      }
      
      case 'reorder': {
        if (!ruleData.order || !Array.isArray(ruleData.order)) {
          return Response.json({ 
            error: 'Order array required' 
          }, { status: 400 });
        }
        
        // Update priorities based on order array
        for (let i = 0; i < ruleData.order.length; i++) {
          const ruleId = ruleData.order[i];
          await base44.entities.UCPRule.update(ruleId, { 
            priority: (i + 1) * 10 
          });
        }
        
        return Response.json({ success: true });
      }
      
      case 'seed': {
        // Seed default rules
        const defaultRules = [
          {
            rule_name: 'normalize_whitespace',
            rule_type: 'normalization',
            priority: 10,
            condition: { always: true },
            action: { type: 'trim_whitespace' },
            description: 'Normalize excessive whitespace in prompts'
          },
          {
            rule_name: 'detect_code_intent',
            rule_type: 'routing',
            priority: 20,
            condition: { 
              pattern: '(code|program|script|function|class|implement)',
              case_insensitive: true
            },
            action: { 
              type: 'set_intent',
              value: 'code_generation'
            },
            description: 'Route code-related prompts to code generation intent'
          },
          {
            rule_name: 'detect_json_format',
            rule_type: 'transformation',
            priority: 30,
            condition: { 
              pattern: '(json|JSON)',
              case_insensitive: true
            },
            action: { 
              type: 'add_constraint',
              constraint: { type: 'format', value: 'json' }
            },
            description: 'Add JSON format constraint when detected'
          },
          {
            rule_name: 'max_prompt_length',
            rule_type: 'validation',
            priority: 5,
            condition: { 
              check: 'prompt_length',
              max: 50000
            },
            action: { 
              type: 'reject',
              message: 'Prompt exceeds maximum length'
            },
            description: 'Reject prompts exceeding maximum length'
          },
          {
            rule_name: 'pii_warning',
            rule_type: 'safety',
            priority: 15,
            condition: { 
              pattern: '\\b\\d{3}[-.]?\\d{2}[-.]?\\d{4}\\b',
              description: 'SSN pattern'
            },
            action: { 
              type: 'add_flag',
              flag: { type: 'pii_detected', subtype: 'ssn', severity: 'high' }
            },
            description: 'Flag potential SSN in prompts'
          }
        ];
        
        const created = [];
        for (const rule of defaultRules) {
          const existing = await base44.entities.UCPRule.filter({ 
            rule_name: rule.rule_name 
          });
          
          if (existing.length === 0) {
            const newRule = await base44.entities.UCPRule.create({
              ...rule,
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
            created.push(newRule);
          }
        }
        
        return Response.json({ 
          success: true, 
          created_count: created.length,
          rules: created
        });
      }
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('UCP Rules error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});