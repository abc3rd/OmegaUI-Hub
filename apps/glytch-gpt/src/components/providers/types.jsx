/**
 * Provider Types and Interfaces
 * Standard abstraction for LLM providers (LM Studio, OpenAI, Open-WebUI, etc.)
 */

export const ProviderType = {
    LM_STUDIO: 'lm_studio',
    OPENAI: 'openai',
    OPEN_WEBUI: 'open_webui',
    BASE44: 'base44'
};

/**
 * Standard provider interface
 * All providers must implement this structure
 */
export class Provider {
    constructor(config) {
        this.config = config;
    }

    /**
     * Call the provider with a prompt
     * @param {Object} params
     * @param {string} params.model - Model identifier
     * @param {Array} params.messages - Chat messages [{role, content}]
     * @param {number} params.temperature - Temperature (0-2)
     * @param {number} params.max_tokens - Max tokens to generate
     * @param {number} params.top_p - Top-p sampling
     * @returns {Promise<{text: string, usage: Object, raw: Object, latencyMs: number}>}
     */
    async call({ model, messages, temperature = 0.7, max_tokens = 2000, top_p = 1.0 }) {
        throw new Error('Provider.call() must be implemented');
    }

    /**
     * List available models
     * @returns {Promise<Array<{id: string, name: string}>>}
     */
    async listModels() {
        throw new Error('Provider.listModels() must be implemented');
    }

    /**
     * Test provider health
     * @returns {Promise<{reachable: boolean, status: number, latencyMs: number, error: string}>}
     */
    async testHealth() {
        throw new Error('Provider.testHealth() must be implemented');
    }
}

/**
 * Provider configuration schema
 */
export const ProviderConfig = {
    lm_studio: {
        name: 'LM Studio',
        defaultBaseUrl: 'http://100.119.81.65:1234/v1',
        requiresProxy: true, // Recommended for CORS
        type: 'openai_compatible'
    },
    open_webui: {
        name: 'Open-WebUI',
        defaultBaseUrl: 'http://localhost:3000',
        requiresProxy: false,
        experimental: true,
        type: 'custom'
    },
    openai: {
        name: 'OpenAI',
        defaultBaseUrl: 'https://api.openai.com/v1',
        requiresProxy: false,
        type: 'openai_compatible'
    },
    base44: {
        name: 'Base44',
        defaultBaseUrl: null,
        requiresProxy: false,
        type: 'base44_integration'
    }
};

/**
 * Check if URL is a private/local network address
 */
export function isPrivateNetwork(url) {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        
        // Check localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
            return true;
        }
        
        // Check private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 100.64-127.x.x CGNAT)
        const parts = hostname.split('.');
        if (parts.length === 4) {
            const first = parseInt(parts[0]);
            const second = parseInt(parts[1]);
            
            if (first === 10) return true;
            if (first === 172 && second >= 16 && second <= 31) return true;
            if (first === 192 && second === 168) return true;
            if (first === 100 && second >= 64 && second <= 127) return true; // CGNAT range
            if (first === 169 && second === 254) return true; // link-local
        }
        
        return false;
    } catch {
        return false;
    }
}