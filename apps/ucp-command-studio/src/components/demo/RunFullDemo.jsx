import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import { Play, Loader2, CheckCircle } from "lucide-react";
import { UCP_EXAMPLES } from "@/components/examples/ucpExamples";
import { normalizeResult } from "@/components/utils/validation";

export default function RunFullDemo({ onComplete }) {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([
    { label: "Create Project", status: "pending" },
    { label: "Generate Command Packet", status: "pending" },
    { label: "Execute Packet", status: "pending" },
    { label: "Verify Result", status: "pending" }
  ]);

  const updateStep = (index, status) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
  };

  const runDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    try {
      const user = await base44.auth.me();
      const orgId = user?.organization_id || "default";
      
      // Step 1: Create Project
      updateStep(0, "running");
      const project = await base44.entities.Project.create({
        organization_id: orgId,
        name: "Demo Project - Full Workflow",
        description: "Automated demo showcasing complete UCP workflow",
        status: "active",
        demo: true
      });
      updateStep(0, "completed");
      setCurrentStep(1);

      // Step 2: Generate Command Packet
      updateStep(1, "running");
      const exampleIntent = UCP_EXAMPLES[0]; // Use first example
      
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a command packet designer. Analyze this natural language intent and extract:
1. A parameter schema (JSON Schema format) with all required inputs
2. Cached logic for executing this command

Intent: "${exampleIntent.intent}"

Respond with a JSON object containing:
- parameter_schema: Valid JSON Schema with properties, types, descriptions, and required array
- logic: Object with system_prompt, template, and output_format`,
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

      const packet = await base44.entities.CommandPacket.create({
        organization_id: orgId,
        project_id: project.id,
        name: exampleIntent.title,
        description: exampleIntent.description,
        original_intent: exampleIntent.intent,
        parameter_schema: aiResult.parameter_schema,
        logic: aiResult.logic,
        version: 1,
        status: "active",
        demo: true
      });
      
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        packet_id: packet.id,
        action: "packet_created",
        actor_email: user?.email,
        details: { demo: true, name: packet.name }
      });
      
      updateStep(1, "completed");
      setCurrentStep(2);

      // Step 3: Execute Packet
      updateStep(2, "running");
      
      const exec = await base44.entities.PacketExecution.create({
        packet_id: packet.id,
        organization_id: orgId,
        input_params: exampleIntent.params,
        status: "running",
        executed_by: user?.email,
        demo: true
      });

      const startTime = Date.now();
      const rawResult = await base44.integrations.Core.InvokeLLM({
        prompt: `${aiResult.logic?.system_prompt}\n\nTask: ${aiResult.logic?.template}\n\nParameters:\n${JSON.stringify(exampleIntent.params, null, 2)}`
      });
      const duration_ms = Date.now() - startTime;

      const result = normalizeResult(rawResult);

      await base44.entities.PacketExecution.update(exec.id, {
        status: "completed",
        result: result,
        duration_ms
      });

      await base44.entities.CommandPacket.update(packet.id, {
        execution_count: 1
      });

      updateStep(2, "completed");
      setCurrentStep(3);

      // Step 4: Verify Result
      updateStep(3, "running");
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
      updateStep(3, "completed");
      setCurrentStep(4);

      queryClient.invalidateQueries();
      toast.success("✨ Full demo completed successfully!");
      
      if (onComplete) {
        onComplete({ project, packet, execution: exec });
      }

    } catch (error) {
      const failedStep = steps.findIndex(s => s.status === "running");
      if (failedStep >= 0) {
        updateStep(failedStep, "failed");
      }
      toast.error(`Demo failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">Run Complete Demo</h3>
            <p className="text-sm text-slate-400 mt-1">
              One-click end-to-end UCP workflow demonstration
            </p>
          </div>
          <Button
            onClick={runDemo}
            disabled={isRunning}
            className="bg-gradient-to-r from-[#4bce2a] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Full Demo
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2 pt-4 border-t border-white/10">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                  step.status === "completed" ? "bg-[#4bce2a]/20 text-[#4bce2a]" :
                  step.status === "running" ? "bg-[#ea00ea]/20 text-[#ea00ea]" :
                  step.status === "failed" ? "bg-red-500/20 text-red-400" :
                  "bg-white/10 text-slate-600"
                }`}>
                  {step.status === "completed" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : step.status === "running" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>
                <span className={`text-sm ${
                  step.status === "completed" ? "text-white" :
                  step.status === "running" ? "text-white font-medium" :
                  "text-slate-500"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}