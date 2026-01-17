/**
 * Environment variable validation and safe access utilities
 * For Base44 applications
 */

const REQUIRED_ENV_KEYS = [
  // Add required environment variables here
  // Example: 'VITE_API_URL'
];

/**
 * Safely get an environment variable value
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} The environment variable value or default
 */
export function getEnv(key, defaultValue = '') {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
}

/**
 * Validate required environment variables
 * @param {string[]} requiredKeys - Array of required env keys
 * @returns {{ ok: boolean, missing: string[], values: Record<string, string> }}
 */
export function validateEnv(requiredKeys = REQUIRED_ENV_KEYS) {
  const missing = [];
  const values = {};

  for (const key of requiredKeys) {
    const value = getEnv(key);
    if (!value) {
      missing.push(key);
    } else {
      values[key] = value;
    }
  }

  return {
    ok: missing.length === 0,
    missing,
    values
  };
}

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return getEnv('MODE') === 'development' || getEnv('DEV') === 'true';
}

/**
 * Check if running in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return getEnv('MODE') === 'production' || getEnv('PROD') === 'true';
}