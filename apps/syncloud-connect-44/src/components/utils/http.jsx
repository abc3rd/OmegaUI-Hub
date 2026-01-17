/**
 * Safe HTTP utilities with timeout and error handling
 * For Base44 applications
 */

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Create an AbortController with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {{ signal: AbortSignal, cleanup: () => void }}
 */
function createTimeoutSignal(timeoutMs = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId)
  };
}

/**
 * Safe JSON fetch with timeout and standardized error handling
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<{ ok: boolean, status: number, data: any, error: string | null }>}
 */
export async function safeJsonFetch(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const { signal, cleanup } = createTimeoutSignal(timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    cleanup();

    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If error response is not JSON, use status text
      }

      return {
        ok: false,
        status: response.status,
        data: null,
        error: errorMessage
      };
    }

    // Parse successful response
    const data = await response.json();

    return {
      ok: true,
      status: response.status,
      data,
      error: null
    };

  } catch (error) {
    cleanup();

    // Handle specific error types
    if (error.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        data: null,
        error: 'Request timeout'
      };
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: 'Network error - please check your connection'
      };
    }

    return {
      ok: false,
      status: 0,
      data: null,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Safe fetch for non-JSON responses
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<{ ok: boolean, status: number, data: Response | null, error: string | null }>}
 */
export async function safeFetch(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const { signal, cleanup } = createTimeoutSignal(timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal
    });

    cleanup();

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return {
      ok: true,
      status: response.status,
      data: response,
      error: null
    };

  } catch (error) {
    cleanup();

    if (error.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        data: null,
        error: 'Request timeout'
      };
    }

    return {
      ok: false,
      status: 0,
      data: null,
      error: error.message || 'An unexpected error occurred'
    };
  }
}