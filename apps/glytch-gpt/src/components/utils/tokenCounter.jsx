/**
 * Token Counter Utility
 * Estimates token usage for LLM prompts and responses
 */

export class TokenCounter {
    /**
     * Estimate tokens using a simple approximation
     * Average: ~4 characters per token for English text
     * This is a rough estimate; actual tokenization varies by model
     */
    static estimateTokens(text) {
        if (!text) return 0;
        
        // More sophisticated estimation
        const words = text.split(/\s+/).length;
        const chars = text.length;
        
        // Average between word count * 1.3 and char count / 4
        const wordBasedEstimate = Math.ceil(words * 1.3);
        const charBasedEstimate = Math.ceil(chars / 4);
        
        return Math.ceil((wordBasedEstimate + charBasedEstimate) / 2);
    }

    /**
     * Calculate token usage for a prompt-response pair
     */
    static calculateUsage(prompt, response) {
        const promptTokens = this.estimateTokens(prompt);
        const completionTokens = this.estimateTokens(response);
        
        return {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: promptTokens + completionTokens
        };
    }

    /**
     * Estimate cost based on token usage
     * Pricing as of 2024 (approximate)
     */
    static estimateCost(tokens, model = "gpt-4") {
        const pricing = {
            "gpt-4": {
                prompt: 0.03 / 1000,
                completion: 0.06 / 1000
            },
            "gpt-4o": {
                prompt: 0.005 / 1000,
                completion: 0.015 / 1000
            },
            "gpt-3.5-turbo": {
                prompt: 0.0015 / 1000,
                completion: 0.002 / 1000
            }
        };

        const modelPricing = pricing[model] || pricing["gpt-4o"];
        
        return {
            prompt_cost: tokens.prompt_tokens * modelPricing.prompt,
            completion_cost: tokens.completion_tokens * modelPricing.completion,
            total_cost: (tokens.prompt_tokens * modelPricing.prompt) + 
                       (tokens.completion_tokens * modelPricing.completion)
        };
    }

    /**
     * Calculate reduction percentage
     */
    static calculateReduction(standardTokens, ucpTokens) {
        if (!standardTokens || standardTokens === 0) return 0;
        
        const reduction = ((standardTokens - ucpTokens) / standardTokens) * 100;
        return Math.max(0, Math.round(reduction * 10) / 10); // Round to 1 decimal
    }

    /**
     * Format token count with commas
     */
    static formatTokenCount(count) {
        return count.toLocaleString();
    }

    /**
     * Format cost in USD
     */
    static formatCost(cost) {
        return `$${cost.toFixed(4)}`;
    }
}

export default TokenCounter;