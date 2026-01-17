/**
 * Network Utility Functions
 */

/**
 * Check if URL is a private/local network address
 * Includes RFC1918 ranges and CGNAT (100.64.0.0/10)
 */
export function isPrivateIp(url) {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        
        // Check localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
            return true;
        }
        
        // Check private IPv4 ranges
        const parts = hostname.split('.');
        if (parts.length === 4) {
            const first = parseInt(parts[0]);
            const second = parseInt(parts[1]);
            
            // 10.0.0.0/8
            if (first === 10) return true;
            
            // 172.16.0.0/12
            if (first === 172 && second >= 16 && second <= 31) return true;
            
            // 192.168.0.0/16
            if (first === 192 && second === 168) return true;
            
            // 100.64.0.0/10 (CGNAT range)
            if (first === 100 && second >= 64 && second <= 127) return true;
            
            // 169.254.0.0/16 (link-local)
            if (first === 169 && second === 254) return true;
        }
        
        return false;
    } catch {
        return false;
    }
}

/**
 * Detect if error is likely a CORS issue
 */
export function isCorsError(error) {
    if (!error) return false;
    
    const errorMsg = error.message?.toLowerCase() || '';
    const errorName = error.name?.toLowerCase() || '';
    
    // Common CORS error patterns
    if (errorMsg.includes('cors')) return true;
    if (errorMsg.includes('failed to fetch')) return true;
    if (errorMsg.includes('network request failed')) return true;
    if (errorName === 'typeerror' && errorMsg.includes('fetch')) return true;
    
    return false;
}

/**
 * Get connectivity mode description
 */
export function getConnectivityMode(baseUrl, useProxy) {
    const isPrivate = isPrivateIp(baseUrl);
    
    if (isPrivate) {
        return {
            mode: 'direct',
            label: 'Direct (LAN)',
            description: 'Browser connects directly to LM Studio on local network',
            canUseProxy: false,
            warning: 'Server proxy cannot reach private IPs'
        };
    }
    
    if (useProxy) {
        return {
            mode: 'proxy',
            label: 'Server Proxy',
            description: 'Browser → Base44 Cloud → LM Studio',
            canUseProxy: true
        };
    }
    
    return {
        mode: 'direct',
        label: 'Direct (Public)',
        description: 'Browser connects directly to public endpoint',
        canUseProxy: true
    };
}