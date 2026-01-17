import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { requireOrganizationId } from "@/components/utils/organizationGuard";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/ui/GlassCard";
import QRGenerator from "@/components/share/QRGenerator";
import SignatureVerifier from "@/components/share/SignatureVerifier";
import { Package, QrCode, Shield, Upload, Link2, Loader2 } from "lucide-react";

export default function ShareVerify() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedPacketId = urlParams.get("packetId");

  const [user, setUser] = useState(null);
  const [selectedPacketId, setSelectedPacketId] = useState(preselectedPacketId || "");
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: packets = [] } = useQuery({
    queryKey: ["packets"],
    queryFn: () => base44.entities.CommandPacket.list("-created_date"),
  });

  const selectedPacket = packets.find(p => p.id === selectedPacketId);

  const generateShareData = () => {
    if (!selectedPacket) return null;
    
    return {
      type: "ucp_command_packet",
      version: "1.0",
      packet: {
        id: selectedPacket.id,
        name: selectedPacket.name,
        version: selectedPacket.version,
        description: selectedPacket.description,
        parameter_schema: selectedPacket.parameter_schema,
        logic: selectedPacket.logic,
        signature: selectedPacket.signature,
        signed_by: selectedPacket.signed_by,
        signed_at: selectedPacket.signed_at,
      },
      exported_at: new Date().toISOString(),
    };
  };

  const generateReferenceData = () => {
    if (!selectedPacket) return null;
    
    return {
      type: "ucp_packet_reference",
      version: "1.0",
      packet_id: selectedPacket.id,
      packet_name: selectedPacket.name,
      packet_version: selectedPacket.version,
      signature: selectedPacket.signature,
      exported_at: new Date().toISOString(),
    };
  };

  const importPacket = async () => {
    setIsImporting(true);
    try {
      // Validate organization context
      const orgId = requireOrganizationId(user);
      if (!orgId) {
        setIsImporting(false);
        return;
      }

      const data = JSON.parse(importData);
      
      if (data.type === "ucp_command_packet") {
        // Full packet import
        const newPacket = await base44.entities.CommandPacket.create({
          organization_id: orgId,
          name: data.packet.name + " (Imported)",
          description: data.packet.description,
          original_intent: "Imported packet",
          parameter_schema: data.packet.parameter_schema,
          logic: data.packet.logic,
          signature: data.packet.signature,
          signed_by: data.packet.signed_by,
          signed_at: data.packet.signed_at,
          version: 1,
          status: "draft",
        });

        await base44.entities.AuditLog.create({
          organization_id: orgId,
          packet_id: newPacket.id,
          action: "packet_imported",
          actor_email: user?.email || "unknown",
          details: { source: "import", original_id: data.packet.id },
        });

        queryClient.invalidateQueries(["packets"]);
        toast.success("Packet imported successfully!");
        setImportData("");
      } else if (data.type === "ucp_packet_reference") {
        toast.info("Packet reference detected. In a production system, this would fetch the packet from the network.");
      } else {
        throw new Error("Unknown data format");
      }
    } catch (error) {
      toast.error("Failed to import: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const logShare = async () => {
    if (!selectedPacket) return;
    
    const orgId = requireOrganizationId(user);
    if (!orgId) return;

    await base44.entities.AuditLog.create({
      organization_id: orgId,
      packet_id: selectedPacketId,
      action: "packet_shared",
      actor_email: user?.email || "unknown",
      details: { method: "qr_code" },
    });
    
    toast.success("Share recorded in audit log");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="share" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="share" className="data-[state=active]:bg-white/10">
            <QrCode className="mr-2 h-4 w-4" />
            Share via QR
          </TabsTrigger>
          <TabsTrigger value="verify" className="data-[state=active]:bg-white/10">
            <Shield className="mr-2 h-4 w-4" />
            Verify Signature
          </TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-white/10">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="share">
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-medium text-white mb-4">Select Packet to Share</h3>
              <Select value={selectedPacketId} onValueChange={setSelectedPacketId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose a packet..." />
                </SelectTrigger>
                <SelectContent className="bg-[#16161c] border-white/10">
                  {packets.map((packet) => (
                    <SelectItem key={packet.id} value={packet.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#2699fe]" />
                        {packet.name}
                        <span className="text-xs text-slate-500">v{packet.version}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </GlassCard>

            {selectedPacket && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QRGenerator
                  data={generateShareData()}
                  title="Full Packet"
                  subtitle="Contains complete packet data for offline use"
                />
                <QRGenerator
                  data={generateReferenceData()}
                  title="Packet Reference"
                  subtitle="Lightweight reference for online fetch"
                />
              </div>
            )}

            {selectedPacket && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={logShare}
                  className="border-white/20 text-slate-300"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Record Share in Audit Log
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="verify">
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-medium text-white mb-4">Select Packet to Verify</h3>
              <Select value={selectedPacketId} onValueChange={setSelectedPacketId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose a packet..." />
                </SelectTrigger>
                <SelectContent className="bg-[#16161c] border-white/10">
                  {packets.filter(p => p.signature).map((packet) => (
                    <SelectItem key={packet.id} value={packet.id}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#4bce2a]" />
                        {packet.name}
                        <span className="text-xs text-slate-500">v{packet.version}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </GlassCard>

            {selectedPacket && (
              <SignatureVerifier
                packet={selectedPacket}
                onVerify={async (valid) => {
                  const orgId = requireOrganizationId(user, false);
                  if (!orgId) return;

                  await base44.entities.AuditLog.create({
                    organization_id: orgId,
                    packet_id: selectedPacketId,
                    action: "packet_verified",
                    actor_email: user?.email || "unknown",
                    details: { valid },
                  });
                }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="import">
          <GlassCard className="p-6">
            <h3 className="font-medium text-white mb-4">Import Packet</h3>
            <p className="text-sm text-slate-400 mb-4">
              Paste the exported packet JSON or scan a QR code and paste the data here.
            </p>
            
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='{"type": "ucp_command_packet", ...}'
              className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-slate-500 font-mono text-sm mb-4"
            />

            <Button
              onClick={importPacket}
              disabled={!importData.trim() || isImporting}
              className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Packet
                </>
              )}
            </Button>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}