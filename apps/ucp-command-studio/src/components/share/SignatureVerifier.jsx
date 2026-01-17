import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function SignatureVerifier({ packet, onVerify }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [inputSignature, setInputSignature] = useState("");

  const verify = async () => {
    setIsVerifying(true);
    try {
      // Recreate the signature from packet content
      const content = JSON.stringify({
        name: packet.name,
        version: packet.version,
        logic: packet.logic,
        parameter_schema: packet.parameter_schema,
      });
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const isValid = computedSignature === packet.signature;
      setResult({
        valid: isValid,
        message: isValid 
          ? "Signature is valid. This packet has not been tampered with."
          : "Signature mismatch! The packet may have been modified.",
      });

      if (onVerify) {
        onVerify(isValid);
      }
    } catch (error) {
      setResult({
        valid: false,
        message: "Verification failed: " + error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="h-5 w-5 text-[#2699fe]" />
        <h3 className="font-medium text-white">Signature Verification</h3>
      </div>

      {packet?.signature ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Current Signature</p>
            <code className="block p-3 rounded-lg bg-white/5 text-xs text-slate-300 font-mono break-all">
              {packet.signature}
            </code>
          </div>

          <div className="text-sm text-slate-400">
            <p>Signed by: {packet.signed_by}</p>
            <p>Signed at: {new Date(packet.signed_at).toLocaleString()}</p>
          </div>

          <Button
            onClick={verify}
            disabled={isVerifying}
            className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify Signature
              </>
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              result.valid 
                ? "bg-[#4bce2a]/10 border border-[#4bce2a]/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}>
              {result.valid ? (
                <CheckCircle className="h-5 w-5 text-[#4bce2a] flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              )}
              <p className={result.valid ? "text-[#4bce2a]" : "text-red-300"}>
                {result.message}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">This packet is not signed</p>
          <p className="text-xs text-slate-500 mt-1">
            Sign the packet to enable verification
          </p>
        </div>
      )}
    </GlassCard>
  );
}