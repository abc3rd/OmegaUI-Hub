import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import ParameterForm from "@/components/execution/ParameterForm";
import ExecutionResult from "@/components/execution/ExecutionResult";
import { Play, Loader2, Package, Shield, Lightbulb } from "lucide-react";
import { UCP_EXAMPLES, getExample } from "@/components/examples/ucpExamples";
import { normalizeResult } from "@/components/utils/validation";

export default function ExecutePacket() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedPacketId = urlParams.get("packetId");

  const [user, setUser] = useState(null);
  const [selectedPacketId, setSelectedPacketId] = useState(preselectedPacketId || "");
  const [selectedExampleId, setSelectedExampleId] = useState("");
  const [parameters, setParameters] = useState({});
  const [execution, setExecution] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Load last selected example from localStorage
  useEffect(() => {
    const lastExample = localStorage.getItem('last_selected_example');
    if (lastExample && !preselectedPacketId) {
      setSelectedExampleId(lastExample);
    }
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: packets = [] } = useQuery({
    queryKey: ["packets-for-execution"],
    queryFn: () => base44.entities.CommandPacket.list("-created_date"),
  });

  const selectedPacket = packets.find(p => p.id === selectedPacketId);

  useEffect(() => {
    if (selectedPacket) {
      // Initialize parameters with empty values or example values
      const initialParams = {};
      const example = selectedExampleId ? getExample(selectedExampleId) : null;
      
      Object.keys(selectedPacket.parameter_schema?.properties || {}).forEach(key => {
        // Use example params if available, otherwise empty string
        initialParams[key] = example?.params?.[key] ?? "";
      });
      setParameters(initialParams);
      setExecution(null);
    }
  }, [selectedPacketId, selectedExampleId]);

  // Handle example selection
  const handleExampleChange = (exampleId) => {
    setSelectedExampleId(exampleId);
    localStorage.setItem('last_selected_example', exampleId);
    
    const example = getExample(exampleId);
    if (example && selectedPacket) {
      // Populate parameters from example
      const newParams = {};
      Object.keys(selectedPacket.parameter_schema?.properties || {}).forEach(key => {
        newParams[key] = example.params?.[key] ?? parameters[key] ?? "";
      });
      setParameters(newParams);
      toast.success(`Example loaded: ${example.title}`);
    }
  };

  const validateParameters = () => {
    const required = selectedPacket?.parameter_schema?.required || [];
    for (const key of required) {
      if (!parameters[key] && parameters[key] !== 0 && parameters[key] !== false) {
        return false;
      }
    }
    return true;
  };

  const executePacket = async () => {
    if (!validateParameters()) {
      toast.error("Please fill in all required parameters");
      return;
    }

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      // Create execution record
      const exec = await base44.entities.PacketExecution.create({
        packet_id: selectedPacketId,
        organization_id: user?.organization_id || "default",
        input_params: parameters,
        status: "running",
        executed_by: user?.email,
      });

      // Build the prompt from template
      let prompt = selectedPacket.logic?.template || "";
      Object.entries(parameters).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
      });

      // Build full prompt with context
      const systemPrompt = selectedPacket.logic?.system_prompt || "You are a helpful assistant. Execute the following command and provide a clear response.";
      const templatePrompt = prompt || selectedPacket.original_intent || "Please process this request.";
      const fullPrompt = `${systemPrompt}\n\nTask: ${templatePrompt}\n\nParameters provided:\n${JSON.stringify(parameters, null, 2)}`;

      // Execute via LLM
      const rawResult = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
      });

      const duration_ms = Date.now() - startTime;

      // Normalize result using utility function
      const result = normalizeResult(rawResult);

      // Update execution record
      await base44.entities.PacketExecution.update(exec.id, {
        status: "completed",
        result: result,
        duration_ms,
      });

      // Update packet execution count
      await base44.entities.CommandPacket.update(selectedPacketId, {
        execution_count: (selectedPacket.execution_count || 0) + 1,
      });

      // Log audit
      await base44.entities.AuditLog.create({
        organization_id: user?.organization_id || "default",
        packet_id: selectedPacketId,
        action: "packet_executed",
        actor_email: user?.email,
        details: { duration_ms },
      });

      setExecution({ ...exec, status: "completed", result, duration_ms, created_date: new Date().toISOString() });
      queryClient.invalidateQueries(["packets"]);
      
      // Sync to Google Sheets (optional - requires spreadsheetId in settings)
      const spreadsheetId = localStorage.getItem('sheets_spreadsheet_id');
      if (spreadsheetId) {
        try {
          await base44.functions.invoke('syncToSheets', {
            spreadsheetId,
            sheetName: 'Executions',
            data: {
              packet_name: selectedPacket.name,
              parameters: JSON.stringify(parameters),
              status: 'completed',
              duration_ms,
              result: JSON.stringify(result)
            }
          });
        } catch (error) {
          console.error('Failed to sync to Sheets:', error);
        }
      }
      
      toast.success("Execution completed!");
    } catch (error) {
      const duration_ms = Date.now() - startTime;
      setExecution({
        status: "failed",
        error_message: error.message,
        duration_ms,
        created_date: new Date().toISOString(),
      });
      toast.error("Execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Example Library */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-[#ea00ea]" />
          <h3 className="font-medium text-white">Guided Examples</h3>
        </div>
        <Select value={selectedExampleId} onValueChange={handleExampleChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Choose an example workflow to get started..." />
          </SelectTrigger>
          <SelectContent className="bg-[#16161c] border-white/10">
            {UCP_EXAMPLES.map((example) => (
              <SelectItem key={example.id} value={example.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{example.title}</span>
                  <span className="text-xs text-slate-400">{example.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedExampleId && (
          <div className="mt-3 p-3 rounded-lg bg-[#ea00ea]/10 border border-[#ea00ea]/20">
            <p className="text-sm text-slate-300">
              💡 <strong>Next step:</strong> Select a packet below or run the demo to create one automatically
            </p>
          </div>
        )}
      </GlassCard>

      {/* Packet Selection */}
      <GlassCard className="p-6">
        <h3 className="font-medium text-white mb-4">Select Command Packet</h3>
        <Select value={selectedPacketId} onValueChange={setSelectedPacketId}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Choose a packet to execute..." />
          </SelectTrigger>
          <SelectContent className="bg-[#16161c] border-white/10">
            {packets.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No active packets available
              </div>
            ) : (
              packets.map((packet) => (
                <SelectItem key={packet.id} value={packet.id}>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#2699fe]" />
                    {packet.name}
                    <span className="text-xs text-slate-500">v{packet.version}</span>
                    {packet.signature && <Shield className="h-3 w-3 text-[#4bce2a]" />}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </GlassCard>

      {/* Selected Packet Info */}
      {selectedPacket && (
        <>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{selectedPacket.name}</h3>
                  <StatusBadge status={selectedPacket.status} />
                </div>
                <p className="text-sm text-slate-400 mt-1">{selectedPacket.description || selectedPacket.original_intent}</p>
              </div>
              {selectedPacket.signature && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#4bce2a]/20 text-[#4bce2a] text-xs">
                  <Shield className="h-3 w-3" />
                  Verified
                </div>
              )}
            </div>
          </GlassCard>

          {/* Parameter Form */}
          <ParameterForm
            schema={selectedPacket.parameter_schema}
            values={parameters}
            onChange={setParameters}
          />

          {/* Execute Button */}
          <Button
            onClick={executePacket}
            disabled={isExecuting}
            className="w-full h-12 bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Execute Command
              </>
            )}
          </Button>

          {/* Execution Result */}
          {execution && <ExecutionResult execution={execution} />}
        </>
      )}
    </div>
  );
}