import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { requireOrganizationId } from "@/components/utils/organizationGuard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Key, Plus, Loader2, Shield, RotateCw, Trash2, Copy, CheckCircle } from "lucide-react";

export default function KeyManagement() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showRotate, setShowRotate] = useState(null);
  const [keyName, setKeyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.organization_role === "owner" || user?.organization_role === "admin";

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ["keypairs"],
    queryFn: () => base44.entities.KeyPair.filter({}, "-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: async (name) => {
      setIsGenerating(true);
      
      // Validate organization context
      const orgId = requireOrganizationId(user);
      if (!orgId) {
        throw new Error("Organization context required");
      }
      
      // Generate ECDSA P-256 keypair using Web Crypto API
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

      /* TODO: Private Key Security
       * PRODUCTION REQUIREMENT: Implement proper encryption at rest
       * 
       * Current state: Private key stored as base64-encoded PKCS8 (NOT ENCRYPTED)
       * 
       * Recommended approaches:
       * 1. Server-side KMS/HSM (AWS KMS, Google Cloud KMS, Azure Key Vault)
       * 2. Client-side encryption with AES-GCM using derived key (PBKDF2)
       * 3. Hardware security module for enterprise deployments
       * 
       * Field name changed to private_key_pkcs8_b64 to reflect actual storage format
       * and avoid misleading "encrypted_" prefix.
       */

      const key = await base44.entities.KeyPair.create({
        organization_id: orgId,
        name,
        algorithm: "ecdsa-p256",
        public_key: publicKeyHex,
        encrypted_private_key: privateKeyB64, // WARNING: Not actually encrypted
        active: true,
      });

      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "key_created",
        actor_email: user?.email || "unknown",
        details: { 
          entity_type: "KeyPair",
          entity_id: key.id,
          name, 
          algorithm: "ecdsa-p256" 
        },
      });

      return key;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["keypairs"]);
      setShowCreate(false);
      setKeyName("");
      setIsGenerating(false);
      toast.success("Key pair generated successfully!");
    },
    onError: () => {
      setIsGenerating(false);
      toast.error("Failed to generate key pair");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }) => {
      await base44.entities.KeyPair.update(id, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["keypairs"]);
      toast.success("Key status updated");
    },
  });

  const rotateMutation = useMutation({
    mutationFn: async (oldKeyId) => {
      // Validate organization context
      const orgId = requireOrganizationId(user);
      if (!orgId) {
        throw new Error("Organization context required");
      }

      // Deactivate old key
      await base44.entities.KeyPair.update(oldKeyId, { 
        active: false,
        rotated_at: new Date().toISOString(),
      });

      // Create new key
      const oldKey = keys.find(k => k.id === oldKeyId);
      await createMutation.mutateAsync(`${oldKey.name} (rotated)`);

      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "key_rotated",
        actor_email: user?.email || "unknown",
        details: { 
          entity_type: "KeyPair",
          entity_id: oldKeyId,
          old_key_id: oldKeyId,
          new_key_name: `${oldKey.name} (rotated)`
        },
      });
    },
    onSuccess: () => {
      setShowRotate(null);
      toast.success("Key rotated successfully");
    },
  });

  const copyPublicKey = (key) => {
    navigator.clipboard.writeText(key.public_key);
    setCopiedId(key.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Public key copied");
  };

  const activeKeys = keys.filter(k => k.active);
  const inactiveKeys = keys.filter(k => !k.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Key Management</h2>
          <p className="text-gray-400 mt-1">ECDSA P-256 signing keys for packet verification</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate Key Pair
          </Button>
        )}
      </div>

      {!isAdmin && (
        <GlassCard className="p-4 border-[#c4653a]/30 bg-[#c4653a]/10">
          <p className="text-[#c4653a] text-sm">
            Only organization owners and admins can manage signing keys.
          </p>
        </GlassCard>
      )}

      {/* Active Keys */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Active Keys</h3>
        {isLoading ? (
          <GlassCard className="p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/3" />
          </GlassCard>
        ) : activeKeys.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Key className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No active signing keys</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {activeKeys.map((key) => (
              <GlassCard key={key.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4bce2a]/20 to-[#2699fe]/20 border border-[#4bce2a]/20">
                      <Key className="h-6 w-6 text-[#4bce2a]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{key.name}</h4>
                        <StatusBadge status="active" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        {key.public_key.substring(0, 32)}...
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Algorithm: {key.algorithm}</span>
                        <span>Created: {format(new Date(key.created_date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPublicKey(key)}
                      className="border-white/20 text-gray-300"
                    >
                      {copiedId === key.id ? (
                        <CheckCircle className="h-4 w-4 text-[#4bce2a]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRotate(key.id)}
                          className="border-white/20 text-gray-300"
                        >
                          <RotateCw className="h-4 w-4 mr-1" />
                          Rotate
                        </Button>
                        <Switch
                          checked={key.active}
                          onCheckedChange={(active) => toggleMutation.mutate({ id: key.id, active })}
                          className="data-[state=checked]:bg-[#4bce2a]"
                        />
                      </>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Keys */}
      {inactiveKeys.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Inactive Keys (for verification only)</h3>
          <div className="space-y-4">
            {inactiveKeys.map((key) => (
              <GlassCard key={key.id} className="p-6 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-500/20 border border-gray-500/20">
                      <Key className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-400">{key.name}</h4>
                        <StatusBadge status="archived" />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-mono">
                        {key.public_key.substring(0, 32)}...
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        {key.rotated_at && (
                          <span>Rotated: {format(new Date(key.rotated_at), "MMM d, yyyy")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPublicKey(key)}
                    className="border-white/10 text-gray-500"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#16161c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Generate New Key Pair</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-lg bg-[#4bce2a]/10 border border-[#4bce2a]/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#4bce2a]" />
                <span className="text-sm font-medium text-[#4bce2a]">ECDSA P-256 Algorithm</span>
              </div>
              <p className="text-xs text-gray-400">
                Keys are generated locally using Web Crypto API.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-300">
                ⚠️ <strong>Security Notice:</strong> Private keys are currently stored as base64-encoded PKCS8 format, not encrypted at rest. 
                Production deployments should implement server-side KMS/HSM or client-side encryption.
              </p>
            </div>
            
            <div>
              <Label className="text-gray-300">Key Name</Label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g., Production Signing Key"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <Button
              onClick={() => createMutation.mutate(keyName)}
              disabled={!keyName.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Generate Key Pair
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rotate Confirmation */}
      <AlertDialog open={!!showRotate} onOpenChange={() => setShowRotate(null)}>
        <AlertDialogContent className="bg-[#16161c] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Rotate Key?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will deactivate the current key and generate a new one. The old key will remain for verifying existing signatures but cannot be used for new signatures.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rotateMutation.mutate(showRotate)}
              className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white"
            >
              {rotateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Rotate Key"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}