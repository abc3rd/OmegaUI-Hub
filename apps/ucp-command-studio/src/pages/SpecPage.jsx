import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SpecPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Disclosure Banner */}
      <div className="bg-slate-100 border-b border-slate-200 py-2 text-center">
        <p className="text-sm text-slate-600">
          This site describes technical concepts for evaluation and does not grant a license.
        </p>
      </div>

      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-xl text-slate-900">UCP</div>
            <div className="flex gap-8">
              <Link to={createPageUrl("LandingIP")} className="text-slate-600 hover:text-slate-900">Home</Link>
              <Link to={createPageUrl("SpecPage")} className="text-slate-900 font-medium">Spec</Link>
              <Link to={createPageUrl("FiguresPage")} className="text-slate-600 hover:text-slate-900">Figures</Link>
              <Link to={createPageUrl("LicensingPage")} className="text-slate-600 hover:text-slate-900">Licensing</Link>
              <Link to={createPageUrl("TermsPage")} className="text-slate-600 hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Specification Summary</h1>
          <p className="text-sm text-slate-500">Last updated: December 2025</p>
        </div>

        {/* UCP Packet */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. UCP Packet Structure</h2>
          <p className="text-slate-700 mb-4">
            A UCP packet defines a canonical format for encoding deterministic command execution instructions. 
            The packet comprises three primary components: header metadata, execution payload, and driver mappings.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">CANONICAL STRUCTURE</h3>
            <pre className="text-sm text-slate-800 font-mono overflow-x-auto">
{`{
  "packet_version": "1.0",
  "intent_digest": "sha256:a3f5...",
  "parameter_schema": {
    "type": "object",
    "properties": {
      "recipient": { "type": "string" },
      "amount": { "type": "number" }
    },
    "required": ["recipient", "amount"]
  },
  "runner_spec": {
    "action": "payment.send",
    "driver": "stripe_v1",
    "parameters": {
      "to": "{{recipient}}",
      "amount_cents": "{{amount * 100}}"
    }
  },
  "constraints": {
    "max_tokens": 100,
    "allow_offline": true,
    "expires_at": "2025-12-31T23:59:59Z"
  },
  "signature": "ed25519:9f2c...",
  "signer_key_id": "org_key_001"
}`}
            </pre>
          </div>
          <p className="text-sm text-slate-600 italic">
            Examples are illustrative and non-limiting; implementations may vary.
          </p>
        </section>

        {/* Deterministic Canonical Serialization */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Deterministic Canonical Serialization</h2>
          <p className="text-slate-700 mb-4">
            To enable cryptographic signing and verification, UCP implements deterministic serialization. 
            Keys are sorted lexicographically, whitespace is normalized, and numeric precision is standardized.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">PSEUDOCODE</h3>
            <pre className="text-sm text-slate-800 font-mono">
{`function canonicalizePacket(packet):
  sorted_keys = sort(packet.keys(), lexicographic=true)
  canonical_json = ""
  for key in sorted_keys:
    canonical_json += serializeKey(key, packet[key])
  return canonical_json

function generateHash(canonical_json):
  return SHA256(canonical_json)`}
            </pre>
          </div>
        </section>

        {/* Vector Cache */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Semantic Caching via Vector Templates</h2>
          <p className="text-slate-700 mb-4">
            UCP implements vector-based semantic similarity matching to identify equivalent intents. 
            When similarity exceeds a threshold (typically 0.85-0.95), cached packets are retrieved, 
            eliminating redundant AI inference.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">ALGORITHM</h3>
            <pre className="text-sm text-slate-800 font-mono">
{`function findCachedPacket(intent_text, threshold=0.90):
  query_vector = embed(intent_text)
  
  for cached_packet in packet_cache:
    similarity = cosine_similarity(
      query_vector, 
      cached_packet.intent_vector
    )
    
    if similarity >= threshold:
      return cached_packet
  
  return null  // Cache miss, proceed to LLM inference`}
            </pre>
          </div>
          <p className="text-slate-700">
            Cache hits reduce execution time from 800-2000ms (LLM inference) to &lt;50ms (vector lookup + retrieval).
          </p>
        </section>

        {/* Bidirectional Handshake */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Bidirectional Handshake Protocol</h2>
          <p className="text-slate-700 mb-4">
            UCP defines a request-response handshake enabling secure, stateful command execution. 
            Session tokens are exchanged during handshake initialization and validated on subsequent requests.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">HANDSHAKE FLOW</h3>
            <div className="space-y-2 text-sm text-slate-700 font-mono">
              <p>1. Client → Server: INIT_REQUEST (public_key, capabilities)</p>
              <p>2. Server → Client: INIT_RESPONSE (session_token, server_key)</p>
              <p>3. Client → Server: EXEC_REQUEST (packet, session_token, signature)</p>
              <p>4. Server validates signature and session_token</p>
              <p>5. Server → Client: EXEC_RESPONSE (result, status)</p>
            </div>
          </div>
        </section>

        {/* Driver Mapping */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Driver Abstraction Layer</h2>
          <p className="text-slate-700 mb-4">
            Drivers map UCP commands to platform-specific API calls. Each driver implements a standardized interface 
            ensuring consistent execution semantics across heterogeneous systems.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">DRIVER INTERFACE</h3>
            <pre className="text-sm text-slate-800 font-mono">
{`interface UCPDriver {
  name: string
  version: string
  
  validate(packet: UCPPacket): ValidationResult
  execute(packet: UCPPacket): ExecutionResult
  rollback(execution_id: string): RollbackResult
}

// Example: Stripe Payment Driver
class StripeDriverV1 implements UCPDriver {
  name = "stripe_v1"
  version = "1.0.0"
  
  execute(packet) {
    return stripe.charges.create({
      amount: packet.parameters.amount_cents,
      currency: "usd",
      destination: packet.parameters.to
    })
  }
}`}
            </pre>
          </div>
        </section>

        {/* Physical Transport */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Physical Transport Pipeline</h2>
          <p className="text-slate-700 mb-4">
            UCP packets can be transported via QR codes or NFC, enabling offline command execution. 
            The transport pipeline implements compression and encoding for size-constrained physical media.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">ENCODING PIPELINE</h3>
            <pre className="text-sm text-slate-800 font-mono">
{`function encodeForQR(packet):
  canonical = canonicalizePacket(packet)
  compressed = gzip_compress(canonical)
  encoded = base64url_encode(compressed)
  
  if length(encoded) > QR_MAX_SIZE:
    return fragmentPacket(encoded)
  
  return encoded

function decodeFromQR(qr_data):
  decoded = base64url_decode(qr_data)
  decompressed = gzip_decompress(decoded)
  packet = JSON.parse(decompressed)
  
  verifySignature(packet)
  return packet`}
            </pre>
          </div>
        </section>

        {/* Non-limiting Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-12">
          <h3 className="font-semibold text-amber-900 mb-2">Non-Limiting Disclosure</h3>
          <p className="text-sm text-amber-800">
            All examples, pseudocode, and implementation details provided are illustrative and non-limiting. 
            Actual implementations may vary in structure, optimization, and platform-specific adaptations 
            while maintaining conformance to UCP protocol semantics.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-900 font-semibold mb-1">© Omega UI, LLC — Universal Command Protocol (UCP)</p>
              <p className="text-sm text-slate-600">Patent pending / Provisional filed</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>Website: <a href="https://www.omegaui.com" className="text-blue-600 hover:underline">omegaui.com</a></p>
              <p>Contact: <a href="mailto:ucp@syncloudconnect.com" className="text-blue-600 hover:underline">ucp@syncloudconnect.com</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}