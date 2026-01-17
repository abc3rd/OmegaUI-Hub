/**
 * Provider Manager
 * Central access point for all LLM providers
 */

import { ProviderType, ProviderConfig, isPrivateNetwork } from './types';

export { ProviderType, ProviderConfig, isPrivateNetwork };

/**
 * Provider Settings (persisted in localStorage)
 */
export class ProviderSettings {
    static STORAGE_KEY = 'glytch_provider_settings';
    
    static getDefaults() {
        return {
            lmStudio: {
                enabled: true,
                baseUrl: 'http://100.119.81.65:1234/v1',
                useProxy: true
            },
            openWebui: {
                enabled: false,
                baseUrl: 'http://localhost:3000',
                useProxy: false
            },
            useServerProxy: true
        };
    }
    
    static load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return { ...this.getDefaults(), ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Failed to load provider settings:', error);
        }
        return this.getDefaults();
    }
    
    static save(settings) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save provider settings:', error);
            return false;
        }
    }
}

/**
 * Direct fetch to LM Studio (no proxy)
 */
async function directFetch(baseUrl, path, method = 'GET', body = null) {
    const url = `${baseUrl}${path}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

/**
 * Get diagnostics for all providers
 */
export async function getDiagnostics(proxyFn = null) {
    const settings = ProviderSettings.load();
    const diagnostics = {
        timestamp: new Date().toISOString(),
        settings,
        providers: {}
    };
    
    // Test LM Studio
    if (settings.lmStudio.enabled) {
        const isPrivate = isPrivateNetwork(settings.lmStudio.baseUrl);
        const useProxy = settings.useServerProxy && !isPrivate;
        
        try {
            const startTime = Date.now();
            let response;
            let data;
            
            if (useProxy && proxyFn) {
                // Use proxy for public endpoints
                response = await proxyFn({
                    baseUrl: settings.lmStudio.baseUrl,
                    path: '/models',
                    method: 'GET'
                });
                data = response.data?.data || response.data?.models || [];
            } else {
                // Direct fetch for private IPs
                data = await directFetch(settings.lmStudio.baseUrl, '/models');
                data = data.data || data.models || [];
            }
            
            const latencyMs = Date.now() - startTime;
            
            diagnostics.providers.lmStudio = {
                reachable: true,
                status: 200,
                latencyMs,
                modelsCount: data.length,
                baseUrl: settings.lmStudio.baseUrl,
                privateIpDetected: isPrivate,
                proxyDisabledReason: isPrivate ? 'Private IP - proxy cannot reach' : null,
                directFetchStatus: !useProxy ? 'success' : null,
                corsLikely: false
            };
        } catch (error) {
            const corsLikely = error.name === 'TypeError' && error.message.includes('fetch');
            
            diagnostics.providers.lmStudio = {
                reachable: false,
                error: error.message,
                baseUrl: settings.lmStudio.baseUrl,
                privateIpDetected: isPrivate,
                proxyDisabledReason: isPrivate ? 'Private IP - proxy cannot reach' : null,
                directFetchStatus: 'failed',
                corsLikely
            };
        }
    }
    
    return diagnostics;
}

/**
 * List LM Studio models
 */
export async function listLMStudioModels(proxyFn) {
    const settings = ProviderSettings.load();
    const isPrivate = isPrivateNetwork(settings.lmStudio.baseUrl);
    const useProxy = settings.useServerProxy && !isPrivate;
    
    try {
        let data;
        
        if (useProxy && proxyFn) {
            const response = await proxyFn({
                baseUrl: settings.lmStudio.baseUrl,
                path: '/models',
                method: 'GET'
            });
            data = response.data?.data || response.data?.models || [];
        } else {
            // Direct fetch for private IPs
            const response = await directFetch(settings.lmStudio.baseUrl, '/models');
            data = response.data || response.models || [];
        }
        
        return data.map(m => ({
            id: m.id || m.name,
            name: m.id || m.name,
            owned_by: m.owned_by
        }));
    } catch (error) {
        console.error('Failed to list LM Studio models:', error);
        return [];
    }
}