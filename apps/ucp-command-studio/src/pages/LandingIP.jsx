import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, FileText, Image, Scale } from "lucide-react";

export default function LandingIP() {
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
              <Link to={createPageUrl("LandingIP")} className="text-slate-900 font-medium">Home</Link>
              <Link to={createPageUrl("SpecPage")} className="text-slate-600 hover:text-slate-900">Spec</Link>
              <Link to={createPageUrl("FiguresPage")} className="text-slate-600 hover:text-slate-900">Figures</Link>
              <Link to={createPageUrl("LicensingPage")} className="text-slate-600 hover:text-slate-900">Licensing</Link>
              <Link to={createPageUrl("TermsPage")} className="text-slate-600 hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-4xl">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Universal Command Protocol (UCP)
          </h1>
          <p className="text-2xl text-slate-600 leading-relaxed mb-12">
            A standardized, energy-optimized execution layer that decouples AI inference from deterministic command execution across platforms.
          </p>

          {/* Stack Diagram */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 mb-16">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 text-center">STACK PLACEMENT</h3>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white border border-slate-300 rounded px-6 py-4 text-center">
                <div className="text-sm font-medium text-slate-900">Natural Language</div>
              </div>
              <ArrowRight className="text-slate-400 h-5 w-5" />
              <div className="bg-white border border-slate-300 rounded px-6 py-4 text-center">
                <div className="text-sm font-medium text-slate-900">AI Interpretation</div>
              </div>
              <ArrowRight className="text-slate-400 h-5 w-5" />
              <div className="bg-blue-600 border border-blue-700 rounded px-6 py-4 text-center">
                <div className="text-sm font-bold text-white">UCP Standard Packet</div>
              </div>
              <ArrowRight className="text-slate-400 h-5 w-5" />
              <div className="bg-white border border-slate-300 rounded px-6 py-4 text-center">
                <div className="text-sm font-medium text-slate-900">Drivers/APIs</div>
              </div>
              <ArrowRight className="text-slate-400 h-5 w-5" />
              <div className="bg-white border border-slate-300 rounded px-6 py-4 text-center">
                <div className="text-sm font-medium text-slate-900">Execution</div>
              </div>
            </div>
          </div>

          {/* Irreversible Claims */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Cacheable Semantic Execution</h3>
              <p className="text-sm text-slate-600">
                Commands are cached by semantic similarity, eliminating redundant AI inference for equivalent intents.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Cross-Platform Portability</h3>
              <p className="text-sm text-slate-600">
                Standardized packets execute via platform-specific drivers, ensuring consistent behavior across systems.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Offline-Capable Transport</h3>
              <p className="text-sm text-slate-600">
                Physical transport via QR/NFC enables command execution without continuous network connectivity.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Link 
              to={createPageUrl("SpecPage")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Read the Specification
            </Link>
            <Link 
              to={createPageUrl("FiguresPage")}
              className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              View Figures
            </Link>
            <Link 
              to={createPageUrl("LicensingPage")}
              className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
            >
              <Scale className="h-4 w-4" />
              Licensing & Contact
            </Link>
          </div>
        </div>
      </section>

      {/* What UCP Defines */}
      <section className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">What UCP Defines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Command Packet Structure</h3>
              <p className="text-slate-600">
                A canonical format comprising header metadata, execution payload, and driver mappings that enable deterministic command execution.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Bidirectional Handshake</h3>
              <p className="text-slate-600">
                Request-response protocol with session tokens enabling secure, stateful command execution across client-server architectures.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Driver Abstraction Layer</h3>
              <p className="text-slate-600">
                Standardized interfaces that map UCP commands to platform-specific APIs, ensuring consistent behavior across heterogeneous systems.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Semantic Caching Mechanism</h3>
              <p className="text-slate-600">
                Vector-based similarity matching that identifies semantically equivalent commands, reducing inference costs by 70-95%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Why It Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Energy Efficiency</h3>
              <p className="text-slate-600 mb-4">
                Eliminates redundant LLM inference for semantically equivalent commands, reducing computational overhead and energy consumption.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded p-4">
                <p className="text-sm text-slate-500 font-mono">Cache hit: ~0.001 kWh</p>
                <p className="text-sm text-slate-500 font-mono">LLM inference: ~0.05 kWh</p>
                <p className="text-sm text-slate-700 font-semibold mt-2">50× reduction per cached execution</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Latency Reduction</h3>
              <p className="text-slate-600 mb-4">
                Deterministic execution paths bypass real-time inference, enabling sub-50ms response times for cached commands.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded p-4">
                <p className="text-sm text-slate-500 font-mono">Typical LLM: 800-2000ms</p>
                <p className="text-sm text-slate-500 font-mono">UCP cached: &lt;50ms</p>
                <p className="text-sm text-slate-700 font-semibold mt-2">16-40× faster execution</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Reliability</h3>
              <p className="text-slate-600 mb-4">
                Cryptographically signed packets ensure command integrity and enable offline execution without network dependencies.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded p-4">
                <p className="text-sm text-slate-700 font-semibold">Ed25519 signatures</p>
                <p className="text-sm text-slate-700 font-semibold">QR/NFC transport</p>
                <p className="text-sm text-slate-700 font-semibold mt-2">Zero-trust execution model</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Non-limiting Embodiments */}
      <section className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Non-Limiting Embodiments</h2>
          <p className="text-slate-600 mb-12">
            The following use cases illustrate potential applications of UCP technology. Implementations may vary.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">CRM Automation</h3>
              <p className="text-sm text-slate-600">
                "Schedule follow-up with John next Tuesday" → UCP packet → CRM driver → Calendar API execution
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Payment Processing</h3>
              <p className="text-sm text-slate-600">
                "Send $50 to Alice" → UCP packet → Payment driver → Stripe/PayPal API execution
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Meeting Scheduling</h3>
              <p className="text-sm text-slate-600">
                "Book conference room for 2pm" → UCP packet → Calendar driver → Google Calendar API execution
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Document Generation</h3>
              <p className="text-sm text-slate-600">
                "Create Q4 report" → UCP packet → Document driver → Template engine execution
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Workflow Orchestration</h3>
              <p className="text-sm text-slate-600">
                "Deploy staging environment" → UCP packet → Infrastructure driver → Kubernetes API execution
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Multi-Step Operations</h3>
              <p className="text-sm text-slate-600">
                "Onboard new customer" → UCP packet chain → Multiple driver executions → Completion confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12">
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