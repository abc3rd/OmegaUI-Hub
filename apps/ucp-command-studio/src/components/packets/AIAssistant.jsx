import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GlassCard from "@/components/ui/GlassCard";
import { Sparkles, Wand2, RefreshCw, Loader2, Lightbulb, Code, FileJson } from "lucide-react";
import { toast } from "sonner";

export default function AIAssistant({ 
  currentSchema, 
  currentLogic, 
  intent,
  onSchemaGenerated, 
  onLogicGenerated,
  onBothGenerated 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [customPrompt, setCustomPrompt] = useState("");
  const [suggestions, setSuggestions] = useState(null);

  const generateFromIntent = async () => {
    if (!intent?.trim()) {
      toast.error("Please provide an intent description first");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert at designing command packet schemas. Analyze this intent and create:

1. A comprehensive parameter_schema (JSON Schema format) that captures ALL inputs needed
2. Execution logic with system_prompt, template, and output_format

Intent: "${intent}"

Be thorough - identify every variable, option, or configuration that might be needed.
Include sensible defaults and clear descriptions for each parameter.
The template should use {{paramName}} placeholders.`,
        response_json_schema: {
          type: "object",
          properties: {
            parameter_schema: {
              type: "object",
              properties: {
                type: { type: "string" },
                properties: { type: "object" },
                required: { type: "array", items: { type: "string" } }
              }
            },
            logic: {
              type: "object",
              properties: {
                system_prompt: { type: "string" },
                template: { type: "string" },
                output_format: { type: "string" }
              }
            }
          }
        }
      });

      onBothGenerated?.(result.parameter_schema, result.logic);
      toast.success("Schema and logic generated!");
    } catch (error) {
      toast.error("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const improveSchema = async () => {
    if (!currentSchema?.properties || Object.keys(currentSchema.properties).length === 0) {
      toast.error("No schema to improve. Generate one first.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze and improve this parameter schema. Add missing parameters, improve descriptions, add validation constraints, and suggest better types.

Current Schema:
${JSON.stringify(currentSchema, null, 2)}

Original Intent: "${intent || 'Not provided'}"

${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

Return an improved schema with:
- Better descriptions
- Appropriate defaults
- Enum values where applicable
- Proper required fields
- Any missing parameters`,
        response_json_schema: {
          type: "object",
          properties: {
            improved_schema: {
              type: "object",
              properties: {
                type: { type: "string" },
                properties: { type: "object" },
                required: { type: "array", items: { type: "string" } }
              }
            },
            improvements_made: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setSuggestions({
        type: "schema",
        data: result.improved_schema,
        changes: result.improvements_made
      });
      toast.success("Improvements ready for review!");
    } catch (error) {
      toast.error("Failed to analyze schema");
    } finally {
      setIsGenerating(false);
    }
  };

  const improveLogic = async () => {
    if (!currentLogic) {
      toast.error("No logic to improve. Generate one first.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze and improve this execution logic. Make it more robust, clearer, and effective.

Current Logic:
${JSON.stringify(currentLogic, null, 2)}

Current Schema Parameters:
${JSON.stringify(currentSchema?.properties || {}, null, 2)}

Original Intent: "${intent || 'Not provided'}"

${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

Return improved logic with:
- Clearer system prompt
- Better template with all parameters used appropriately
- Proper output format specification`,
        response_json_schema: {
          type: "object",
          properties: {
            improved_logic: {
              type: "object",
              properties: {
                system_prompt: { type: "string" },
                template: { type: "string" },
                output_format: { type: "string" }
              }
            },
            improvements_made: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setSuggestions({
        type: "logic",
        data: result.improved_logic,
        changes: result.improvements_made
      });
      toast.success("Improvements ready for review!");
    } catch (error) {
      toast.error("Failed to analyze logic");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBoilerplate = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please describe what kind of configuration you need");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete command packet configuration based on this description:

"${customPrompt}"

Create a production-ready schema and logic for this use case.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            parameter_schema: {
              type: "object",
              properties: {
                type: { type: "string" },
                properties: { type: "object" },
                required: { type: "array", items: { type: "string" } }
              }
            },
            logic: {
              type: "object",
              properties: {
                system_prompt: { type: "string" },
                template: { type: "string" },
                output_format: { type: "string" }
              }
            }
          }
        }
      });

      setSuggestions({
        type: "boilerplate",
        data: result,
        changes: [`Generated "${result.name}" configuration`]
      });
      toast.success("Boilerplate generated!");
    } catch (error) {
      toast.error("Failed to generate boilerplate");
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestions) return;

    if (suggestions.type === "schema") {
      onSchemaGenerated?.(suggestions.data);
    } else if (suggestions.type === "logic") {
      onLogicGenerated?.(suggestions.data);
    } else if (suggestions.type === "boilerplate") {
      onBothGenerated?.(suggestions.data.parameter_schema, suggestions.data.logic);
    }
    
    setSuggestions(null);
    toast.success("Applied!");
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-white">AI Assistant</h3>
          <p className="text-xs text-slate-400">Generate and improve schemas & logic</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/5 border border-white/10 mb-4">
          <TabsTrigger value="generate" className="flex-1 data-[state=active]:bg-white/10">
            <Wand2 className="mr-2 h-3 w-3" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="improve" className="flex-1 data-[state=active]:bg-white/10">
            <Lightbulb className="mr-2 h-3 w-3" />
            Improve
          </TabsTrigger>
          <TabsTrigger value="boilerplate" className="flex-1 data-[state=active]:bg-white/10">
            <Code className="mr-2 h-3 w-3" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-3">
          <p className="text-sm text-slate-400">
            Generate parameter schema and logic from your intent description.
          </p>
          <Button
            onClick={generateFromIntent}
            disabled={isGenerating || !intent}
            className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate from Intent
          </Button>
        </TabsContent>

        <TabsContent value="improve" className="space-y-3">
          <Textarea
            placeholder="Optional: Describe specific improvements you want..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[60px]"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={improveSchema}
              disabled={isGenerating}
              className="border-white/20 text-slate-300 hover:bg-white/10"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <FileJson className="mr-2 h-3 w-3" />
              )}
              Improve Schema
            </Button>
            <Button
              variant="outline"
              onClick={improveLogic}
              disabled={isGenerating}
              className="border-white/20 text-slate-300 hover:bg-white/10"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3 w-3" />
              )}
              Improve Logic
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="boilerplate" className="space-y-3">
          <Textarea
            placeholder="Describe the command packet you want to create (e.g., 'A packet for sending personalized email campaigns with templates and tracking')"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
          />
          <Button
            onClick={generateBoilerplate}
            disabled={isGenerating || !customPrompt}
            className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Code className="mr-2 h-4 w-4" />
            )}
            Generate Template
          </Button>
        </TabsContent>
      </Tabs>

      {/* Suggestions Panel */}
      {suggestions && (
        <div className="mt-4 p-3 rounded-lg bg-[#4bce2a]/10 border border-[#4bce2a]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[#4bce2a]">Suggestions Ready</p>
            <Button
              size="sm"
              onClick={applySuggestion}
              className="bg-[#4bce2a] hover:bg-[#4bce2a]/80 text-black h-7"
            >
              Apply
            </Button>
          </div>
          <ul className="text-xs text-slate-300 space-y-1">
            {suggestions.changes?.map((change, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-[#4bce2a]">•</span>
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}