import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Check } from 'lucide-react';
import { useHead, useGoogleAnalytics } from '@/components/utils/useHead';

export default function UCPPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // SEO and Analytics
  useHead({
    title: 'Universal Command Protocol (UCP) — Intent Infrastructure by Omega UI, LLC',
    description: 'Universal Command Protocol (UCP) is an intent infrastructure approach for turning human intent into deterministic execution—reducing ambiguity, improving governance, and cutting operational waste.',
    canonical: 'https://ucp.omegaui.com',
    ogImage: 'https://syncloudconnect.com/assets/brand/ucp-logo.png',
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "name": "Omega UI, LLC",
          "url": "https://omegaui.com",
          "email": "ucp@syncloudconnect.com",
          "telephone": "941-882-0130",
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
            "name": "Intent Infrastructure, Command-Based AI"
          },
          "description": "Intent infrastructure for turning human intent into deterministic execution"
        }
      ]
    }
  });

  useGoogleAnalytics('G-SNLF60E7LE');

  const faqs = [
    {
      question: "How is this going to save money?",
      answer: "By reducing repeated prompting cycles and enabling reusable command structures, UCP lowers the per-interaction cost and minimizes wasted compute on ambiguous instructions."
    },
    {
      question: "What does this do for a home user?",
      answer: "Home users benefit from consistent, repeatable workflows—whether it's managing personal data, automating routine tasks, or interacting with AI tools in a more controlled and predictable way."
    },
    {
      question: "Is there an alternative I can test and compare?",
      answer: "Yes. You can compare traditional prompting methods or agent frameworks against UCP workflows using our live demo at ucp.omegaui.com to see the difference in consistency and efficiency."
    },
    {
      question: "How do I know the commands are right?",
      answer: "Commands are designed for transparency and governance. You can review, test, and audit command structures before deployment, ensuring they align with your operational requirements."
    }
  ];

  return (
    <div className="ucp-page">
      {/* Header */}
      <header className="ucp-header">
        <div className="ucp-container">
          <div className="ucp-header-content">
            <div className="ucp-brand">
              <ImageWithFallback 
                src="/assets/brand/syncloudconnect-icon.png"
                alt="SynCloud Connect Icon"
                className="ucp-brand-icon"
                fallbackText="SC"
              />
              <div className="ucp-brand-text">
                <h1 className="ucp-brand-title">SynCloud Connect</h1>
                <p className="ucp-brand-subtitle">Intent Infrastructure • Omega UI, LLC</p>
              </div>
            </div>
            <nav className="ucp-nav" aria-label="Main navigation">
              <a href="https://syncloudconnect.com" className="ucp-nav-btn">Home</a>
              <a href="https://ucp.omegaui.com" className="ucp-nav-btn ucp-nav-btn-primary" target="_blank" rel="noopener noreferrer">
                Try UCP Live Demo
              </a>
              <a href="https://syncloudconnect.com/sitemap" className="ucp-nav-btn">Directory</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="ucp-hero">
        <div className="ucp-container">
          <div className="ucp-hero-pills">
            <span className="ucp-pill">Universal Command Protocol</span>
            <span className="ucp-pill">Intent Infrastructure</span>
            <span className="ucp-pill ucp-pill-patent">Patent Pending</span>
            <span className="ucp-pill">Operational AI</span>
          </div>
          
          <h1 className="ucp-hero-title">
            From prompting to commands: operational AI that executes with consistency.
          </h1>
          
          <p className="ucp-hero-lead">
            Universal Command Protocol (UCP) is an intent infrastructure approach for turning human intent into deterministic execution—reducing ambiguity, improving governance, and cutting operational waste created by chat-based workflows.
          </p>

          <div className="ucp-patent-notice">
            <strong>Patent Pending Notice:</strong> UCP is patent pending. This page describes the value and outcomes without disclosing proprietary implementation details.
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="ucp-section">
        <div className="ucp-container">
          <div className="ucp-features-grid">
            <div className="ucp-feature-card">
              <h3 className="ucp-feature-title">Command Precision</h3>
              <p className="ucp-feature-desc">
                Replace open-ended prompting with structured intent and repeatable execution outcomes.
              </p>
            </div>
            <div className="ucp-feature-card">
              <h3 className="ucp-feature-title">Governance & Auditability</h3>
              <p className="ucp-feature-desc">
                Intent can be managed, reviewed, and aligned to operational policy and compliance needs.
              </p>
            </div>
            <div className="ucp-feature-card">
              <h3 className="ucp-feature-title">Efficiency</h3>
              <p className="ucp-feature-desc">
                Reduce workflow overhead and repeated back-and-forth that inflates time, cost, and compute.
              </p>
            </div>
          </div>

          {/* Aside Panel */}
          <aside className="ucp-aside-panel">
            <h3 className="ucp-aside-title">Built by Omega UI, LLC</h3>
            <p className="ucp-aside-text">
              SynCloud Connect unifies demos, products, and tools across the ecosystem—anchored by UCP as the intent infrastructure layer.
            </p>
            <a 
              href="https://ucp.omegaui.com" 
              className="ucp-aside-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open UCP Live Demo
              <ExternalLink size={16} />
            </a>
          </aside>
        </div>
      </section>

      {/* What is Intent Infrastructure */}
      <section className="ucp-section">
        <div className="ucp-container">
          <h2 className="ucp-section-title">What is Intent Infrastructure?</h2>
          <p className="ucp-section-lead">
            Intent infrastructure formalizes human goals into repeatable, deterministic execution patterns—moving beyond the limitations of conversational prompting.
          </p>
          <ul className="ucp-problem-list">
            <li>Same prompt can produce different outcomes</li>
            <li>Context must be resent and reprocessed repeatedly</li>
            <li>Workflows become harder to audit and control</li>
            <li>Operational costs rise with repeated interactions</li>
          </ul>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="ucp-section">
        <div className="ucp-container">
          <h2 className="ucp-section-title">How UCP Compares</h2>
          <div className="ucp-table-wrapper">
            <table className="ucp-comparison-table">
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
                  <td>Variable</td>
                  <td>Medium</td>
                  <td className="ucp-highlight">High (deterministic)</td>
                </tr>
                <tr>
                  <td><strong>Governance</strong></td>
                  <td>Difficult</td>
                  <td>Partial</td>
                  <td className="ucp-highlight">Native</td>
                </tr>
                <tr>
                  <td><strong>Auditability</strong></td>
                  <td>Poor</td>
                  <td>Limited</td>
                  <td className="ucp-highlight">Strong</td>
                </tr>
                <tr>
                  <td><strong>Operational Cost</strong></td>
                  <td>High overhead</td>
                  <td>Medium</td>
                  <td className="ucp-highlight">Lower overhead over repeated workflows</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="ucp-section">
        <div className="ucp-container">
          <h2 className="ucp-section-title">What Universal Command Protocol is designed to do</h2>
          <ul className="ucp-use-case-list">
            <li>
              <Check className="ucp-check-icon" />
              Recurring reporting workflows with consistent output formats
            </li>
            <li>
              <Check className="ucp-check-icon" />
              Operational checklists executed the same way every time
            </li>
            <li>
              <Check className="ucp-check-icon" />
              Controlled automation across CRM, messaging, and data tools
            </li>
            <li>
              <Check className="ucp-check-icon" />
              Governable AI execution for internal teams and customers
            </li>
          </ul>
        </div>
      </section>

      {/* Deployed Sites & Tools */}
      <section className="ucp-section">
        <div className="ucp-container">
          <h2 className="ucp-section-title">Deployed Sites & Tools</h2>
          <div className="ucp-links-grid">
            <a 
              href="https://ucp.omegaui.com" 
              className="ucp-link-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 className="ucp-link-title">UCP Live Demo</h3>
              <p className="ucp-link-desc">Try the copy/paste workflow live.</p>
              <ExternalLink className="ucp-link-icon" size={20} />
            </a>
            <a 
              href="https://syncloudconnect.com/sitemap" 
              className="ucp-link-card"
            >
              <h3 className="ucp-link-title">SynCloud Connect Directory</h3>
              <p className="ucp-link-desc">Canonical directory for public demos, products, and tools.</p>
              <ExternalLink className="ucp-link-icon" size={20} />
            </a>
            <a 
              href="https://syncloudconnect.com/ucp" 
              className="ucp-link-card"
            >
              <h3 className="ucp-link-title">UCP Sales + Guide</h3>
              <p className="ucp-link-desc">Investor-safe explainer, comparisons, and FAQ.</p>
              <ExternalLink className="ucp-link-icon" size={20} />
            </a>
            <a 
              href="https://syncloudconnect.com/contact" 
              className="ucp-link-card"
            >
              <h3 className="ucp-link-title">Contact</h3>
              <p className="ucp-link-desc">Connect with Omega UI, LLC.</p>
              <ExternalLink className="ucp-link-icon" size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="ucp-section">
        <div className="ucp-container">
          <h2 className="ucp-section-title">Frequently Asked Questions</h2>
          <div className="ucp-faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="ucp-faq-item">
                <button
                  className="ucp-faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  aria-expanded={expandedFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div 
                    id={`faq-answer-${index}`}
                    className="ucp-faq-answer"
                    role="region"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ucp-footer">
        <div className="ucp-container">
          <div className="ucp-footer-content">
            <div className="ucp-footer-brand">
              <ImageWithFallback 
                src="/assets/brand/omega-ui-logo.png"
                alt="Omega UI, LLC Logo"
                className="ucp-footer-logo"
                fallbackText="Ω"
              />
              <p className="ucp-footer-company">Omega UI, LLC</p>
            </div>
            <div className="ucp-footer-info">
              <p className="ucp-footer-contact">
                Contact: <a href="mailto:ucp@syncloudconnect.com">ucp@syncloudconnect.com</a> • <a href="tel:9418820130">941-882-0130</a>
              </p>
              <p className="ucp-footer-patent">
                Universal Command Protocol is patent pending. No proprietary implementation details disclosed.
              </p>
              <p className="ucp-footer-copyright">
                © {new Date().getFullYear()} Omega UI, LLC. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Image component with fallback
function ImageWithFallback({ src, alt, className, fallbackText }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`${className} ucp-image-fallback`} aria-label={alt}>
        {fallbackText}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
}