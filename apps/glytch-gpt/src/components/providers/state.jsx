/**
 * Provider State and Configuration
 */

import { isHttpsContext, checkMixedContent } from '@/components/utils/https';

export const PROVIDER_TYPES = {
    OPENAI: 'openai',
    OPENROUTER: 'openrouter',
    LM_STUDIO: 'lm_studio'
};

export const PROVIDER_CONFIG = {
    openai: {
        name: 'OpenAI',
        description: 'GPT-4o and other OpenAI models',
        type: 'cloud',
        requiresApiKey: true,
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
    },
    openrouter: {
        name: 'OpenRouter',
        description: 'Multi-model aggregator (OpenAI only on this deployment)',
        type: 'cloud',
        requiresApiKey: true,
        models: ['openai/gpt-4o', 'openai/gpt-4o-mini']
    },
    lm_studio: {
        name: 'LM Studio (Granite)',
        description: 'Local LAN/VPN mode',
        type: 'local',
        requiresApiKey: false,
        models: ['granite', 'other-local-models']
    }
};

/**
 * Determine provider availability
 */
export function getProviderAvailability(provider, config) {
    const providerConfig = PROVIDER_CONFIG[provider];
    
    if (!providerConfig) {
        return {
            available: false,
            reason: 'Unknown provider'
        };
    }

    // Check cloud providers
    if (providerConfig.type === 'cloud') {
        if (providerConfig.requiresApiKey && !config?.apiKey) {
            return {
                available: false,
                reason: 'API key missing'
            };
        }
        return { available: true, reason: null };
    }

    // Check local providers (LM Studio)
    if (providerConfig.type === 'local') {
        if (!config?.enabled) {
            return {
                available: false,
                reason: 'Disabled'
            };
        }

        // Check HTTPS mixed-content
        const httpUrl = config.baseUrl;
        const httpsUrl = config.httpsBaseUrl;
        
        if (isHttpsContext()) {
            const mixed = checkMixedContent(httpUrl);
            if (mixed.hasMixedContent && !httpsUrl) {
                return {
                    available: false,
                    reason: 'HTTPS required (provide HTTPS endpoint or run locally)'
                };
            }

            if (mixed.hasMixedContent && httpsUrl && !config.allowHttpsFromHttps) {
                return {
                    available: false,
                    reason: 'HTTPS-only site cannot access HTTP endpoint'
                };
            }
        }

        return { available: true, reason: null };
    }

    return { available: false, reason: 'Unknown provider type' };
}

/**
 * Get available models for a provider
 */
export function getAvailableModels(provider) {
    const config = PROVIDER_CONFIG[provider];
    return config?.models || [];
}