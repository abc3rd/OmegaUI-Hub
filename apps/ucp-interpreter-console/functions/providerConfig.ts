import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple encryption for API keys (base64 for demo - use proper encryption in production)
function encryptApiKey(key) {
  if (!key) return null;
  return btoa(key);
}

// Mask API key for display
function maskApiKey(encrypted) {
  if (!encrypted) return null;
  try {
    const decrypted = atob(encrypted);
    if (decrypted.length <= 8) return '****';
    return decrypted.substring(0, 4) + '****' + decrypted.substring(decrypted.length - 4);
  } catch {
    return '****';
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const body = req.method !== 'GET' ? await req.json() : {};
    const { action, configId, ...configData } = body;
    
    switch (action) {
      case 'list': {
        const configs = await base44.entities.ProviderConfig.filter({ user_id: user.id });
        return Response.json({
          success: true,
          configs: configs.map(c => ({
            ...c,
            api_key_encrypted: undefined,
            api_key_masked: maskApiKey(c.api_key_encrypted),
            has_api_key: !!c.api_key_encrypted
          }))
        });
      }
      
      case 'create': {
        // Validate required fields
        if (!configData.name || !configData.provider_type || !configData.base_url) {
          return Response.json({ 
            error: 'Missing required fields: name, provider_type, base_url' 
          }, { status: 400 });
        }
        
        // Validate provider type
        if (!['OPENAI_COMPAT', 'LM_STUDIO'].includes(configData.provider_type)) {
          return Response.json({ 
            error: 'Invalid provider_type. Must be OPENAI_COMPAT or LM_STUDIO' 
          }, { status: 400 });
        }
        
        // Validate URL format
        try {
          new URL(configData.base_url);
        } catch {
          return Response.json({ error: 'Invalid base_url format' }, { status: 400 });
        }
        
        // If this is set as default, unset other defaults
        if (configData.is_default) {
          const existingConfigs = await base44.entities.ProviderConfig.filter({ 
            user_id: user.id, 
            is_default: true 
          });
          for (const c of existingConfigs) {
            await base44.entities.ProviderConfig.update(c.id, { is_default: false });
          }
        }
        
        const newConfig = await base44.entities.ProviderConfig.create({
          user_id: user.id,
          name: configData.name,
          provider_type: configData.provider_type,
          base_url: configData.base_url,
          api_key_encrypted: encryptApiKey(configData.api_key),
          default_model: configData.default_model || 'gpt-3.5-turbo',
          context_window: configData.context_window || 4096,
          max_tokens_default: configData.max_tokens_default || 1024,
          cost_per_1k_input: configData.cost_per_1k_input || 0,
          cost_per_1k_output: configData.cost_per_1k_output || 0,
          is_active: true,
          is_default: configData.is_default || false
        });
        
        return Response.json({
          success: true,
          config: {
            ...newConfig,
            api_key_encrypted: undefined,
            api_key_masked: maskApiKey(newConfig.api_key_encrypted),
            has_api_key: !!newConfig.api_key_encrypted
          }
        });
      }
      
      case 'update': {
        if (!configId) {
          return Response.json({ error: 'Config ID required' }, { status: 400 });
        }
        
        const configs = await base44.entities.ProviderConfig.filter({ id: configId });
        if (configs.length === 0) {
          return Response.json({ error: 'Config not found' }, { status: 404 });
        }
        
        if (configs[0].user_id !== user.id) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const updateData = {};
        
        if (configData.name) updateData.name = configData.name;
        if (configData.provider_type) updateData.provider_type = configData.provider_type;
        if (configData.base_url) {
          try {
            new URL(configData.base_url);
            updateData.base_url = configData.base_url;
          } catch {
            return Response.json({ error: 'Invalid base_url format' }, { status: 400 });
          }
        }
        if (configData.api_key) {
          updateData.api_key_encrypted = encryptApiKey(configData.api_key);
        }
        if (configData.default_model) updateData.default_model = configData.default_model;
        if (configData.context_window !== undefined) updateData.context_window = configData.context_window;
        if (configData.max_tokens_default !== undefined) updateData.max_tokens_default = configData.max_tokens_default;
        if (configData.cost_per_1k_input !== undefined) updateData.cost_per_1k_input = configData.cost_per_1k_input;
        if (configData.cost_per_1k_output !== undefined) updateData.cost_per_1k_output = configData.cost_per_1k_output;
        if (configData.is_active !== undefined) updateData.is_active = configData.is_active;
        
        // Handle default flag
        if (configData.is_default) {
          const existingConfigs = await base44.entities.ProviderConfig.filter({ 
            user_id: user.id, 
            is_default: true 
          });
          for (const c of existingConfigs) {
            if (c.id !== configId) {
              await base44.entities.ProviderConfig.update(c.id, { is_default: false });
            }
          }
          updateData.is_default = true;
        }
        
        await base44.entities.ProviderConfig.update(configId, updateData);
        
        const updated = await base44.entities.ProviderConfig.filter({ id: configId });
        
        return Response.json({
          success: true,
          config: {
            ...updated[0],
            api_key_encrypted: undefined,
            api_key_masked: maskApiKey(updated[0].api_key_encrypted),
            has_api_key: !!updated[0].api_key_encrypted
          }
        });
      }
      
      case 'delete': {
        if (!configId) {
          return Response.json({ error: 'Config ID required' }, { status: 400 });
        }
        
        const configs = await base44.entities.ProviderConfig.filter({ id: configId });
        if (configs.length === 0) {
          return Response.json({ error: 'Config not found' }, { status: 404 });
        }
        
        if (configs[0].user_id !== user.id) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        await base44.entities.ProviderConfig.delete(configId);
        
        return Response.json({ success: true });
      }
      
      case 'test': {
        if (!configId) {
          return Response.json({ error: 'Config ID required' }, { status: 400 });
        }
        
        const configs = await base44.entities.ProviderConfig.filter({ id: configId });
        if (configs.length === 0) {
          return Response.json({ error: 'Config not found' }, { status: 404 });
        }
        
        const config = configs[0];
        if (config.user_id !== user.id) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        // Test connection
        try {
          const apiKey = config.api_key_encrypted ? atob(config.api_key_encrypted) : null;
          let baseUrl = config.base_url;
          if (!baseUrl.endsWith('/')) baseUrl += '/';
          if (!baseUrl.includes('/v1/')) baseUrl += 'v1/';
          
          const headers = { 'Content-Type': 'application/json' };
          if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
          
          const startTime = Date.now();
          const response = await fetch(baseUrl + 'models', {
            method: 'GET',
            headers
          });
          const latency = Date.now() - startTime;
          
          if (response.ok) {
            const data = await response.json();
            return Response.json({
              success: true,
              test_result: {
                connected: true,
                latency_ms: latency,
                models_available: data.data?.length || 0
              }
            });
          } else {
            return Response.json({
              success: false,
              test_result: {
                connected: false,
                error: `HTTP ${response.status}: ${response.statusText}`
              }
            });
          }
        } catch (error) {
          return Response.json({
            success: false,
            test_result: {
              connected: false,
              error: error.message
            }
          });
        }
      }
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Provider config error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});