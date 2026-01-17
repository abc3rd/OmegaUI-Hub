import React, { useState } from 'react';
import { ChevronDown, ExternalLink, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics';

export default function UCPMarketing() {
  const [openFaq, setOpenFaq] = useState(null);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Omega UI, LLC",
        "url": "https://omegaui.com",
        "telephone": "941-882-0130",
        "email": "ucp@syncloudconnect.com",
        "logo": "https://syncloudconnect.com/assets/brand/omega-ui-logo.png"
      },
      {
        "@type": "WebSite",
        "name": "Universal Command Protocol",
        "url": "https://ucp.omegaui.com",
        "publisher": {
          "@type": "Organization",
          "name": "Omega UI, LLC"
        }
      },
      {
        "@type": "WebPage",
        "name": "Universal Command Protocol (UCP)",
        "url": "https://ucp.omegaui.com",
        "about": {
          "@type": "Thing",
          "name": "Intent Infrastructure",
          "description": "Command-Based AI for operational execution"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Omega UI, LLC"
        }
      }
    ]
  };

  const faqs = [
    {
      q: "How is this going to save money?",
      a: "By replacing repetitive prompting with reusable commands, you eliminate the overhead of re-explaining context, reduce token consumption, and cut down on back-and-forth iterations. For recurring workflows—like reports, dashboards, or audits—UCP can deliver 10x+ efficiency gains."
    },
    {
      q: "What does this do for a home user?",
      a: "UCP is primarily designed for operational and enterprise use cases. However, power users who want consistent, repeatable AI workflows (like content generation templates, data processing scripts, or personal automation) can benefit from the structured approach."
    },
    {
      q: "Is there an alternative I can test and compare?",
      a: "Traditional prompting (ChatGPT, Claude) and agent frameworks (LangChain, AutoGPT) offer different trade-offs. UCP focuses on deterministic execution and governance—you can test the live demo at ucp.omegaui.com and compare results with standard prompting workflows."
    },
    {
      q: "How do I know the commands are right?",
      a: "Commands are designed to be explicit, auditable, and version-controlled. You can test outputs, review execution logs, and iterate on command definitions. Unlike open-ended prompts, commands have defined inputs, outputs, and success criteria."
    }
  ];

  return (
    <>
      <GoogleAnalytics trackingId="G-SNLF60E7LE" />
      <SEOHead 
        title="Universal Command Protocol (UCP) — Intent Infrastructure for Operational AI"
        description="Universal Command Protocol (UCP) is an intent infrastructure approach for turning human intent into deterministic execution—reducing ambiguity, improving governance, and cutting operational waste."
        keywords="UCP, Universal Command Protocol, intent infrastructure, operational AI, command-based AI, AI governance, Omega UI"
        canonicalUrl="https://ucp.omegaui.com"
        structuredData={structuredData}
        appendSiteName={false}
      />

      <div className="ucp-page">
        <style>{`
          .ucp-page {
            min-height: 100vh;
            background: 
              radial-gradient(900px 520px at 20% 10%, rgba(234,0,234,.20), rgba(0,0,0,0) 60%),
              radial-gradient(900px 520px at 70% 20%, rgba(38,153,254,.18), rgba(0,0,0,0) 60%),
              radial-gradient(900px 520px at 60% 85%, rgba(75,206,42,.14), rgba(0,0,0,0) 60%),
              linear-gradient(180deg, #0b0b0e 0%, #111118 100%);
            color: #f5f6f8;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
            line-height: 1.6;
          }

          .ucp-container {
            max-width: 980px;
            margin: 0 auto;
            padding: 28px 18px 56px;
          }

          .ucp-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 14px 16px;
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 999px;
            background: rgba(20,20,24,.70);
            backdrop-filter: blur(10px);
            box-shadow: 0 18px 40px rgba(0,0,0,.45);
            margin-bottom: 28px;
          }

          .ucp-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
          }

          .ucp-mark {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: 
              radial-gradient(16px 16px at 35% 35%, rgba(255,255,255,.35), rgba(255,255,255,0) 60%),
              linear-gradient(135deg, #ea00ea, #2699fe);
            border: 1px solid rgba(255,255,255,.18);
            box-shadow: 0 10px 22px rgba(234,0,234,.22);
            flex-shrink: 0;
          }

          .ucp-brand-text h1 {
            margin: 0;
            font-size: 14px;
            letter-spacing: .2px;
            font-weight: 700;
            color: #fff;
          }

          .ucp-brand-text .sub {
            font-size: 12px;
            color: #cfd3da;
          }

          .ucp-nav {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .ucp-nav-btn {
            padding: 8px 12px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,.14);
            background: rgba(255,255,255,.06);
            color: #f5f6f8;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
            white-space: nowrap;
            transition: all 0.2s;
          }

          .ucp-nav-btn:hover {
            background: rgba(255,255,255,.12);
            transform: translateY(-1px);
          }

          .ucp-hero {
            margin-top: 18px;
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 16px;
            background: rgba(20,20,24,.75);
            backdrop-filter: blur(10px);
            box-shadow: 0 18px 40px rgba(0,0,0,.45);
            padding: 26px 22px;
          }

          .ucp-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 18px;
          }

          .ucp-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            border: 1px solid rgba(234,0,234,.35);
            background: rgba(234,0,234,.10);
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }

          .ucp-pill-dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: #ea00ea;
            box-shadow: 0 0 0 4px rgba(234,0,234,.18);
          }

          .ucp-title {
            font-size: 34px;
            line-height: 1.12;
            letter-spacing: -.6px;
            margin: 10px 0;
            font-weight: 800;
          }

          .ucp-title-gradient {
            background: linear-gradient(90deg, #ea00ea, #2699fe);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .ucp-lead {
            color: #cfd3da;
            font-size: 16px;
            max-width: 78ch;
            margin: 16px 0;
          }

          .ucp-patent-note {
            margin-top: 18px;
            padding: 14px 14px 14px 16px;
            border-left: 4px solid #ea00ea;
            background: rgba(234,0,234,.07);
            border-radius: 12px;
            font-size: 14px;
            color: #cfd3da;
          }

          .ucp-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 14px;
            margin-top: 28px;
          }

          @media (min-width: 860px) {
            .ucp-grid {
              grid-template-columns: 1fr 1fr;
            }
            .ucp-grid-3 {
              grid-template-columns: 1fr 1fr 1fr;
            }
            .ucp-grid-4 {
              grid-template-columns: 1fr 1fr 1fr 1fr;
            }
          }

          .ucp-card {
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 16px;
            background: rgba(20,20,24,.75);
            backdrop-filter: blur(10px);
            box-shadow: 0 18px 40px rgba(0,0,0,.45);
            padding: 18px;
          }

          .ucp-card h3 {
            margin: 0 0 8px;
            font-size: 18px;
            letter-spacing: -.2px;
            color: #fff;
          }

          .ucp-card p {
            margin: 10px 0;
            color: #cfd3da;
            font-size: 14px;
          }

          .ucp-aside {
            border: 1px solid rgba(234,0,234,.35);
            background: rgba(234,0,234,.07);
            grid-column: span 1;
          }

          .ucp-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 11px 14px;
            border-radius: 12px;
            font-weight: 800;
            border: 1px solid rgba(234,0,234,.35);
            background: linear-gradient(135deg, rgba(234,0,234,.95), rgba(38,153,254,.85));
            color: #fff;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            font-size: 14px;
          }

          .ucp-btn:hover {
            filter: brightness(1.1);
            transform: translateY(-2px);
          }

          .ucp-section {
            margin-top: 28px;
          }

          .ucp-section h2 {
            font-size: 24px;
            margin: 0 0 14px;
            color: #fff;
          }

          .ucp-section ul {
            margin: 10px 0 0;
            padding-left: 18px;
            color: #cfd3da;
          }

          .ucp-section li {
            margin: 6px 0;
          }

          .ucp-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
            font-size: 14px;
          }

          .ucp-table th,
          .ucp-table td {
            padding: 12px;
            text-align: left;
            border: 1px solid rgba(255,255,255,.10);
          }

          .ucp-table th {
            background: rgba(234,0,234,.10);
            font-weight: 700;
            color: #fff;
          }

          .ucp-table td {
            background: rgba(20,20,24,.50);
            color: #cfd3da;
          }

          .ucp-table tbody tr:hover td {
            background: rgba(234,0,234,.05);
          }

          .ucp-link-cards {
            display: grid;
            grid-template-columns: 1fr;
            gap: 14px;
            margin-top: 18px;
          }

          @media (min-width: 860px) {
            .ucp-link-cards {
              grid-template-columns: 1fr 1fr;
            }
          }

          .ucp-link-card {
            display: block;
            padding: 18px;
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 16px;
            background: rgba(20,20,24,.75);
            text-decoration: none;
            transition: all 0.2s;
          }

          .ucp-link-card:hover {
            border-color: rgba(234,0,234,.35);
            background: rgba(234,0,234,.07);
            transform: translateY(-2px);
          }

          .ucp-link-card h3 {
            margin: 0 0 8px;
            font-size: 18px;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .ucp-link-card p {
            margin: 0;
            color: #cfd3da;
            font-size: 14px;
          }

          .ucp-faq {
            margin-top: 28px;
          }

          .ucp-faq-item {
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 12px;
            background: rgba(20,20,24,.75);
            margin-bottom: 10px;
            overflow: hidden;
          }

          .ucp-faq-question {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 16px 18px;
            background: transparent;
            border: none;
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          }

          .ucp-faq-question:hover {
            background: rgba(234,0,234,.05);
          }

          .ucp-faq-icon {
            flex-shrink: 0;
            transition: transform 0.2s;
          }

          .ucp-faq-icon.open {
            transform: rotate(180deg);
          }

          .ucp-faq-answer {
            padding: 0 18px 16px;
            color: #cfd3da;
            font-size: 14px;
            line-height: 1.6;
          }

          .ucp-footer {
            margin-top: 48px;
            padding: 24px 0;
            border-top: 1px solid rgba(255,255,255,.10);
            text-align: center;
            color: #cfd3da;
            font-size: 12px;
          }

          .ucp-footer-org {
            font-weight: 700;
            color: #fff;
            font-size: 14px;
            margin-bottom: 8px;
          }

          .ucp-footer-contact {
            margin: 8px 0;
          }

          .ucp-footer-contact a {
            color: #2699fe;
            text-decoration: none;
          }

          .ucp-footer-contact a:hover {
            text-decoration: underline;
          }

          .ucp-footer-patent {
            margin-top: 12px;
            font-style: italic;
            opacity: 0.8;
          }

          .ucp-comparison-icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            vertical-align: middle;
            margin-right: 6px;
          }

          @media (max-width: 860px) {
            .ucp-header {
              flex-direction: column;
              align-items: stretch;
            }
            
            .ucp-nav {
              justify-content: center;
            }

            .ucp-title {
              font-size: 28px;
            }

            .ucp-table {
              font-size: 12px;
            }

            .ucp-table th,
            .ucp-table td {
              padding: 8px;
            }
          }
        `}</style>

        <div className="ucp-container">
          {/* Header */}
          <header className="ucp-header">
            <div className="ucp-brand">
              <div className="ucp-mark" />
              <div className="ucp-brand-text">
                <h1>SynCloud Connect</h1>
                <span className="sub">Intent Infrastructure • Omega UI, LLC</span>
              </div>
            </div>
            <nav className="ucp-nav">
              <a href="https://syncloudconnect.com" className="ucp-nav-btn">Home</a>
              <a href="https://ucp.omegaui.com" className="ucp-nav-btn" target="_blank" rel="noopener noreferrer">Try UCP Live Demo</a>
              <a href="https://syncloudconnect.com/sitemap" className="ucp-nav-btn">Directory</a>
            </nav>
          </header>

          {/* Hero */}
          <section className="ucp-hero">
            <div className="ucp-pills">
              <span className="ucp-pill">
                <span className="ucp-pill-dot" />
                Universal Command Protocol
              </span>
              <span className="ucp-pill">Intent Infrastructure</span>
              <span className="ucp-pill">Patent Pending</span>
              <span className="ucp-pill">Operational AI</span>
            </div>

            <h2 className="ucp-title">
              From prompting to commands: <span className="ucp-title-gradient">operational AI that executes with consistency</span>.
            </h2>

            <p className="ucp-lead">
              Universal Command Protocol (UCP) is an intent infrastructure approach for turning human intent into deterministic execution—reducing ambiguity, improving governance, and cutting operational waste created by chat-based workflows.
            </p>

            <div className="ucp-patent-note">
              <strong>Patent Pending Notice:</strong> UCP is patent pending. This page describes the value and outcomes without disclosing proprietary implementation details.
            </div>
          </section>

          {/* Feature Grid */}
          <div className="ucp-grid ucp-grid-3 ucp-section">
            <div className="ucp-card">
              <h3>Command Precision</h3>
              <p>Replace open-ended prompting with structured intent and repeatable execution outcomes.</p>
            </div>
            <div className="ucp-card">
              <h3>Governance & Auditability</h3>
              <p>Intent can be managed, reviewed, and aligned to operational policy and compliance needs.</p>
            </div>
            <div className="ucp-card">
              <h3>Efficiency</h3>
              <p>Reduce workflow overhead and repeated back-and-forth that inflates time, cost, and compute.</p>
            </div>
          </div>

          {/* Aside + Content Grid */}
          <div className="ucp-grid ucp-section">
            <div className="ucp-card ucp-aside">
              <h3>Built by Omega UI, LLC</h3>
              <p>
                SynCloud Connect unifies demos, products, and tools across the ecosystem—anchored by UCP as the intent infrastructure layer.
              </p>
              <a href="https://ucp.omegaui.com" className="ucp-btn" target="_blank" rel="noopener noreferrer">
                Open UCP Live Demo
              </a>
            </div>

            <div className="ucp-card">
              <h3>What is Intent Infrastructure?</h3>
              <p>
                Intent infrastructure is about formalizing human goals into repeatable, auditable execution—moving beyond the unpredictability of natural language prompting.
              </p>
              <ul style={{ fontSize: '13px', opacity: 0.9 }}>
                <li>Same prompt can produce different outcomes</li>
                <li>Context must be resent and reprocessed repeatedly</li>
                <li>Workflows become harder to audit and control</li>
                <li>Operational costs rise with repeated interactions</li>
              </ul>
            </div>
          </div>

          {/* Comparison Table */}
          <section className="ucp-section">
            <h2>Comparison: Prompting vs Agent Frameworks vs Intent Infrastructure</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="ucp-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>Prompting</th>
                    <th>Agent Frameworks</th>
                    <th>Intent Infrastructure</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Consistency</strong></td>
                    <td>
                      <XCircle className="ucp-comparison-icon" style={{ color: '#ff4444' }} />
                      Variable
                    </td>
                    <td>
                      <MinusCircle className="ucp-comparison-icon" style={{ color: '#ffaa00' }} />
                      Medium
                    </td>
                    <td>
                      <CheckCircle className="ucp-comparison-icon" style={{ color: '#4bce2a' }} />
                      High (deterministic)
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Governance</strong></td>
                    <td>
                      <XCircle className="ucp-comparison-icon" style={{ color: '#ff4444' }} />
                      Difficult
                    </td>
                    <td>
                      <MinusCircle className="ucp-comparison-icon" style={{ color: '#ffaa00' }} />
                      Partial
                    </td>
                    <td>
                      <CheckCircle className="ucp-comparison-icon" style={{ color: '#4bce2a' }} />
                      Native
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Auditability</strong></td>
                    <td>
                      <XCircle className="ucp-comparison-icon" style={{ color: '#ff4444' }} />
                      Poor
                    </td>
                    <td>
                      <MinusCircle className="ucp-comparison-icon" style={{ color: '#ffaa00' }} />
                      Limited
                    </td>
                    <td>
                      <CheckCircle className="ucp-comparison-icon" style={{ color: '#4bce2a' }} />
                      Strong
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Operational Cost</strong></td>
                    <td>
                      <XCircle className="ucp-comparison-icon" style={{ color: '#ff4444' }} />
                      High overhead
                    </td>
                    <td>
                      <MinusCircle className="ucp-comparison-icon" style={{ color: '#ffaa00' }} />
                      Medium
                    </td>
                    <td>
                      <CheckCircle className="ucp-comparison-icon" style={{ color: '#4bce2a' }} />
                      Lower overhead over repeated workflows
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Use Cases */}
          <section className="ucp-section">
            <h2>What Universal Command Protocol is designed to do</h2>
            <div className="ucp-card">
              <ul>
                <li>Recurring reporting workflows with consistent output formats</li>
                <li>Operational checklists executed the same way every time</li>
                <li>Controlled automation across CRM, messaging, and data tools</li>
                <li>Governable AI execution for internal teams and customers</li>
              </ul>
            </div>
          </section>

          {/* Deployed Sites */}
          <section className="ucp-section">
            <h2>Deployed sites & tools</h2>
            <div className="ucp-link-cards">
              <a href="https://ucp.omegaui.com" className="ucp-link-card" target="_blank" rel="noopener noreferrer">
                <h3>
                  UCP Live Demo
                  <ExternalLink style={{ width: 16, height: 16 }} />
                </h3>
                <p>Try the copy/paste workflow live.</p>
              </a>
              <a href="https://syncloudconnect.com/sitemap" className="ucp-link-card">
                <h3>SynCloud Connect Directory</h3>
                <p>Canonical directory for public demos, products, and tools.</p>
              </a>
              <a href="https://syncloudconnect.com/ucp" className="ucp-link-card">
                <h3>UCP Sales + Guide</h3>
                <p>Investor-safe explainer, comparisons, and FAQ.</p>
              </a>
              <a href="https://syncloudconnect.com/contact" className="ucp-link-card">
                <h3>Contact</h3>
                <p>Connect with Omega UI, LLC.</p>
              </a>
            </div>
          </section>

          {/* FAQ */}
          <section className="ucp-section">
            <h2>Frequently Asked Questions</h2>
            <div className="ucp-faq">
              {faqs.map((faq, index) => (
                <div key={index} className="ucp-faq-item">
                  <button
                    className="ucp-faq-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      className={`ucp-faq-icon ${openFaq === index ? 'open' : ''}`}
                      style={{ width: 20, height: 20 }}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="ucp-faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="ucp-footer">
            <div className="ucp-footer-org">Omega UI, LLC</div>
            <div className="ucp-footer-contact">
              Contact: <a href="mailto:ucp@syncloudconnect.com">ucp@syncloudconnect.com</a> • <a href="tel:941-882-0130">941-882-0130</a>
            </div>
            <div className="ucp-footer-patent">
              Universal Command Protocol is patent pending. No proprietary implementation details disclosed.
            </div>
            <div style={{ marginTop: 12 }}>
              © {new Date().getFullYear()} Omega UI, LLC. All rights reserved.
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}