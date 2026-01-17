import GlassCard from "@/components/ui/GlassCard";
import { AlertTriangle, Shield, Database, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function SecurityAuditReport() {
  return (
    <div className="space-y-6 max-w-5xl">
      <GlassCard className="p-6 border-[#ea00ea]/30">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ea00ea]/20">
            <Shield className="h-6 w-6 text-[#ea00ea]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Security & Deployment Audit Report</h2>
            <p className="text-slate-400 text-sm">
              Comprehensive review of entity schemas, cryptographic implementation, and deployment configuration
            </p>
            <p className="text-slate-500 text-xs mt-1">Last updated: December 22, 2025</p>
          </div>
        </div>
      </GlassCard>

      {/* Critical Issues */}
      <GlassCard className="p-6 border-red-500/30 bg-red-500/5">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Critical Security Issues</h3>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-300 font-medium mb-1">🔴 Private Keys Not Encrypted</p>
            <p className="text-sm text-slate-400">
              Private keys stored as base64-encoded PKCS8 (plaintext). Production requires KMS/HSM integration or AES-GCM client-side encryption.
            </p>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Location: pages/KeyManagement.jsx:94
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-300 font-medium mb-1">🔴 Hash-Based Signatures Only</p>
            <p className="text-sm text-slate-400">
              Current implementation uses SHA-256 hash, not cryptographic ECDSA signatures. Stored keypairs are not being used for signing.
            </p>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Location: pages/PacketDetail.jsx:84-94
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Schema Mismatches */}
      <GlassCard className="p-6 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Schema & Data Integrity Issues</h3>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-300 font-medium mb-1">⚠️ AuditLog Field Mismatch</p>
            <p className="text-sm text-slate-400 mb-2">
              Entity schema declares <code className="px-1 py-0.5 bg-white/10 rounded">action_type</code> and <code className="px-1 py-0.5 bg-white/10 rounded">metadata</code>, 
              but code uses <code className="px-1 py-0.5 bg-white/10 rounded">action</code> and <code className="px-1 py-0.5 bg-white/10 rounded">details</code>
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Schema: entities/AuditLog.json | Code: pages/AuditLogs.jsx:72,84,210
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-300 font-medium mb-1">⚠️ KeyPair Algorithm Mismatch</p>
            <p className="text-sm text-slate-400 mb-2">
              Schema declares algorithm as "ed25519" but implementation uses ECDSA P-256 (Web Crypto API)
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Schema: entities/KeyPair.json | Code: pages/KeyManagement.jsx:62-66
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Entity Schemas */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-[#2699fe]" />
          <h3 className="text-lg font-semibold text-white">Entity Schemas Overview</h3>
        </div>
        <div className="space-y-4">
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10">
              <p className="text-white font-medium">AuditLog</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Required:</span>
                <code className="text-[#4bce2a] bg-white/5 px-2 py-0.5 rounded">organization_id</code>
                <code className="text-[#4bce2a] bg-white/5 px-2 py-0.5 rounded">actor_email</code>
                <code className="text-red-400 bg-white/5 px-2 py-0.5 rounded line-through">action_type</code>
                <span className="text-xs text-amber-400">→ use "action"</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Optional:</span>
                <code className="text-slate-300 bg-white/5 px-2 py-0.5 rounded">packet_id</code>
                <code className="text-red-400 bg-white/5 px-2 py-0.5 rounded line-through">metadata</code>
                <span className="text-xs text-amber-400">→ use "details"</span>
              </div>
            </div>
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10">
              <p className="text-white font-medium">KeyPair</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Algorithm:</span>
                <code className="text-red-400 bg-white/5 px-2 py-0.5 rounded line-through">ed25519</code>
                <span className="text-xs text-amber-400">→ should be "ecdsa-p256"</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Security:</span>
                <span className="text-red-400 text-xs">Private keys stored unencrypted</span>
              </div>
            </div>
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10">
              <p className="text-white font-medium">CommandPacket</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Required:</span>
                <code className="text-[#4bce2a] bg-white/5 px-2 py-0.5 rounded">organization_id</code>
                <code className="text-[#4bce2a] bg-white/5 px-2 py-0.5 rounded">name</code>
                <code className="text-[#4bce2a] bg-white/5 px-2 py-0.5 rounded">original_intent</code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Cryptographic:</span>
                <code className="text-slate-300 bg-white/5 px-2 py-0.5 rounded">signature</code>
                <code className="text-slate-300 bg-white/5 px-2 py-0.5 rounded">packet_hash</code>
                <span className="text-xs text-amber-400">(currently SHA-256 hash only)</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Working Features */}
      <GlassCard className="p-6 border-[#4bce2a]/30 bg-[#4bce2a]/5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-[#4bce2a]" />
          <h3 className="text-lg font-semibold text-white">Security Features Working Correctly</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-[#4bce2a] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Organization Context Guards</p>
              <p className="text-sm text-slate-400">
                Prevents writes to "default" context. Enforces organization_id requirements across all write operations.
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                components/utils/organizationGuard.js
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-[#4bce2a] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Web Crypto API Key Generation</p>
              <p className="text-sm text-slate-400">
                ECDSA P-256 keypairs generated client-side using secure Web Crypto API
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                pages/KeyManagement.jsx:62-73
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-[#4bce2a] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Comprehensive Audit Logging</p>
              <p className="text-sm text-slate-400">
                All packet operations tracked with actor, timestamp, and details
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Recommendations */}
      <GlassCard className="p-6 border-[#2699fe]/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-[#2699fe]" />
          <h3 className="text-lg font-semibold text-white">Recommended Actions</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[#2699fe]/10 border border-[#2699fe]/20">
            <p className="text-[#2699fe] font-medium text-sm mb-1">Immediate (Pre-Launch)</p>
            <ul className="text-sm text-slate-400 space-y-1 ml-4 list-disc">
              <li>Implement KMS for private key storage (AWS KMS, GCP KMS, or AES-GCM client-side)</li>
              <li>Replace SHA-256 hash with ECDSA signatures using stored keypairs</li>
              <li>Fix entity schema mismatches (AuditLog, KeyPair)</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-[#2699fe]/10 border border-[#2699fe]/20">
            <p className="text-[#2699fe] font-medium text-sm mb-1">Short-term (Post-Launch)</p>
            <ul className="text-sm text-slate-400 space-y-1 ml-4 list-disc">
              <li>Add HMAC verification for packet cache (as shown in UI)</li>
              <li>Implement replay protection (nonce/timestamp validation)</li>
              <li>Add audit trail for key usage events</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-[#2699fe]/10 border border-[#2699fe]/20">
            <p className="text-[#2699fe] font-medium text-sm mb-1">Long-term (Enterprise)</p>
            <ul className="text-sm text-slate-400 space-y-1 ml-4 list-disc">
              <li>Multi-party signing workflows</li>
              <li>HSM integration for regulated industries</li>
              <li>Packet integrity verification UI with cryptographic proof</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Deployment Info */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Deployment Configuration</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4bce2a]/20">
              <CheckCircle className="h-4 w-4 text-[#4bce2a]" />
            </div>
            <div>
              <p className="text-white font-medium">Base44 Platform Hosting</p>
              <p className="text-sm text-slate-400">
                Uses Base44 SDK with built-in authentication, entity management, and SPA routing
              </p>
              <p className="text-xs text-slate-500 mt-1">
                No manual deployment config needed - platform handles SPA fallback automatically
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/20">
              <Database className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-white font-medium">Environment Variables</p>
              <p className="text-sm text-slate-400">
                <code className="text-[#2699fe] bg-white/5 px-2 py-0.5 rounded">BASE44_APP_ID</code> auto-populated by platform
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Additional secrets managed via Base44 Dashboard → Settings → Environment Variables
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}