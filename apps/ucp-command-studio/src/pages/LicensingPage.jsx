import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, FileText, Mail } from "lucide-react";

export default function LicensingPage() {
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
              <Link to={createPageUrl("SpecPage")} className="text-slate-600 hover:text-slate-900">Spec</Link>
              <Link to={createPageUrl("FiguresPage")} className="text-slate-600 hover:text-slate-900">Figures</Link>
              <Link to={createPageUrl("LicensingPage")} className="text-slate-900 font-medium">Licensing</Link>
              <Link to={createPageUrl("TermsPage")} className="text-slate-600 hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-12">Licensing & Due Diligence</h1>

        {/* Licensing Structures */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Licensing Structures</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Platform License</h3>
              <p className="text-slate-600 mb-4">
                Annual licensing for integration of UCP protocol into platform infrastructure.
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Unlimited internal usage
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Technical support included
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Implementation guidance
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Driver development kit
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Per-Execution Royalty</h3>
              <p className="text-slate-600 mb-4">
                Usage-based licensing tied to command packet execution volume.
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Tiered pricing model
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Volume discounts available
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Transparent metering
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Monthly settlement
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Vertical Exclusive License</h3>
              <p className="text-slate-600 mb-4">
                Industry-specific exclusive rights for designated verticals.
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Market exclusivity
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Custom driver development
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Priority support
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Co-marketing rights
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Due Diligence Package */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Due Diligence Package</h2>
          <p className="text-slate-600 mb-6">
            A comprehensive due diligence package is available to qualified parties under NDA. 
            The package includes technical documentation, claim mapping, and implementation guidance.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Package Contents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Provisional Filing PDF</p>
                  <p className="text-sm text-slate-600">Complete patent application with claims and figures</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Claim Chart Mapping</p>
                  <p className="text-sm text-slate-600">Technical term to code module correspondence</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Benchmark Methodology</p>
                  <p className="text-sm text-slate-600">Energy and latency measurement protocols</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Security Model Summary</p>
                  <p className="text-sm text-slate-600">Cryptographic implementation details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Reference Implementation</p>
                  <p className="text-sm text-slate-600">Sample code and driver examples</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Prior Art Analysis</p>
                  <p className="text-sm text-slate-600">Comparative technology assessment</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <div className="flex items-start gap-6">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Omega UI, LLC</h3>
                <p className="text-slate-700 mb-4">d/b/a Cloud Connect</p>
                
                <div className="space-y-2">
                  <p className="text-slate-700">
                    <span className="font-medium">Website:</span>{" "}
                    <a href="https://www.omegaui.com" className="text-blue-600 hover:underline">
                      www.omegaui.com
                    </a>
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium">Licensing Inquiries:</span>{" "}
                    <a href="mailto:legal@syncloudconnect.com" className="text-blue-600 hover:underline">
                      legal@syncloudconnect.com
                    </a>
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium">Technical Contact:</span>{" "}
                    <a href="mailto:ucp@syncloudconnect.com" className="text-blue-600 hover:underline">
                      ucp@syncloudconnect.com
                    </a>
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-sm text-slate-600">
                    All inquiries will be responded to within 2 business days. 
                    Due diligence materials are available under NDA to qualified parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Acquisition Positioning */}
        <section>
          <div className="bg-slate-900 text-white rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Strategic Acquisition Opportunity</h3>
            <p className="text-slate-300 mb-6">
              UCP represents a foundational protocol layer for AI-driven automation. 
              As natural language interfaces proliferate, UCP's caching and execution model 
              becomes essential infrastructure for energy-efficient, reliable command execution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-semibold mb-1">Market Position</p>
                <p className="text-slate-400">Infrastructure layer, not application</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Competitive Moat</p>
                <p className="text-slate-400">Patent-protected caching mechanism</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Platform Risk</p>
                <p className="text-slate-400">Competitor licensing creates lock-out</p>
              </div>
            </div>
          </div>
        </section>
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