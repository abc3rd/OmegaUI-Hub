import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertCircle, Lock, FileCheck } from "lucide-react";

export default function TermsPage() {
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
              <Link to={createPageUrl("LicensingPage")} className="text-slate-600 hover:text-slate-900">Licensing</Link>
              <Link to={createPageUrl("TermsPage")} className="text-slate-900 font-medium">Terms</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-12">Legal & Disclaimers</h1>

        {/* Notice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">No Legal Advice</h3>
            </div>
            <p className="text-sm text-amber-800">
              Information provided is for evaluation purposes only and does not constitute legal advice.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">No Public License</h3>
            </div>
            <p className="text-sm text-red-800">
              Viewing this site does not grant any license, express or implied, to UCP technology.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileCheck className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">NDA Required</h3>
            </div>
            <p className="text-sm text-blue-800">
              Confidential materials are available only under executed non-disclosure agreement.
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Intellectual Property Rights</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                All intellectual property rights in the Universal Command Protocol (UCP), including but not limited to 
                patents, patent applications, copyrights, trade secrets, and trademarks, are owned exclusively by 
                Omega UI, LLC (d/b/a Cloud Connect).
              </p>
              <p className="text-slate-700">
                A provisional patent application has been filed with the United States Patent and Trademark Office. 
                Additional patent applications may be filed in the United States and internationally.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. No Grant of License</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Access to this website and the technical information contained herein does not grant any license, 
                whether express, implied, by estoppel, or otherwise, to practice the UCP protocol, implement any 
                described technology, or use any patented inventions.
              </p>
              <p className="text-slate-700">
                Any implementation of UCP technology without a valid, executed license agreement constitutes patent 
                infringement and will be subject to legal action.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Confidentiality</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Certain technical specifications, implementation details, benchmark data, and business information 
                are considered confidential and proprietary to Omega UI, LLC.
              </p>
              <p className="text-slate-700">
                Access to confidential materials requires execution of a mutual non-disclosure agreement (NDA). 
                Parties receiving confidential information agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Maintain strict confidentiality of all disclosed information</li>
                <li>Use confidential information solely for evaluation purposes</li>
                <li>Not reverse engineer or attempt to recreate disclosed technology</li>
                <li>Return or destroy all confidential materials upon request</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. No Warranties</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                All information provided on this website is provided "as is" without warranty of any kind, 
                whether express or implied, including but not limited to warranties of merchantability, 
                fitness for a particular purpose, or non-infringement.
              </p>
              <p className="text-slate-700">
                Omega UI, LLC makes no representations or warranties regarding the accuracy, completeness, 
                or suitability of the information provided for any particular purpose.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitation of Liability</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                In no event shall Omega UI, LLC be liable for any direct, indirect, incidental, special, 
                consequential, or punitive damages arising from or related to the use of this website or 
                the information contained herein.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Modifications</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Omega UI, LLC reserves the right to modify these terms, update technical specifications, 
                or remove content from this website at any time without prior notice.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Governing Law</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                These terms and any disputes arising from the use of this website shall be governed by 
                the laws of the State of Delaware, without regard to conflict of law principles.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Contact</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                For questions regarding these terms or to request execution of a non-disclosure agreement, contact:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-4">
                <p className="text-slate-900 font-semibold mb-2">Omega UI, LLC</p>
                <p className="text-slate-700">Legal Department</p>
                <p className="text-slate-700">
                  <a href="mailto:legal@syncloudconnect.com" className="text-blue-600 hover:underline">
                    legal@syncloudconnect.com
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Final Notice */}
        <div className="mt-12 bg-slate-900 text-white rounded-lg p-8">
          <h3 className="text-lg font-semibold mb-3">Important Notice</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            By accessing this website, you acknowledge that you have read, understood, and agree to be bound by these terms. 
            If you do not agree to these terms, you must immediately cease using this website and delete any downloaded materials. 
            Omega UI, LLC reserves all rights not expressly granted herein.
          </p>
          <p className="text-slate-400 text-xs mt-4">
            Last Updated: December 2025
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