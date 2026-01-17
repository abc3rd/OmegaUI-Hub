import React from "react";
import { base44 } from "@/api/base44Client";

// Wrapper component to automatically track token usage
export function useTokenTracking() {
  const trackTokens = async (operation_type, operation_name, tokens, metadata = {}) => {
    try {
      await base44.functions.invoke('trackTokenUsage', {
        operation_type,
        operation_name,
        tokens_used: tokens,
        input_tokens: metadata.input_tokens || 0,
        output_tokens: metadata.output_tokens || 0,
        model_used: metadata.model || 'unknown',
        cost_usd: metadata.cost || calculateCost(tokens, operation_type),
        request_metadata: metadata,
        success: true
      });
    } catch (error) {
      console.error('Token tracking failed:', error);
    }
  };

  const calculateCost = (tokens, type) => {
    const pricing = {
      'llm_call': 0.00002, // $0.02 per 1K tokens (GPT-4 pricing)
      'image_generation': 0.04, // $0.04 per image
      'facial_verification': 0.001,
      'data_extraction': 0.00001,
      'api_call': 0.00001
    };
    return (tokens / 1000) * (pricing[type] || 0.00001);
  };

  return { trackTokens };
}

export default function TokenTracker({ children }) {
  return <>{children}</>;
}