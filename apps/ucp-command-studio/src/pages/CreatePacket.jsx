import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { requireOrganizationId } from "@/components/utils/organizationGuard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import IntentInput from "@/components/packets/IntentInput";
import SchemaEditor from "@/components/packets/SchemaEditor";
import LogicPreview from "@/components/packets/LogicPreview";
import AIAssistant from "@/components/packets/AIAssistant";
import GlassCard from "@/components/ui/GlassCard";
import { ArrowRight, Save, CheckCircle, Loader2 } from "lucide-react";
import { UCP_EXAMPLES } from "@/components/examples/ucpExamples";

export default function CreatePacket() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [packetData, setPacketData] = useState({
    name: "",
    description: "",
    original_intent: "",
    parameter_schema: { type: "object", properties: {}, required: [] },
    logic: null,
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const interpretIntent = async ({ name, intent, description }) => {
    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a command packet designer. Analyze this natural language intent and extract:
1. A parameter schema (JSON Schema format) with all required inputs
2. Cached logic for executing this command

Intent: "${intent}"

Respond with a JSON object containing:
- parameter_schema: Valid JSON Schema with properties, types, descriptions, and required array
- logic: Object with system_prompt (detailed instructions for execution), template (execution template with {{param}} placeholders), and output_format (expected output structure)

Be thorough in extracting parameters - identify ALL variables that would need to be provided at execution time.`,
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

      setPacketData({
        name,
        description,
        original_intent: intent,
        parameter_schema: result.parameter_schema,
        logic: result.logic,
      });
      setStep(2);
      toast.success("Intent interpreted successfully!");
    } catch (error) {
      toast.error("Failed to interpret intent. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const savePacket = async () => {
    setIsSaving(true);
    try {
      // Validate organization context
      const orgId = requireOrganizationId(user);
      if (!orgId) {
        setIsSaving(false);
        return;
      }

      const packet = await base44.entities.CommandPacket.create({
        organization_id: orgId,
        name: packetData.name,
        description: packetData.description,
        original_intent: packetData.original_intent,
        parameter_schema: packetData.parameter_schema,
        logic: packetData.logic,
        version: 1,
        status: "draft",
      });

      await base44.entities.AuditLog.create({
        organization_id: orgId,
        packet_id: packet.id,
        action: "packet_created",
        actor_email: user?.email || "unknown",
        details: { name: packetData.name }
      });

      toast.success("Packet created successfully!");
      navigate(createPageUrl(`PacketDetail?id=${packet.id}`));
    } catch (error) {
      toast.error("Failed to save packet.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[
          { num: 1, label: "Define Intent" },
          { num: 2, label: "Review Schema" },
          { num: 3, label: "Confirm & Save" },
        ].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
                step >= num
                  ? "bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white"
                  : "bg-white/10 text-gray-500"
              }`}
            >
              {step > num ? <CheckCircle className="h-4 w-4" /> : num}
            </div>
            <span className={step >= num ? "text-white" : "text-slate-500"}>{label}</span>
            {num < 3 && <ArrowRight className="h-4 w-4 text-slate-600 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Intent Input */}
      {step === 1 && (
        <IntentInput onInterpret={interpretIntent} isProcessing={isProcessing} />
      )}

      {/* Step 2: Schema & Logic Review */}
      {step === 2 && (
        <div className="space-y-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{packetData.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{packetData.original_intent}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-white/20 text-slate-300"
              >
                Edit Intent
              </Button>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SchemaEditor
                schema={packetData.parameter_schema}
                onChange={(schema) => setPacketData({ ...packetData, parameter_schema: schema })}
              />

              <LogicPreview
                logic={packetData.logic}
                onChange={(logic) => setPacketData({ ...packetData, logic })}
              />
            </div>

            <div className="lg:col-span-1">
              <AIAssistant
                currentSchema={packetData.parameter_schema}
                currentLogic={packetData.logic}
                intent={packetData.original_intent}
                onSchemaGenerated={(schema) => setPacketData({ ...packetData, parameter_schema: schema })}
                onLogicGenerated={(logic) => setPacketData({ ...packetData, logic })}
                onBothGenerated={(schema, logic) => setPacketData({ ...packetData, parameter_schema: schema, logic })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="border-white/20 text-slate-300"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm & Save */}
      {step === 3 && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">Confirm Packet Creation</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="text-white">{packetData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Parameters</p>
                  <p className="text-white">{Object.keys(packetData.parameter_schema?.properties || {}).length} defined</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-400">Original Intent</p>
                <p className="text-slate-300 mt-1">{packetData.original_intent}</p>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-300">
                  The packet will be created as a <strong>draft</strong>. You can sign and activate it later.
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="border-white/20 text-slate-300"
            >
              Back
            </Button>
            <Button
              onClick={savePacket}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Packet
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}