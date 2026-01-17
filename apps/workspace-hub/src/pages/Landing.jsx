import React, { useEffect } from "react";

export default function Landing() {
  useEffect(() => {
    // Set page title and meta tags
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
      // Cleanup meta tags on unmount
      metaTags.forEach(({ name, property }) => {
        const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
        const meta = document.querySelector(selector);
        if (meta) meta.remove();
      });
    };
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0, lineHeight: 1.6, color: "#111" }}>
      <style>{`
        .ucp-landing h1, .ucp-landing h2, .ucp-landing h3 {
          color: #222;
        }
        .ucp-landing .cta-button {
          display: inline-block;
          background: #4bce2a;
          color: white;
          padding: 1rem 2rem;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 1rem;
        }
        .ucp-landing .cta-button:hover {
          background: #3db522;
        }
        .ucp-landing table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .ucp-landing th, .ucp-landing td {
          padding: 0.75rem;
          border: 1px solid #ddd;
          text-align: left;
        }
        .ucp-landing th {
          background: #f5f5f5;
          font-weight: bold;
        }
      `}</style>

      <div className="ucp-landing">
        <header style={{ background: "linear-gradient(90deg, #ea00ea, #9d00ff)", color: "white", padding: "2rem", textAlign: "center" }}>
          <h1>Stop Prompting. Start Commanding AI.</h1>
          <p>Universal Command Protocol (UCP) gives you deterministic control over AI execution.</p>
          <a href="https://ucp.omegaui.com" className="cta-button">Try the Demo</a>
        </header>

        <section style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
          <h2>What is UCP?</h2>
          <p>UCP is a standardized protocol for instructing AI systems with precision and control. Unlike vague prompts, UCP ensures:</p>
          <ul>
            <li>✅ Deterministic execution</li>
            <li>✅ Token efficiency</li>
            <li>✅ Cost reduction</li>
            <li>✅ Repeatable outputs</li>
          </ul>
        </section>

        <section style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
          <h2>Translate → Command → Execute</h2>
          <p>UCP converts natural language into structured protocol packets that are executed exactly as intended by the AI system.</p>
        </section>

        <section style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
          <h2>Why Use UCP?</h2>
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
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Cost Efficiency</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Execution Speed</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Repeatable Output</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
          <h2>Use Cases</h2>
          <p>UCP is ideal for:</p>
          <ul>
            <li>🔌 AI agent orchestration</li>
            <li>📡 Backend inference pipelines</li>
            <li>🧠 Voice/Chat command layers</li>
            <li>💻 Enterprise AI systems</li>
          </ul>
        </section>

        <section style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
          <h2>Try It Live</h2>
          <p>Experience UCP in action. Launch the demo, input your command, and see the AI respond with precision.</p>
          <a href="https://ucp.omegaui.com" className="cta-button">Launch Demo</a>
        </section>

        <footer style={{ background: "#f8f8f8", padding: "2rem", textAlign: "center", fontSize: "0.9rem" }}>
          Powered by <a href="https://omegaui.com" style={{ color: "#ea00ea" }}>OmegaUI</a> • 
          <a href="https://github.com/omegaui" style={{ color: "#ea00ea" }}> GitHub</a> • 
          Contact: team@omegaui.com
        </footer>
      </div>
    </div>
  );
}