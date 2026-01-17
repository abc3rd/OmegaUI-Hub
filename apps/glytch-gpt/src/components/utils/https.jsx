/**
 * HTTPS/Mixed Content Detection
 */

/**
 * Check if current page is HTTPS
 */
export function isHttpsContext() {
    if (typeof window === 'undefined') return false;
    return window.location.protocol === 'https:';
}

/**
 * Check if URL is HTTP
 */
export function isHttpUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:';
    } catch {
        return false;
    }
}

/**
 * Check for mixed-content issue
 * Returns { hasMixedContent, message }
 */
export function checkMixedContent(url) {
    const isHttps = isHttpsContext();
    const isHttp = isHttpUrl(url);

    if (isHttps && isHttp) {
        return {
            hasMixedContent: true,
            message: 'This site is HTTPS. Browsers block HTTP calls to local servers. ' +
                    'Provide an HTTPS endpoint (Cloudflare Tunnel/reverse proxy) or run locally over HTTP.'
        };
    }

    return {
        hasMixedContent: false,
        message: null
    };
}

/**
 * Get effective URL based on HTTPS context
 * If HTTPS site and HTTP URL with HTTPS override, use HTTPS URL
 */
export function getEffectiveUrl(httpUrl, httpsUrl) {
    const mixed = checkMixedContent(httpUrl);

    if (mixed.hasMixedContent && httpsUrl) {
        return httpsUrl;
    }

    if (mixed.hasMixedContent && !httpsUrl) {
        return null; // Unavailable
    }

    return httpUrl;
}