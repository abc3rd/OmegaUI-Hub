// UCP Execution Engine - Core logic for packet validation, template resolution, and execution
// Extended with conditionals, loops, and parallel execution

import { KvRepo } from './UCPDatabase';

// Token tracking for LLM calls
export class TokenTracker {
  constructor() {
    this.inputTokens = 0;
    this.outputTokens = 0;
    this.calls = [];
    this.savedTokens = 0;
    this.baselineTokens = 0;
  }

  addCall(input, output, saved = 0) {
    this.inputTokens += input;
    this.outputTokens += output;
    this.savedTokens += saved;
    this.calls.push({ input, output, saved, timestamp: Date.now() });
  }

  setBaseline(tokens) {
    this.baselineTokens = tokens;
  }

  getTotalTokens() {
    return this.inputTokens + this.outputTokens;
  }

  getStats() {
    return {
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      totalTokens: this.getTotalTokens(),
      savedTokens: this.savedTokens,
      baselineTokens: this.baselineTokens,
      efficiency: this.baselineTokens > 0 
        ? Math.round((1 - this.getTotalTokens() / this.baselineTokens) * 100)
        : 0,
      calls: this.calls.length
    };
  }
}

// Stable JSON stringify for consistent hashing
export const stableStringify = (obj) => {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`);
  return '{' + pairs.join(',') + '}';
};

// SHA-256 hashing using Web Crypto API
export const sha256Hash = async (data) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Validate packet structure
export const validatePacket = (packet) => {
  const errors = [];

  if (!packet.ucp_version) {
    errors.push('Missing required field: ucp_version');
  }

  if (!packet.id) {
    errors.push('Missing required field: id');
  }

  if (!packet.ops || !Array.isArray(packet.ops) || packet.ops.length === 0) {
    errors.push('Missing or empty ops array');
  } else {
    const validateOps = (ops, path = 'ops') => {
      ops.forEach((op, index) => {
        const opPath = `${path}[${index}]`;
        
        // Check for control flow ops
        if (op.type === 'conditional' || op.type === 'if') {
          if (!op.condition) {
            errors.push(`${opPath}: conditional op missing 'condition' field`);
          }
          if (!op.then || !Array.isArray(op.then)) {
            errors.push(`${opPath}: conditional op missing 'then' array`);
          } else {
            validateOps(op.then, `${opPath}.then`);
          }
          if (op.else && Array.isArray(op.else)) {
            validateOps(op.else, `${opPath}.else`);
          }
        } else if (op.type === 'loop' || op.type === 'foreach') {
          if (!op.items && !op.count) {
            errors.push(`${opPath}: loop op requires 'items' array or 'count' number`);
          }
          if (!op.ops || !Array.isArray(op.ops)) {
            errors.push(`${opPath}: loop op missing 'ops' array`);
          } else {
            validateOps(op.ops, `${opPath}.ops`);
          }
        } else if (op.type === 'parallel') {
          if (!op.ops || !Array.isArray(op.ops)) {
            errors.push(`${opPath}: parallel op missing 'ops' array`);
          } else {
            validateOps(op.ops, `${opPath}.ops`);
          }
        } else if (op.type === 'try') {
          if (!op.ops || !Array.isArray(op.ops)) {
            errors.push(`${opPath}: try op missing 'ops' array`);
          } else {
            validateOps(op.ops, `${opPath}.ops`);
          }
          if (op.catch && Array.isArray(op.catch)) {
            validateOps(op.catch, `${opPath}.catch`);
          }
        } else {
          // Standard op validation
          if (!op.op) {
            errors.push(`${opPath}: missing 'op' field`);
          } else if (!op.op.includes('.')) {
            errors.push(`${opPath}: invalid format '${op.op}' (expected namespace.method)`);
          }
        }
      });
    };
    validateOps(packet.ops);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Parse op string into namespace and method
export const parseOp = (opString) => {
  const parts = opString.split('.');
  return {
    namespace: parts[0],
    method: parts.slice(1).join('.')
  };
};

// Get nested value from object using dot path
const getNestedValue = (obj, path) => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    // Handle array index notation [0]
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      current = current[arrayMatch[1]];
      if (Array.isArray(current)) {
        current = current[parseInt(arrayMatch[2])];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
    }
  }
  return current;
};

// Template resolver - resolves {{opId.<opId>.<path>}} and {{loop.<var>}} patterns
export const resolveTemplate = (value, resultStore, loopContext = {}) => {
  if (typeof value !== 'string') {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(item => resolveTemplate(item, resultStore, loopContext));
      }
      const resolved = {};
      for (const key of Object.keys(value)) {
        resolved[key] = resolveTemplate(value[key], resultStore, loopContext);
      }
      return resolved;
    }
    return value;
  }

  // Combined regex for all template types
  const templateRegex = /\{\{(opId|op|loop|var)\.([^}]+)\}\}/g;
  let result = value;
  const matches = [];
  let match;

  while ((match = templateRegex.exec(value)) !== null) {
    matches.push({
      full: match[0],
      type: match[1],
      path: match[2]
    });
  }

  for (const m of matches) {
    let replacement;

    if (m.type === 'opId') {
      // {{opId.<opId>.<path>}}
      const [opId, ...pathParts] = m.path.split('.');
      const opResult = resultStore.getById(opId);
      if (!opResult) {
        throw new Error(`Template resolution failed: opId '${opId}' not found in result store`);
      }
      const nestedValue = pathParts.length > 0 ? getNestedValue(opResult, pathParts.join('.')) : opResult;
      if (nestedValue === undefined) {
        throw new Error(`Template resolution failed: path '${pathParts.join('.')}' not found in opId '${opId}'`);
      }
      replacement = typeof nestedValue === 'object' ? JSON.stringify(nestedValue) : String(nestedValue);
    } else if (m.type === 'op') {
      // {{op.<index>.<path>}}
      const [indexStr, ...pathParts] = m.path.split('.');
      const index = parseInt(indexStr);
      const opResult = resultStore.getByIndex(index);
      if (!opResult) {
        throw new Error(`Template resolution failed: op[${index}] not found in result store`);
      }
      const nestedValue = pathParts.length > 0 ? getNestedValue(opResult, pathParts.join('.')) : opResult;
      if (nestedValue === undefined) {
        throw new Error(`Template resolution failed: path '${pathParts.join('.')}' not found in op[${index}]`);
      }
      replacement = typeof nestedValue === 'object' ? JSON.stringify(nestedValue) : String(nestedValue);
    } else if (m.type === 'loop' || m.type === 'var') {
      // {{loop.<var>}} or {{var.<var>}}
      const varPath = m.path.split('.');
      let varValue = loopContext;
      for (const part of varPath) {
        if (varValue === undefined || varValue === null) break;
        varValue = varValue[part];
      }
      if (varValue === undefined) {
        throw new Error(`Template resolution failed: loop variable '${m.path}' not found`);
      }
      replacement = typeof varValue === 'object' ? JSON.stringify(varValue) : String(varValue);
    }

    result = result.replace(m.full, replacement);
  }

  return result;
};

// Condition evaluator for conditional execution
export const evaluateCondition = (condition, resultStore, loopContext = {}) => {
  // Support for string conditions that reference results
  if (typeof condition === 'string') {
    // Resolve any templates in the condition string
    const resolved = resolveTemplate(condition, resultStore, loopContext);
    
    // Simple expression evaluation
    // Supports: ==, !=, >, <, >=, <=, &&, ||, !
    try {
      // Safe evaluation using Function constructor with limited scope
      const evalFunc = new Function('value', `
        try {
          const result = ${resolved};
          return Boolean(result);
        } catch (e) {
          return false;
        }
      `);
      return evalFunc();
    } catch (e) {
      // If evaluation fails, treat as truthy check
      return Boolean(resolved);
    }
  }

  // Object-based condition
  if (typeof condition === 'object' && condition !== null) {
    const { op, left, right, value, field } = condition;

    // Resolve left and right values
    let leftVal = left !== undefined ? resolveTemplate(left, resultStore, loopContext) : undefined;
    let rightVal = right !== undefined ? resolveTemplate(right, resultStore, loopContext) : undefined;
    const checkVal = value !== undefined ? resolveTemplate(value, resultStore, loopContext) : undefined;

    // Parse JSON strings if needed
    try {
      if (typeof leftVal === 'string' && (leftVal.startsWith('{') || leftVal.startsWith('['))) {
        leftVal = JSON.parse(leftVal);
      }
      if (typeof rightVal === 'string' && (rightVal.startsWith('{') || rightVal.startsWith('['))) {
        rightVal = JSON.parse(rightVal);
      }
    } catch (e) {
      // Keep as string if parsing fails
    }

    // If field is specified, extract from left value
    if (field && typeof leftVal === 'object') {
      leftVal = getNestedValue(leftVal, field);
    }

    switch (op) {
      case 'eq':
      case '==':
      case 'equals':
        return leftVal == rightVal;
      case 'neq':
      case '!=':
      case 'notEquals':
        return leftVal != rightVal;
      case 'gt':
      case '>':
        return Number(leftVal) > Number(rightVal);
      case 'gte':
      case '>=':
        return Number(leftVal) >= Number(rightVal);
      case 'lt':
      case '<':
        return Number(leftVal) < Number(rightVal);
      case 'lte':
      case '<=':
        return Number(leftVal) <= Number(rightVal);
      case 'contains':
        return String(leftVal).includes(String(rightVal));
      case 'startsWith':
        return String(leftVal).startsWith(String(rightVal));
      case 'endsWith':
        return String(leftVal).endsWith(String(rightVal));
      case 'matches':
        return new RegExp(rightVal).test(String(leftVal));
      case 'exists':
      case 'truthy':
        return Boolean(checkVal !== undefined ? checkVal : leftVal);
      case 'empty':
        const val = checkVal !== undefined ? checkVal : leftVal;
        return val === null || val === undefined || val === '' || 
               (Array.isArray(val) && val.length === 0) ||
               (typeof val === 'object' && Object.keys(val).length === 0);
      case 'and':
      case '&&':
        return evaluateCondition(left, resultStore, loopContext) && 
               evaluateCondition(right, resultStore, loopContext);
      case 'or':
      case '||':
        return evaluateCondition(left, resultStore, loopContext) || 
               evaluateCondition(right, resultStore, loopContext);
      case 'not':
      case '!':
        return !evaluateCondition(checkVal !== undefined ? checkVal : left, resultStore, loopContext);
      case 'in':
        return Array.isArray(rightVal) && rightVal.includes(leftVal);
      case 'status':
        // Check status of a previous op
        const opResult = resultStore.getById(left) || resultStore.getByIndex(parseInt(left));
        return opResult && opResult._status === rightVal;
      default:
        // Default: truthy check
        return Boolean(condition);
    }
  }

  // Boolean or other primitive
  return Boolean(condition);
};

// Result Store - stores op outputs
export class ResultStore {
  constructor() {
    this.byIndex = {};
    this.byId = {};
    this.globalIndex = 0;
  }

  set(index, opId, result, status = 'OK') {
    const enrichedResult = { ...result, _status: status, _index: index };
    this.byIndex[index] = enrichedResult;
    if (opId) {
      this.byId[opId] = enrichedResult;
    }
  }

  getByIndex(index) {
    return this.byIndex[index];
  }

  getById(opId) {
    return this.byId[opId];
  }

  nextIndex() {
    return this.globalIndex++;
  }

  toJSON() {
    return {
      byIndex: this.byIndex,
      byId: this.byId
    };
  }
}

// HTTP Driver
export const httpDriver = {
  async get(args, abortSignal) {
    const { url, headers = {}, timeout = 15000 } = args;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...headers
        },
        signal: abortSignal || controller.signal
      });

      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        response: responseData,
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  async post(args, abortSignal) {
    const { url, json, body, headers = {}, timeout = 15000 } = args;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers
        },
        body: JSON.stringify(json || body),
        signal: abortSignal || controller.signal
      });

      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        response: responseData,
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  async put(args, abortSignal) {
    const { url, json, body, headers = {}, timeout = 15000 } = args;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers
        },
        body: JSON.stringify(json || body),
        signal: abortSignal || controller.signal
      });

      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        response: responseData,
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  async delete(args, abortSignal) {
    const { url, headers = {}, timeout = 15000 } = args;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          ...headers
        },
        signal: abortSignal || controller.signal
      });

      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        response: responseData,
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
};

// Local Storage Driver
export const localDriver = {
  async put(args) {
    const { key, value } = args;
    await KvRepo.put(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    return { ok: true, key };
  },

  async get(args) {
    const { key, default: defaultValue } = args;
    try {
      const result = await KvRepo.get(key);
      // Try to parse JSON
      try {
        return { value: JSON.parse(result.value), key };
      } catch {
        return { value: result.value, key };
      }
    } catch (e) {
      if (defaultValue !== undefined) {
        return { value: defaultValue, key, default: true };
      }
      throw e;
    }
  },

  async delete(args) {
    const { key } = args;
    await KvRepo.put(key, null);
    return { ok: true, key, deleted: true };
  },

  async increment(args) {
    const { key, by = 1 } = args;
    let current = 0;
    try {
      const result = await KvRepo.get(key);
      current = parseInt(result.value) || 0;
    } catch (e) {
      // Key doesn't exist, start at 0
    }
    const newValue = current + by;
    await KvRepo.put(key, String(newValue));
    return { ok: true, key, value: newValue, previous: current };
  }
};

// Notify Driver
export const notifyDriver = {
  showToastCallback: null,

  setToastCallback(callback) {
    this.showToastCallback = callback;
  },

  async show(args) {
    const { title, body, icon } = args;

    // Try Web Notifications API first
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon });
      return { shown: true, method: 'notification' };
    }

    // Fallback to toast
    if (this.showToastCallback) {
      this.showToastCallback(title, body);
    }
    return { shown: true, method: 'toast' };
  }
};

// Transform Driver - data transformation operations
export const transformDriver = {
  async map(args) {
    const { items, expression, as = 'item' } = args;
    if (!Array.isArray(items)) {
      throw new Error('transform.map requires items to be an array');
    }
    // Simple property extraction or pass-through
    const result = items.map((item, index) => {
      if (expression) {
        // Expression is a property path
        return getNestedValue(item, expression) ?? item;
      }
      return item;
    });
    return { items: result, count: result.length };
  },

  async filter(args) {
    const { items, field, op = 'exists', value } = args;
    if (!Array.isArray(items)) {
      throw new Error('transform.filter requires items to be an array');
    }
    const result = items.filter(item => {
      const fieldValue = field ? getNestedValue(item, field) : item;
      switch (op) {
        case 'exists':
        case 'truthy':
          return Boolean(fieldValue);
        case 'eq':
        case '==':
          return fieldValue == value;
        case 'neq':
        case '!=':
          return fieldValue != value;
        case 'gt':
          return Number(fieldValue) > Number(value);
        case 'gte':
          return Number(fieldValue) >= Number(value);
        case 'lt':
          return Number(fieldValue) < Number(value);
        case 'lte':
          return Number(fieldValue) <= Number(value);
        case 'contains':
          return String(fieldValue).includes(String(value));
        default:
          return Boolean(fieldValue);
      }
    });
    return { items: result, count: result.length };
  },

  async reduce(args) {
    const { items, op = 'sum', field, initial = 0 } = args;
    if (!Array.isArray(items)) {
      throw new Error('transform.reduce requires items to be an array');
    }
    let result;
    const values = field ? items.map(i => getNestedValue(i, field)) : items;
    
    switch (op) {
      case 'sum':
        result = values.reduce((a, b) => Number(a) + Number(b), initial);
        break;
      case 'avg':
        result = values.reduce((a, b) => Number(a) + Number(b), 0) / values.length;
        break;
      case 'min':
        result = Math.min(...values.map(Number));
        break;
      case 'max':
        result = Math.max(...values.map(Number));
        break;
      case 'count':
        result = values.length;
        break;
      case 'concat':
        result = values.join(args.separator || '');
        break;
      case 'first':
        result = values[0];
        break;
      case 'last':
        result = values[values.length - 1];
        break;
      default:
        result = values.length;
    }
    return { result, count: items.length };
  },

  async set(args) {
    // Create or transform an object
    const { value, merge, ...rest } = args;
    if (merge && typeof merge === 'object') {
      return { ...merge, ...rest, value };
    }
    return { value, ...rest };
  },

  async concat(args) {
    const { items, separator = '' } = args;
    if (!Array.isArray(items)) {
      return { result: String(items) };
    }
    return { result: items.join(separator) };
  },

  async split(args) {
    const { value, separator = ',' } = args;
    const items = String(value).split(separator);
    return { items, count: items.length };
  },

  async json(args) {
    const { value, parse = false } = args;
    if (parse && typeof value === 'string') {
      return { result: JSON.parse(value) };
    }
    return { result: JSON.stringify(value) };
  }
};

// LLM Driver - for AI-powered operations
export const llmDriver = {
  tokenTracker: null,
  
  setTokenTracker(tracker) {
    this.tokenTracker = tracker;
  },

  async invoke(args) {
    const { prompt, json_schema, context, model = 'default' } = args;
    
    // Estimate input tokens
    const inputText = prompt + (context ? JSON.stringify(context) : '');
    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    
    // Import and call the LLM integration
    const { base44 } = await import('@/api/base44Client');
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: json_schema || null,
      add_context_from_internet: args.web_search || false
    });
    
    // Estimate output tokens
    const outputText = typeof result === 'string' ? result : JSON.stringify(result);
    const estimatedOutputTokens = Math.ceil(outputText.length / 4);
    
    // Calculate saved tokens (UCP caching/optimization)
    const savedTokens = args.cached ? estimatedInputTokens : 0;
    
    if (this.tokenTracker) {
      this.tokenTracker.addCall(estimatedInputTokens, estimatedOutputTokens, savedTokens);
    }
    
    return {
      response: result,
      tokens: {
        input: estimatedInputTokens,
        output: estimatedOutputTokens,
        saved: savedTokens
      }
    };
  },

  async analyze(args) {
    const { data, instruction } = args;
    const prompt = `${instruction}\n\nData to analyze:\n${JSON.stringify(data, null, 2)}`;
    return await this.invoke({ prompt, ...args });
  },

  async generate(args) {
    const { template, variables } = args;
    let prompt = template;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      });
    }
    return await this.invoke({ prompt, ...args });
  },

  async summarize(args) {
    const { text, max_length = 100 } = args;
    const prompt = `Summarize the following in ${max_length} words or less:\n\n${text}`;
    return await this.invoke({ prompt });
  }
};

// Wait/Delay Driver
export const waitDriver = {
  async delay(args) {
    const { ms = 1000, seconds } = args;
    const duration = seconds ? seconds * 1000 : ms;
    await new Promise(resolve => setTimeout(resolve, duration));
    return { waited: duration, ok: true };
  },

  async until(args, resultStore) {
    const { condition, timeout = 30000, interval = 1000 } = args;
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (evaluateCondition(condition, resultStore)) {
        return { ok: true, elapsed: Date.now() - startTime };
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`wait.until timeout after ${timeout}ms`);
  }
};

// Driver Router
export const driverRouter = {
  async dispatch(namespace, method, args, abortSignal, resultStore) {
    switch (namespace) {
      case 'http':
        if (method === 'get') return await httpDriver.get(args, abortSignal);
        if (method === 'post') return await httpDriver.post(args, abortSignal);
        if (method === 'put') return await httpDriver.put(args, abortSignal);
        if (method === 'delete') return await httpDriver.delete(args, abortSignal);
        throw new Error(`Unknown HTTP method: ${method}`);

      case 'local':
        if (method === 'put') return await localDriver.put(args);
        if (method === 'get') return await localDriver.get(args);
        if (method === 'delete') return await localDriver.delete(args);
        if (method === 'increment') return await localDriver.increment(args);
        throw new Error(`Unknown local method: ${method}`);

      case 'notify':
        if (method === 'show') return await notifyDriver.show(args);
        throw new Error(`Unknown notify method: ${method}`);

      case 'transform':
        if (method === 'map') return await transformDriver.map(args);
        if (method === 'filter') return await transformDriver.filter(args);
        if (method === 'reduce') return await transformDriver.reduce(args);
        if (method === 'set') return await transformDriver.set(args);
        if (method === 'concat') return await transformDriver.concat(args);
        if (method === 'split') return await transformDriver.split(args);
        if (method === 'json') return await transformDriver.json(args);
        throw new Error(`Unknown transform method: ${method}`);

      case 'wait':
        if (method === 'delay') return await waitDriver.delay(args);
        if (method === 'until') return await waitDriver.until(args, resultStore);
        throw new Error(`Unknown wait method: ${method}`);

      case 'llm':
        if (method === 'invoke') return await llmDriver.invoke(args);
        if (method === 'analyze') return await llmDriver.analyze(args);
        if (method === 'generate') return await llmDriver.generate(args);
        if (method === 'summarize') return await llmDriver.summarize(args);
        throw new Error(`Unknown llm method: ${method}`);

      default:
        throw new Error(`Unknown driver namespace: ${namespace}`);
    }
  }
};

// Execution Engine with extended control flow
export class ExecutionEngine {
  constructor(packet, onLog, onProgress, onTokenUpdate) {
    this.packet = packet;
    this.onLog = onLog || (() => {});
    this.onProgress = onProgress || (() => {});
    this.onTokenUpdate = onTokenUpdate || (() => {});
    this.resultStore = new ResultStore();
    this.tokenTracker = new TokenTracker();
    this.aborted = false;
    this.abortController = new AbortController();
    this.totalOps = this.countOps(packet.ops);
    this.completedOps = 0;
    
    // Calculate baseline tokens (what a naive approach would use)
    this.tokenTracker.setBaseline(this.estimateBaselineTokens(packet));
  }

  estimateBaselineTokens(packet) {
    // Estimate tokens if everything was sent to LLM without UCP optimization
    const packetStr = JSON.stringify(packet);
    // Rough estimate: 1 token per 4 characters
    return Math.ceil(packetStr.length / 4) * packet.ops.length;
  }

  countOps(ops) {
    let count = 0;
    for (const op of ops) {
      if (op.type === 'conditional' || op.type === 'if') {
        count += 1 + this.countOps(op.then || []) + this.countOps(op.else || []);
      } else if (op.type === 'loop' || op.type === 'foreach') {
        count += 1 + this.countOps(op.ops || []);
      } else if (op.type === 'parallel') {
        count += 1 + this.countOps(op.ops || []);
      } else if (op.type === 'try') {
        count += 1 + this.countOps(op.ops || []) + this.countOps(op.catch || []);
      } else {
        count += 1;
      }
    }
    return count;
  }

  abort() {
    this.aborted = true;
    this.abortController.abort();
  }

  log(level, message, data = null) {
    const entry = {
      timestamp: Date.now(),
      level,
      message,
      data
    };
    this.onLog(entry);
  }

  updateProgress() {
    this.completedOps++;
    this.onProgress(this.completedOps, this.totalOps);
  }

  async executeOp(op, loopContext = {}) {
    if (this.aborted) {
      throw new Error('Execution aborted by user');
    }

    const opStartedAt = Date.now();
    const globalIndex = this.resultStore.nextIndex();

    // Handle control flow types
    if (op.type === 'conditional' || op.type === 'if') {
      return await this.executeConditional(op, loopContext, globalIndex, opStartedAt);
    }

    if (op.type === 'loop' || op.type === 'foreach') {
      return await this.executeLoop(op, loopContext, globalIndex, opStartedAt);
    }

    if (op.type === 'parallel') {
      return await this.executeParallel(op, loopContext, globalIndex, opStartedAt);
    }

    if (op.type === 'try') {
      return await this.executeTry(op, loopContext, globalIndex, opStartedAt);
    }

    // Standard operation execution
    this.log('info', `[${globalIndex}] Executing: ${op.op}`, { opId: op.id });

    try {
      const { namespace, method } = parseOp(op.op);

      // Resolve templates in args
      let resolvedArgs = op.args || {};
      try {
        resolvedArgs = resolveTemplate(op.args || {}, this.resultStore, loopContext);
        this.log('debug', `Resolved args for ${op.op}`, resolvedArgs);
      } catch (templateError) {
        throw new Error(`Template resolution error: ${templateError.message}`);
      }

      // Check skip condition
      if (op.skipIf) {
        const shouldSkip = evaluateCondition(op.skipIf, this.resultStore, loopContext);
        if (shouldSkip) {
          this.log('info', `Skipped: ${op.op} (skipIf condition met)`);
          const result = { skipped: true, reason: 'skipIf condition met' };
          this.resultStore.set(globalIndex, op.id, result, 'SKIPPED');
          this.updateProgress();
          return {
            index: globalIndex,
            op: op.op,
            opId: op.id || null,
            type: 'standard',
            startedAtEpochMs: opStartedAt,
            finishedAtEpochMs: Date.now(),
            status: 'SKIPPED',
            output: result
          };
        }
      }

      // Check runIf condition
      if (op.runIf) {
        const shouldRun = evaluateCondition(op.runIf, this.resultStore, loopContext);
        if (!shouldRun) {
          this.log('info', `Skipped: ${op.op} (runIf condition not met)`);
          const result = { skipped: true, reason: 'runIf condition not met' };
          this.resultStore.set(globalIndex, op.id, result, 'SKIPPED');
          this.updateProgress();
          return {
            index: globalIndex,
            op: op.op,
            opId: op.id || null,
            type: 'standard',
            startedAtEpochMs: opStartedAt,
            finishedAtEpochMs: Date.now(),
            status: 'SKIPPED',
            output: result
          };
        }
      }

      // Dispatch to driver
      const result = await driverRouter.dispatch(
        namespace,
        method,
        resolvedArgs,
        this.abortController.signal,
        this.resultStore
      );

      // Store result
      this.resultStore.set(globalIndex, op.id, result, 'OK');

      const opFinishedAt = Date.now();
      this.log('success', `Completed: ${op.op} (${opFinishedAt - opStartedAt}ms)`, result);
      this.updateProgress();
      
      // Update token stats if this was an LLM call
      if (namespace === 'llm') {
        this.onTokenUpdate(this.tokenTracker.getStats());
      }

      return {
        index: globalIndex,
        op: op.op,
        opId: op.id || null,
        type: 'standard',
        startedAtEpochMs: opStartedAt,
        finishedAtEpochMs: opFinishedAt,
        status: 'OK',
        output: result
      };

    } catch (error) {
      const opFinishedAt = Date.now();
      this.log('error', `Failed: ${op.op} - ${error.message}`);
      this.resultStore.set(globalIndex, op.id, { error: error.message }, 'ERROR');
      this.updateProgress();

      return {
        index: globalIndex,
        op: op.op,
        opId: op.id || null,
        type: 'standard',
        startedAtEpochMs: opStartedAt,
        finishedAtEpochMs: opFinishedAt,
        status: 'ERROR',
        error: error.message
      };
    }
  }

  async executeConditional(op, loopContext, globalIndex, opStartedAt) {
    this.log('info', `[${globalIndex}] Evaluating conditional`, { id: op.id });

    const conditionResult = evaluateCondition(op.condition, this.resultStore, loopContext);
    this.log('info', `Condition evaluated to: ${conditionResult}`);

    const branchOps = conditionResult ? (op.then || []) : (op.else || []);
    const branchName = conditionResult ? 'then' : 'else';

    const results = [];
    for (const branchOp of branchOps) {
      const result = await this.executeOp(branchOp, loopContext);
      results.push(result);
      if (result.status === 'ERROR' && !op.continueOnError) {
        break;
      }
    }

    this.resultStore.set(globalIndex, op.id, { 
      conditionResult, 
      branch: branchName,
      results 
    }, results.some(r => r.status === 'ERROR') ? 'ERROR' : 'OK');

    this.updateProgress();

    return {
      index: globalIndex,
      opId: op.id || null,
      type: 'conditional',
      startedAtEpochMs: opStartedAt,
      finishedAtEpochMs: Date.now(),
      status: results.some(r => r.status === 'ERROR') ? 'ERROR' : 'OK',
      conditionResult,
      branch: branchName,
      branchResults: results
    };
  }

  async executeLoop(op, parentLoopContext, globalIndex, opStartedAt) {
    this.log('info', `[${globalIndex}] Starting loop`, { id: op.id });

    let items = [];
    
    if (op.items) {
      // Resolve items (could be a template)
      items = resolveTemplate(op.items, this.resultStore, parentLoopContext);
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          items = items.split(',').map(s => s.trim());
        }
      }
    } else if (op.count) {
      // Generate range
      const count = typeof op.count === 'string' 
        ? parseInt(resolveTemplate(op.count, this.resultStore, parentLoopContext))
        : op.count;
      items = Array.from({ length: count }, (_, i) => i);
    } else if (op.range) {
      const [start, end] = op.range;
      items = Array.from({ length: end - start }, (_, i) => start + i);
    }

    this.log('info', `Loop will iterate ${items.length} times`);

    const iterationResults = [];
    const varName = op.as || 'item';
    const indexName = op.indexAs || 'index';
    let shouldBreak = false;

    for (let i = 0; i < items.length && !shouldBreak; i++) {
      if (this.aborted) break;

      const item = items[i];
      const loopContext = {
        ...parentLoopContext,
        [varName]: item,
        [indexName]: i,
        first: i === 0,
        last: i === items.length - 1,
        length: items.length
      };

      this.log('debug', `Loop iteration ${i + 1}/${items.length}`, { [varName]: item });

      const iterationOpResults = [];
      for (const loopOp of op.ops) {
        const result = await this.executeOp(loopOp, loopContext);
        iterationOpResults.push(result);

        if (result.status === 'ERROR') {
          if (op.breakOnError !== false) {
            shouldBreak = true;
            break;
          }
        }

        // Check for break condition
        if (op.breakIf) {
          const shouldBreakNow = evaluateCondition(op.breakIf, this.resultStore, loopContext);
          if (shouldBreakNow) {
            this.log('info', `Loop break condition met at iteration ${i + 1}`);
            shouldBreak = true;
            break;
          }
        }
      }

      iterationResults.push({
        iteration: i,
        item,
        results: iterationOpResults
      });

      // Check continue condition
      if (op.continueIf) {
        const shouldContinue = evaluateCondition(op.continueIf, this.resultStore, loopContext);
        if (!shouldContinue) {
          this.log('info', `Loop continue condition not met, stopping at iteration ${i + 1}`);
          break;
        }
      }
    }

    const hasError = iterationResults.some(ir => ir.results.some(r => r.status === 'ERROR'));
    
    this.resultStore.set(globalIndex, op.id, {
      iterations: iterationResults.length,
      items: items.length,
      results: iterationResults
    }, hasError ? 'ERROR' : 'OK');

    this.updateProgress();

    return {
      index: globalIndex,
      opId: op.id || null,
      type: 'loop',
      startedAtEpochMs: opStartedAt,
      finishedAtEpochMs: Date.now(),
      status: hasError ? 'ERROR' : 'OK',
      iterations: iterationResults.length,
      totalItems: items.length,
      iterationResults
    };
  }

  async executeParallel(op, loopContext, globalIndex, opStartedAt) {
    this.log('info', `[${globalIndex}] Starting parallel execution of ${op.ops.length} ops`, { id: op.id });

    const promises = op.ops.map(async (parallelOp, i) => {
      try {
        return await this.executeOp(parallelOp, loopContext);
      } catch (error) {
        return {
          index: -1,
          op: parallelOp.op,
          opId: parallelOp.id || null,
          type: 'standard',
          startedAtEpochMs: Date.now(),
          finishedAtEpochMs: Date.now(),
          status: 'ERROR',
          error: error.message
        };
      }
    });

    let results;
    if (op.race) {
      // Race mode - first to complete wins
      const winner = await Promise.race(promises);
      results = [winner];
      this.log('info', `Parallel race completed, winner: ${winner.op || winner.type}`);
    } else if (op.allSettled || op.continueOnError) {
      // All settled mode - wait for all, don't fail on error
      results = await Promise.all(promises);
    } else {
      // Default - all must succeed
      results = await Promise.all(promises);
    }

    const hasError = results.some(r => r.status === 'ERROR');

    this.resultStore.set(globalIndex, op.id, {
      parallelCount: op.ops.length,
      completedCount: results.length,
      results
    }, hasError && !op.continueOnError ? 'ERROR' : 'OK');

    this.updateProgress();

    return {
      index: globalIndex,
      opId: op.id || null,
      type: 'parallel',
      startedAtEpochMs: opStartedAt,
      finishedAtEpochMs: Date.now(),
      status: hasError && !op.continueOnError ? 'ERROR' : 'OK',
      parallelResults: results
    };
  }

  async executeTry(op, loopContext, globalIndex, opStartedAt) {
    this.log('info', `[${globalIndex}] Starting try block`, { id: op.id });

    const tryResults = [];
    let caught = false;
    let caughtError = null;

    for (const tryOp of op.ops) {
      const result = await this.executeOp(tryOp, loopContext);
      tryResults.push(result);

      if (result.status === 'ERROR') {
        caught = true;
        caughtError = result.error;
        this.log('warning', `Try block caught error: ${caughtError}`);
        break;
      }
    }

    const catchResults = [];
    if (caught && op.catch && op.catch.length > 0) {
      this.log('info', `Executing catch block`);
      
      // Add error to loop context for catch block
      const catchContext = {
        ...loopContext,
        error: caughtError,
        errorMessage: caughtError
      };

      for (const catchOp of op.catch) {
        const result = await this.executeOp(catchOp, catchContext);
        catchResults.push(result);
        if (result.status === 'ERROR' && !op.continueOnCatchError) {
          break;
        }
      }
    }

    // Finally block
    const finallyResults = [];
    if (op.finally && op.finally.length > 0) {
      this.log('info', `Executing finally block`);
      for (const finallyOp of op.finally) {
        const result = await this.executeOp(finallyOp, loopContext);
        finallyResults.push(result);
      }
    }

    const hasUnhandledError = caught && catchResults.some(r => r.status === 'ERROR');
    
    this.resultStore.set(globalIndex, op.id, {
      caught,
      error: caughtError,
      tryResults,
      catchResults,
      finallyResults
    }, hasUnhandledError ? 'ERROR' : 'OK');

    this.updateProgress();

    return {
      index: globalIndex,
      opId: op.id || null,
      type: 'try',
      startedAtEpochMs: opStartedAt,
      finishedAtEpochMs: Date.now(),
      status: hasUnhandledError ? 'ERROR' : 'OK',
      caught,
      error: caughtError,
      tryResults,
      catchResults,
      finallyResults
    };
  }

  async executeOps(ops, loopContext = {}) {
    const results = [];

    for (const op of ops) {
      if (this.aborted) {
        results.push({
          index: this.resultStore.nextIndex(),
          op: op.op || op.type,
          opId: op.id || null,
          startedAtEpochMs: Date.now(),
          finishedAtEpochMs: Date.now(),
          status: 'ERROR',
          error: 'Execution aborted by user'
        });
        break;
      }

      const result = await this.executeOp(op, loopContext);
      results.push(result);

      // Stop on first error unless it's a try block or has continueOnError
      if (result.status === 'ERROR' && !op.continueOnError && op.type !== 'try') {
        break;
      }
    }

    return results;
  }

  async execute() {
    const startedAt = Date.now();

    this.log('info', `Starting execution of packet: ${this.packet.id}`);
    this.log('info', `UCP Version: ${this.packet.ucp_version}`);
    this.log('info', `Total operations: ${this.totalOps}`);
    
    // Set up LLM driver token tracking
    llmDriver.setTokenTracker(this.tokenTracker);

    const opResults = await this.executeOps(this.packet.ops);

    const finishedAt = Date.now();
    const hasError = opResults.some(r => r.status === 'ERROR');
    const status = hasError ? 'FAILED' : 'SUCCESS';

    this.onProgress(this.totalOps, this.totalOps);

    // Generate packet hash
    const packetHash = await sha256Hash(stableStringify(this.packet));

    // Build receipt (without receiptHash first)
    const receipt = {
      receiptId: generateUUID(),
      packetId: this.packet.id,
      startedAtEpochMs: startedAt,
      finishedAtEpochMs: finishedAt,
      status,
      opResults,
      packetHash,
      receiptHash: ''
    };

    // Calculate receipt hash
    const receiptHash = await sha256Hash(stableStringify(receipt));
    receipt.receiptHash = receiptHash;

    // Add token stats
    const tokenStats = this.tokenTracker.getStats();
    receipt.tokenStats = tokenStats;

    this.log('info', `Execution ${status} in ${finishedAt - startedAt}ms`);
    this.log('info', `Packet Hash: ${packetHash.substring(0, 16)}...`);
    this.log('info', `Receipt Hash: ${receiptHash.substring(0, 16)}...`);
    
    if (tokenStats.totalTokens > 0) {
      this.log('info', `Tokens used: ${tokenStats.totalTokens} (${tokenStats.inputTokens} in, ${tokenStats.outputTokens} out)`);
      if (tokenStats.savedTokens > 0) {
        this.log('success', `Tokens SAVED: ${tokenStats.savedTokens} via UCP optimization`);
      }
    }

    return receipt;
  }
}

export default {
  stableStringify,
  sha256Hash,
  generateUUID,
  validatePacket,
  parseOp,
  resolveTemplate,
  evaluateCondition,
  ResultStore,
  httpDriver,
  localDriver,
  notifyDriver,
  transformDriver,
  waitDriver,
  driverRouter,
  ExecutionEngine
};