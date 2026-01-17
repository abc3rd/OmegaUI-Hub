import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, Repeat, TrendingDown } from "lucide-react";

export default function UCP() {
  useEffect(() => {
    document.title = "Universal Command Protocol (UCP) – Stop Prompting. Start Commanding AI.";
    
    const metaTags = [
      { name: "description", content: "Take control of AI execution with UCP. Save tokens, reduce cost, and gain deterministic AI performance. Try the Universal Command Protocol demo now." },
      { property: "og:title", content: "Universal Command Protocol – UCP for Deterministic AI" },
      { property: "og:description", content: "UCP eliminates prompt chaos. Translate → Command → Execute." },
      { property: "og:image", content: "https://ucp.omegaui.com/assets/og-preview.png" },
      { property: "og:url", content: "https://ucp.omegaui.com" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Universal Command Protocol – UCP" },
      { name: "twitter:description", content: "Take control of AI execution with UCP. Try the live demo." },
      { name: "twitter:image", content: "https://ucp.omegaui.com/assets/og-preview.png" },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement("meta");
      if (name) meta.name = name;
      if (property) meta.setAttribute("property", property);
      meta.content = content;
      document.head.appendChild(meta);
    });

    return () => {
      metaTags.forEach(({ name, property }) => {
        const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
        const meta = document.querySelector(selector);
        if (meta) meta.remove();
      });
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 min-h-screen">
      <style>{`
        .ucp-page h1, .ucp-page h2, .ucp-page h3 {
          color: #222;
        }
        .ucp-page .cta-button {
          display: inline-block;
          background: #4bce2a;
          color: white;
          padding: 1rem 2rem;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 1rem;
        }
        .ucp-page .cta-button:hover {
          background: #3db522;
        }
        .ucp-page table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .ucp-page th, .ucp-page td {
          padding: 0.75rem;
          border: 1px solid #ddd;
          text-align: left;
        }
        .ucp-page th {
          background: #f5f5f5;
          font-weight: bold;
        }
      `}</style>

      <div className="ucp-page">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#EA00EA] via-[#9D00FF] to-[#2962FF] text-white">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Stop Prompting. Start Commanding AI.
            </h1>
            <p className="text-xl mb-6 text-white/90">
              Universal Command Protocol (UCP) gives you deterministic control over AI execution.
            </p>
            <a href="https://ucp.omegaui.com" target="_blank" rel="noopener noreferrer" className="cta-button inline-flex items-center">
              Try the Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </header>

        {/* What is UCP */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6">What is UCP?</h2>
          <p className="text-lg text-gray-700 mb-6">
            UCP is a standardized protocol for instructing AI systems with precision and control. Unlike vague prompts, UCP ensures:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 flex items-start gap-3">
              <Target className="w-6 h-6 text-[#EA00EA] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Deterministic execution</h3>
                <p className="text-gray-600">Consistent, repeatable outputs every time</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 flex items-start gap-3">
              <Zap className="w-6 h-6 text-[#4bce2a] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Token efficiency</h3>
                <p className="text-gray-600">Reduce consumption and costs significantly</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 flex items-start gap-3">
              <TrendingDown className="w-6 h-6 text-[#2962FF] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Cost reduction</h3>
                <p className="text-gray-600">Save up to 70% on AI infrastructure costs</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 flex items-start gap-3">
              <Repeat className="w-6 h-6 text-[#9D00FF] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Repeatable outputs</h3>
                <p className="text-gray-600">Guaranteed consistency across executions</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-6 py-12 bg-white/50 rounded-2xl my-8">
          <h2 className="text-3xl font-bold mb-6">Translate → Command → Execute</h2>
          <p className="text-lg text-gray-700">
            UCP converts natural language into structured protocol packets that are executed exactly as intended by the AI system.
          </p>
        </section>

        {/* Comparison Table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6">Why Use UCP?</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Prompting AI</th>
                  <th>UCP Protocol</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Output Consistency</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr>
                  <td>Cost Efficiency</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr>
                  <td>Execution Speed</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr>
                  <td>Repeatable Output</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6">Use Cases</h2>
          <p className="text-lg text-gray-700 mb-4">UCP is ideal for:</p>
          <ul className="space-y-3 text-lg">
            <li className="flex items-center gap-3">
              <span className="text-2xl">🔌</span>
              <span>AI agent orchestration</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">📡</span>
              <span>Backend inference pipelines</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <span>Voice/Chat command layers</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">💻</span>
              <span>Enterprise AI systems</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4 text-white">Try It Live</h2>
            <p className="text-xl mb-6 text-white/90">
              Experience UCP in action. Launch the demo, input your command, and see the AI respond with precision.
            </p>
            <a href="https://ucp.omegaui.com" target="_blank" rel="noopener noreferrer" className="cta-button inline-flex items-center">
              Launch Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-100 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-600">
            Powered by{' '}
            <a href="https://omegaui.com" className="text-[#EA00EA] hover:underline">
              OmegaUI
            </a>{' '}
            •{' '}
            <a href="https://github.com/omegaui" className="text-[#EA00EA] hover:underline">
              GitHub
            </a>{' '}
            • Contact: team@omegaui.com
          </div>
        </footer>
      </div>
    </div>
  );
}