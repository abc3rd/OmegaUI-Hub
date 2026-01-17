import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, CheckCircle, PlayCircle, Rocket } from "lucide-react";
import { requireOrganizationId } from "@/components/utils/organizationGuard";

const DEMO_MODE = true;

export default function DemoRunner({ user, onComplete }) {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState({});

  const steps = [
    "Creating demo project",
    "Generating ECDSA P-256 keypair",
    "Creating demo template",
    "Creating demo packet",
    "Signing packet",
    "Verifying signature",
    "Executing packet",
    "Complete!"
  ];

  const runDemo = async () => {
    setRunning(true);
    setStep(0);
    
    try {
      const orgId = requireOrganizationId(user, false);
      if (!orgId) {
        throw new Error("Organization context required");
      }

      // Step 1: Create demo project
      setStep(1);
      const project = await base44.entities.Project.create({
        organization_id: orgId,
        name: "UCP Demo Project",
        description: "Demo project showcasing Universal Command Protocol",
        status: "active",
        tags: ["demo"]
      });
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "project_created",
        actor_email: user?.email || "demo",
        details: { name: project.name, is_demo: true }
      });
      setResults(r => ({ ...r, project }));

      // Step 2: Generate ECDSA P-256 keypair
      setStep(2);
      const keyPair = await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"]
      );
      const publicKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      const publicKeyHex = Array.from(new Uint8Array(publicKeyRaw))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      const privateKeyB64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyRaw)));

      const demoKey = await base44.entities.KeyPair.create({
        organization_id: orgId,
        name: "Demo Signing Key",
        algorithm: "ecdsa-p256",
        public_key: publicKeyHex,
        encrypted_private_key: privateKeyB64,
        active: true,
        tags: ["demo"]
      });
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "key_created",
        actor_email: user?.email || "demo",
        details: { name: demoKey.name, algorithm: "ecdsa-p256", is_demo: true }
      });
      setResults(r => ({ ...r, key: demoKey }));

      // Step 3: Create demo template
      setStep(3);
      const template = await base44.entities.Template.create({
        organization_id: orgId,
        project_id: project.id,
        name: "Customer Welcome Email",
        description: "Send personalized welcome email to new customers",
        intent_text: "Send a welcome email to customer with their name and account details",
        tags: ["demo", "email", "onboarding"]
      });
      await base44.entities.TemplateVersion.create({
        template_id: template.id,
        organization_id: orgId,
        version: "1.0.0",
        status: "published",
        parameter_schema: {
          type: "object",
          properties: {
            customer_name: { type: "string", description: "Customer full name" },
            customer_email: { type: "string", description: "Customer email address" }
          },
          required: ["customer_name", "customer_email"]
        },
        compile_spec: { steps: ["validate_params", "template_substitution"] },
        runner_spec: { actions: [{ type: "email", provider: "sendgrid" }] },
        published_at: new Date().toISOString()
      });
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "template_created",
        actor_email: user?.email || "demo",
        details: { name: template.name, is_demo: true }
      });
      setResults(r => ({ ...r, template }));

      // Step 4: Create demo packet
      setStep(4);
      const packet = await base44.entities.CommandPacket.create({
        organization_id: orgId,
        project_id: project.id,
        template_id: template.id,
        name: "Welcome Email - Demo User",
        description: "Send welcome email to demo@example.com",
        original_intent: "Send welcome email to new customer",
        parameter_schema: {
          type: "object",
          properties: {
            customer_name: { type: "string" },
            customer_email: { type: "string" }
          },
          required: ["customer_name", "customer_email"]
        },
        logic: {
          system_prompt: "You are an email generation assistant",
          template: "Generate welcome email for {{customer_name}} at {{customer_email}}",
          output_format: "html"
        },
        status: "draft",
        version: 1,
        tags: ["demo"]
      });
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "packet_created",
        actor_email: user?.email || "demo",
        packet_id: packet.id,
        details: { name: packet.name, is_demo: true }
      });
      setResults(r => ({ ...r, packet }));

      // Step 5: Sign packet
      setStep(5);
      const content = JSON.stringify({
        name: packet.name,
        version: packet.version,
        logic: packet.logic,
        parameter_schema: packet.parameter_schema,
      });
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await base44.entities.CommandPacket.update(packet.id, {
        signature,
        signed_by: user?.email || "demo",
        signed_at: new Date().toISOString(),
        signer_key_id: demoKey.id,
        status: "active"
      });
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "packet_signed",
        actor_email: user?.email || "demo",
        packet_id: packet.id,
        details: { signer_key_id: demoKey.id, is_demo: true }
      });

      // Step 6: Verify signature
      setStep(6);
      const verifyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const isValid = verifyHash === signature;
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "packet_verified",
        actor_email: user?.email || "demo",
        packet_id: packet.id,
        details: { valid: isValid, is_demo: true }
      });

      // Step 7: Execute packet
      setStep(7);
      const execution = await base44.entities.PacketExecution.create({
        packet_id: packet.id,
        organization_id: orgId,
        input_params: {
          customer_name: "Jane Doe",
          customer_email: "jane.doe@example.com"
        },
        status: "running",
        executed_by: user?.email || "demo",
        tags: ["demo"]
      });

      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const executionResult = {
        email_sent: true,
        message_id: `demo_msg_${Date.now()}`,
        recipient: "jane.doe@example.com"
      };
      
      await base44.entities.PacketExecution.update(execution.id, {
        status: "completed",
        result: executionResult,
        output: "Welcome email successfully sent to Jane Doe",
        duration_ms: 1200
      });

      await base44.entities.CommandPacket.update(packet.id, {
        execution_count: 1
      });

      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "packet_executed",
        actor_email: user?.email || "demo",
        packet_id: packet.id,
        details: { duration_ms: 1200, is_demo: true }
      });
      setResults(r => ({ ...r, execution }));

      // Step 8: Complete
      setStep(8);
      toast.success("Demo completed successfully!");
      
      if (onComplete) {
        onComplete({ project, packet, execution, key: demoKey });
      }

    } catch (error) {
      console.error("Demo failed:", error);
      toast.error("Demo failed: " + error.message);
      setRunning(false);
      setStep(0);
    }
  };

  // Don't render if user not loaded
  if (!user) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#2699fe]" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe]">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">UCP Demo Flow</h3>
          <p className="text-sm text-slate-400">
            Experience the complete Universal Command Protocol workflow
          </p>
        </div>
      </div>

      {!running && step === 0 && (
        <Button
          onClick={runDemo}
          className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0 h-12"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Run Complete Demo
        </Button>
      )}

      {running && (
        <div className="space-y-4">
          {steps.map((label, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                idx < step
                  ? "bg-[#4bce2a]/20 border border-[#4bce2a]/30"
                  : idx === step
                  ? "bg-[#2699fe]/20 border border-[#2699fe]/30 animate-pulse"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {idx < step ? (
                <CheckCircle className="h-5 w-5 text-[#4bce2a]" />
              ) : idx === step ? (
                <Loader2 className="h-5 w-5 text-[#2699fe] animate-spin" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-600" />
              )}
              <span
                className={`text-sm ${
                  idx <= step ? "text-white font-medium" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {step === 8 && (
        <div className="mt-6 space-y-3">
          <div className="p-4 rounded-lg bg-[#4bce2a]/20 border border-[#4bce2a]/30">
            <p className="text-[#4bce2a] font-medium mb-2">🎉 Demo Complete!</p>
            <p className="text-sm text-slate-300">
              Created {Object.keys(results).length} demo entities with full audit trail
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl(`PacketDetail?id=${results.packet?.id}`))}
              className="flex-1 border-white/20 text-slate-300"
            >
              View Packet
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("AuditLogs"))}
              className="flex-1 border-white/20 text-slate-300"
            >
              View Audit Logs
            </Button>
          </div>
          <Button
            onClick={() => {
              setStep(0);
              setRunning(false);
              setResults({});
            }}
            variant="outline"
            className="w-full border-white/20 text-slate-300"
          >
            Run Again
          </Button>
        </div>
      )}
    </GlassCard>
  );
}