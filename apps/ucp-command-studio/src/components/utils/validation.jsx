/**
 * Validation and Normalization Utilities for UCP
 * Ensures all payloads satisfy schema requirements
 */

export function normalizeObject(value, fallbackKey = "data") {
  // Already a valid object (not null, not array)
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  // Null or undefined
  if (value === null || value === undefined) {
    return {};
  }

  // String that looks like JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return normalizeObject(parsed, fallbackKey);
    } catch {
      return { [fallbackKey]: value };
    }
  }

  // Array - wrap it
  if (Array.isArray(value)) {
    return { items: value };
  }

  // Boolean, number, or other primitive
  return { [fallbackKey]: value };
}

export function normalizeParams(params) {
  return normalizeObject(params, "value");
}

export function normalizeResult(result) {
  return normalizeObject(result, "message");
}

export function validateRequiredFields(obj, requiredFields) {
  const missing = requiredFields.filter(field => !obj || !obj[field]);
  return {
    valid: missing.length === 0,
    missing
  };
}

export function safeJsonParse(str, fallback = {}) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}