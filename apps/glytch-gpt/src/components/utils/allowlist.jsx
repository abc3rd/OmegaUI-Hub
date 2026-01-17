/**
 * LLM Provider Allowlist
 * Enforces strict provider and model restrictions
 */

export const ALLOWED_PROVIDERS = ['openai'];

export const ALLOWED_MODELS = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo'
];

/**
 * Validate provider and model against allowlist
 */
export function validateProvider(provider, model) {
    // Check provider
    if (!ALLOWED_PROVIDERS.includes(provider)) {
        throw new Error(
            `This deployment is configured for OpenAI-only. ` +
            `Provider "${provider}" is not allowed. ` +
            `Allowed providers: ${ALLOWED_PROVIDERS.join(', ')}`
        );
    }

    // Check model
    const isAllowed = ALLOWED_MODELS.includes(model) || model.startsWith('gpt-');
    if (!isAllowed) {
        throw new Error(
            `Model "${model}" is not allowed. ` +
            `Allowed models: ${ALLOWED_MODELS.join(', ')} or any gpt-* model`
        );
    }

    return true;
}

/**
 * Check if a model is an OpenAI model
 */
export function isOpenAIModel(model) {
    return model.startsWith('gpt-');
}

/**
 * Get safe default settings
 */
export function getSafeDefaults() {
    return {
        max_output_tokens: 300,
        temperature: 0.7,
        top_p: 1.0,
        allow_parallel_runs: false,
        max_prompt_length: 20000
    };
}