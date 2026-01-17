import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Cloud QR: Terms of Service
        </h1>
        <p className="text-slate-600">Last Updated: January 9, 2026</p>
        <p className="text-slate-600 font-semibold mt-2">
          Entity: Omega UI, LLC<br />
          Location: 2744 Edison Avenue, Fort Myers, FL 33916
        </p>
      </div>

      <Card className="border-2 border-slate-200 shadow-xl">
        <CardContent className="p-6 md:p-8">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  By accessing the Cloud QR application, you agree to be bound by these terms. 
                  This app is a product of the Universal Control Platform (UCP) ecosystem designed 
                  to facilitate community resource sharing and charitable giving.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  2. The "Hidden Jewels" Resource Map
                </h2>
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <div>
                    <strong className="text-slate-800">User Contributions:</strong> Users may mark 
                    locations of "Hidden Jewels," such as water, power, or food pantries.
                  </div>
                  <div>
                    <strong className="text-slate-800">Accuracy:</strong> While Omega UI, LLC strives 
                    for verified data, we are not liable for the current status or legality of resources 
                    marked by the community.
                  </div>
                  <div>
                    <strong className="text-slate-800">Safety:</strong> Users access mapped locations 
                    at their own risk.
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  3. QR Collect & Charitable Giving
                </h2>
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <div>
                    <strong className="text-slate-800">Cloud QR Profiles:</strong> The app allows 
                    users to create profiles and share QR codes for the purpose of seeking or sending charity.
                  </div>
                  <div>
                    <strong className="text-slate-800">Direct Transactions:</strong> Cloud QR acts as 
                    a bridge; we do not process the funds directly and are not responsible for the outcome 
                    of peer-to-peer donations.
                  </div>
                  <div>
                    <strong className="text-slate-800">Prohibited Conduct:</strong> Users may not use 
                    Cloud QR to harass, defraud, or engage in illegal activities.
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  4. Intellectual Property & The UCP
                </h2>
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <div>
                    <strong className="text-slate-800">Patented Logic:</strong> The underlying 
                    architecture of Cloud QR, including the Intermediate Execution Representation (IER) 
                    and energy-saving logic, is protected under the Omega UI, LLC "Poor Boy's Patent" 
                    and upcoming formal filings.
                  </div>
                  <div>
                    <strong className="text-slate-800">Ownership:</strong> All branding, including the 
                    colors #ea00ea and #2699fe, remains the property of Omega UI, LLC.
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  5. Limitation of Liability
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Omega UI, LLC and its founder, Alonza "Brad" Curry, shall not be held liable for any 
                  damages arising from the use of the Cloud QR app or the pursuit of Hidden Jewels.
                </p>
              </section>

              {/* Contact */}
              <section className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Questions or Concerns?
                </h3>
                <p className="text-slate-600">
                  Contact us at:{" "}
                  <a 
                    href="mailto:omegaui@syncloudconnect.com" 
                    className="text-blue-600 hover:text-blue-700"
                  >
                    omegaui@syncloudconnect.com
                  </a>
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}