import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  ArrowRight, 
  Leaf, 
  Zap, 
  Shield, 
  TrendingDown, 
  Layers,
  CheckCircle2,
  ChevronDown,
  Rocket
} from 'lucide-react';
import PilotQualificationModal from '../components/ucp/PilotQualificationModal';

export default function GreenAI() {
  const [pilotOpen, setPilotOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    // SEO Metadata
    document.title = 'Green AI Infrastructure | Universal Command Protocol (UCP) by Omega UI';
    
    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'AI energy savings through deterministic execution. UCP reduces token usage, inference overhead, and compute waste for sustainable AI infrastructure.';
    if (!document.querySelector('meta[name="description"]')) {
      document.head.appendChild(metaDescription);
    }

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = 'https://ucp.omegaui.com/green-ai';
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonical);
    }

    // OpenGraph tags
    const ogTags = [
      { property: 'og:title', content: 'Green AI Infrastructure | Universal Command Protocol' },
      { property: 'og:description', content: 'AI energy savings through deterministic execution. UCP reduces token usage and compute waste for sustainable AI infrastructure.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://ucp.omegaui.com/green-ai' },
      { property: 'og:image', content: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f4efdc3458d09380ec104/9be157a01_UCPlogowithgeometricshield.png' },
    ];

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.content = tag.content;
    });

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Green AI Infrastructure | Universal Command Protocol' },
      { name: 'twitter:description', content: 'AI energy savings through deterministic execution. Reduce token usage and compute waste.' },
      { name: 'twitter:image', content: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f4efdc3458d09380ec104/9be157a01_UCPlogowithgeometricshield.png' },
    ];

    twitterTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.name = tag.name;
        document.head.appendChild(element);
      }
      element.content = tag.content;
    });

    // JSON-LD Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "name": "Omega UI, LLC",
          "url": "https://ucp.omegaui.com",
          "logo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f4efdc3458d09380ec104/9be157a01_UCPlogowithgeometricshield.png",
          "description": "AI infrastructure company building Universal Command Protocol for sustainable, efficient AI operations"
        },
        {
          "@type": "SoftwareApplication",
          "name": "Universal Command Protocol (UCP)",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Cross-platform",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": "Intent layer that decouples AI reasoning from execution for energy-efficient, deterministic AI workflows"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is green AI infrastructure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Green AI infrastructure refers to systems and practices designed to reduce the environmental impact of artificial intelligence operations. This includes minimizing energy consumption, optimizing compute resources, reducing redundant processing, and implementing efficient inference patterns that lower the carbon footprint of AI deployments."
              }
            },
            {
              "@type": "Question",
              "name": "How does UCP reduce AI energy consumption?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "UCP reduces energy consumption by compiling natural language commands into compact, deterministic execution packets. This eliminates redundant token processing, enables caching of compiled intents, and converts verbose AI reasoning into efficient step-by-step instructions that can be executed consistently without repeated inference calls."
              }
            },
            {
              "@type": "Question",
              "name": "What is token optimization in AI systems?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Token optimization involves reducing the number of tokens (units of text) processed by language models. Since each token requires computational resources and energy, minimizing token usage through techniques like prompt compression, intent compilation, and deterministic execution patterns directly reduces costs and environmental impact."
              }
            },
            {
              "@type": "Question",
              "name": "Is UCP suitable for enterprise AI governance?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, UCP is designed with enterprise governance in mind. Its deterministic execution model provides full auditability, reproducibility, and compliance support. Every command produces the same execution steps, creating clear audit trails for regulatory requirements and security reviews."
              }
            },
            {
              "@type": "Question",
              "name": "What is deterministic AI execution?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Deterministic AI execution means that the same input consistently produces the same sequence of actions. UCP achieves this by compiling intents into standardized execution packets that expand into predefined steps, eliminating the variability inherent in traditional AI inference while maintaining the flexibility of natural language input."
              }
            },
            {
              "@type": "Question",
              "name": "How does UCP support sustainable AI operations?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "UCP supports sustainable AI operations by reducing compute waste, enabling efficient caching, minimizing redundant inference calls, and providing a lightweight intent layer that requires significantly fewer resources than traditional LLM pipelines. This approach is designed to reduce the environmental impact of AI systems at scale."
              }
            }
          ]
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Scroll spy for table of contents
    const handleScroll = () => {
      const sections = ['what-is', 'problem', 'how-it-works', 'benefits', 'use-cases', 'technical', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const keywords = [
    'green AI', 'sustainable AI', 'AI energy efficiency', 'token optimization',
    'inference optimization', 'LLMOps', 'AI infrastructure', 'deterministic execution',
    'prompt compression', 'AI governance', 'compute-efficient AI', 'AI cost reduction',
    'GPU efficiency', 'AI carbon footprint', 'energy-aware AI', 'AI orchestration'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b10] text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-[#0b0b10]/80 backdrop-blur-lg z-40">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f4efdc3458d09380ec104/9be157a01_UCPlogowithgeometricshield.png"
                alt="UCP Logo"
                className="h-10"
              />
            </Link>
            <nav className="flex items-center gap-6">
              <Link to={createPageUrl('Home')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Home
              </Link>
              <Link to={createPageUrl('About')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                About
              </Link>
              <Link to={createPageUrl('GreenAI')} className="text-sm font-semibold text-green-600 dark:text-green-500">
                Green AI
              </Link>
              <Link
                to={createPageUrl('UCPSimulator')}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-green-500 to-blue-500"
              >
                Try Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-50 dark:bg-green-900/20 px-4 py-2 text-sm text-green-700 dark:text-green-400 mb-6">
              <Leaf className="h-4 w-4" />
              Sustainable AI Infrastructure
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Green AI Infrastructure for{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Compute-Efficient Operations
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Universal Command Protocol (UCP) is designed to reduce AI energy consumption through 
              deterministic execution, token optimization, and inference efficiency. Built for enterprises 
              and startups committed to sustainable AI operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setPilotOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 shadow-lg"
              >
                Request Pilot Access <Rocket className="h-5 w-5" />
              </button>
              <Link
                to={createPageUrl('About') + '#pilot'}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-700 px-8 py-4 text-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Schedule Technical Walkthrough <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 sticky top-[73px] z-30">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-8">
          <div className="flex items-center gap-6 overflow-x-auto">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">JUMP TO:</span>
            {[
              { id: 'what-is', label: 'What is Green AI' },
              { id: 'problem', label: 'The Problem' },
              { id: 'how-it-works', label: 'How UCP Works' },
              { id: 'benefits', label: 'Benefits' },
              { id: 'use-cases', label: 'Use Cases' },
              { id: 'technical', label: 'Technical Summary' },
              { id: 'faq', label: 'FAQ' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`text-xs whitespace-nowrap transition-colors ${
                  activeSection === id
                    ? 'text-green-600 dark:text-green-500 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        {/* What is Green AI */}
        <section id="what-is" className="mb-20 scroll-mt-32">
          <h2 className="text-3xl md:text-4xl font-black mb-6">What is Green AI and Why It Matters</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong>Green AI infrastructure</strong> refers to systems, practices, and technologies designed to minimize 
              the environmental impact of artificial intelligence operations. As AI deployment scales globally, the energy 
              consumption of training models and running inference has become a significant concern for enterprises, 
              startups, and infrastructure teams.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
              Traditional AI systems consume substantial compute resources because they repeatedly process similar prompts, 
              generate verbose outputs, and lack mechanisms for caching or reusing compiled intents. This results in 
              unnecessary GPU cycles, higher operational costs, and increased carbon emissions.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
              <strong>Sustainable AI operations</strong> are no longer optional—they are a business imperative. Organizations 
              implementing <em>energy-aware AI</em> strategies can reduce costs, meet regulatory requirements, and support 
              corporate sustainability commitments while maintaining or improving performance.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section id="problem" className="mb-20 scroll-mt-32">
          <h2 className="text-3xl md:text-4xl font-black mb-6">The Compute Waste Problem in LLM Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <TrendingDown className="h-8 w-8 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Redundant Token Processing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Most AI workflows process the same instructions repeatedly, burning tokens for tasks that could be 
                compiled once and executed deterministically.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <Zap className="h-8 w-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Excessive Inference Overhead</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Each LLM call requires compute resources. Without caching or intent reuse, organizations pay 
                for redundant inference cycles that could be avoided.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <Layers className="h-8 w-8 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Lack of Deterministic Execution</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Traditional AI systems produce variable outputs for the same input, making it impossible to cache 
                results or optimize execution patterns effectively.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <Shield className="h-8 w-8 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Poor Auditability</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Without deterministic behavior, organizations struggle to meet compliance requirements or conduct 
                meaningful audits of AI operations.
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            These challenges compound at scale. For enterprises running thousands or millions of AI operations, the 
            cumulative energy consumption, cost, and carbon footprint become material concerns that require architectural 
            solutions—not just incremental optimizations.
          </p>
        </section>

        {/* How UCP Works */}
        <section id="how-it-works" className="mb-20 scroll-mt-32">
          <h2 className="text-3xl md:text-4xl font-black mb-6">How UCP Supports Compute-Efficient AI</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            Universal Command Protocol addresses these challenges through a novel approach: <strong>decoupling AI reasoning 
            from execution</strong>. Instead of forcing language models to reason through every step of every task, UCP 
            compiles natural language commands into compact, deterministic execution packets.
          </p>

          <div className="space-y-8">
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold mb-3">Interpret Once, Execute Many</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                UCP compiles a user's natural language command into a structured <strong>intent packet</strong>—a compact 
                representation of what needs to happen. This packet can be cached, reused, and executed deterministically 
                without requiring additional AI inference. The result: you pay for reasoning once, then execute the same 
                intent repeatedly at minimal cost.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Token reduction:</strong> Eliminates verbose prompt repetition
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Caching-friendly:</strong> Same input produces same packet for efficient reuse
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Cross-platform:</strong> Packets are portable across AI providers and infrastructure
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-2xl font-bold mb-3">Deterministic Execution + Caching Patterns</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Once compiled, UCP packets expand into <strong>deterministic execution steps</strong>. These steps are 
                predefined, repeatable, and consistent—meaning the same packet always produces the same sequence of 
                actions. This determinism enables aggressive caching, replay, and optimization strategies that are 
                impossible with traditional nondeterministic AI outputs.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Inference reduction:</strong> Can reduce repeated inference calls for similar commands
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Execution optimization:</strong> Steps can be parallelized, batched, or deferred
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Resource efficiency:</strong> Designed to reduce compute waste at the protocol level
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-2xl font-bold mb-3">Audit Trails and Replayability</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Because UCP packets are deterministic, every execution creates a complete, reproducible audit trail. 
                Organizations can log intents, replay executions, and validate outputs without re-running expensive 
                AI inference. This is critical for <strong>AI governance</strong>, compliance, and security reviews.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Full traceability:</strong> Every packet + execution step is logged
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Reproducible outcomes:</strong> Replay past commands for validation or debugging
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong>Compliance-ready:</strong> Supports regulatory requirements for AI transparency
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Who It's For / Benefits */}
        <section id="benefits" className="mb-20 scroll-mt-32">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Benefits for Startups and Enterprises</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            UCP is built for organizations that need to scale AI operations responsibly—balancing performance, cost, 
            and environmental impact.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3 text-green-700 dark:text-green-400">AI Startups</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Reduce infrastructure costs by minimizing redundant inference</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Build sustainable AI products from day one</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Scale operations without proportional cost increases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Maintain flexibility across AI providers</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-700 dark:text-purple-400">Enterprises</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Meet corporate sustainability and ESG commitments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Achieve compliance through deterministic audit trails</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Reduce total cost of ownership for AI operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Improve governance and risk management</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3 text-orange-700 dark:text-orange-400">DevOps & AI Teams</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Simplify AI orchestration with portable intent packets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Enable caching and optimization at the infrastructure level</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Improve observability and debugging capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Reduce operational complexity of LLMOps</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="mb-20 scroll-mt-32">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Use Cases for Green AI Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">AI Agent Orchestration</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Coordinate multiple AI agents efficiently by compiling intents once and distributing deterministic 
                execution packets. Reduces redundant reasoning and improves system coherence.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">Enterprise Automation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Automate business workflows with auditability and compliance. UCP's deterministic execution ensures 
                regulatory requirements are met while reducing operational overhead.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">Cost-Sensitive AI Products</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Build AI-powered SaaS products where margins matter. Token optimization and caching patterns help 
                maintain profitability at scale.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">Regulatory Compliance</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Meet industry regulations requiring AI explainability and auditability. UCP packets provide full 
                traceability and reproducibility for compliance reviews.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">High-Volume Operations</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Organizations processing thousands of AI requests per day benefit from UCP's caching and reuse patterns, 
                which can reduce repeated inference calls significantly.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">Sustainable Infrastructure</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Organizations committed to reducing their carbon footprint can use UCP as part of a broader green 
                AI strategy, designed to reduce compute waste.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Summary */}
        <section id="technical" className="mb-20 scroll-mt-32">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Technical Summary</h2>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">Intent Compilation:</strong>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    Natural language commands are compiled into compact UCP packets using rule-based matching
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">Detokenization:</strong>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    Packets expand into deterministic execution steps via a command dictionary
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">Portability:</strong>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    UCP packets can be passed to any AI system or executed directly by infrastructure
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">Caching-Friendly:</strong>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    Same input → same packet → enables aggressive caching strategies
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">Auditability:</strong>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    Every packet and execution step is logged for compliance and debugging
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-white">Token Efficiency:</strong>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    Designed to reduce repeated token processing through intent reuse
                  </span>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Start with copy/paste validation:</strong> Generate UCP packets in the simulator and paste 
                them into your preferred AI system. Integrate directly when ready. <Link to={createPageUrl('UCPSimulator')} className="text-blue-600 dark:text-blue-400 hover:underline">Try the demo →</Link>
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-20 scroll-mt-32">
          <h2 className="text-3xl md:text-4xl font-black mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'What is green AI infrastructure?',
                a: 'Green AI infrastructure refers to systems and practices designed to reduce the environmental impact of artificial intelligence operations. This includes minimizing energy consumption, optimizing compute resources, reducing redundant processing, and implementing efficient inference patterns that lower the carbon footprint of AI deployments.'
              },
              {
                q: 'How does UCP reduce AI energy consumption?',
                a: 'UCP reduces energy consumption by compiling natural language commands into compact, deterministic execution packets. This eliminates redundant token processing, enables caching of compiled intents, and converts verbose AI reasoning into efficient step-by-step instructions that can be executed consistently without repeated inference calls.'
              },
              {
                q: 'What is token optimization in AI systems?',
                a: 'Token optimization involves reducing the number of tokens (units of text) processed by language models. Since each token requires computational resources and energy, minimizing token usage through techniques like prompt compression, intent compilation, and deterministic execution patterns directly reduces costs and environmental impact.'
              },
              {
                q: 'Is UCP suitable for enterprise AI governance?',
                a: 'Yes, UCP is designed with enterprise governance in mind. Its deterministic execution model provides full auditability, reproducibility, and compliance support. Every command produces the same execution steps, creating clear audit trails for regulatory requirements and security reviews.'
              },
              {
                q: 'What is deterministic AI execution?',
                a: 'Deterministic AI execution means that the same input consistently produces the same sequence of actions. UCP achieves this by compiling intents into standardized execution packets that expand into predefined steps, eliminating the variability inherent in traditional AI inference while maintaining the flexibility of natural language input.'
              },
              {
                q: 'How does UCP support sustainable AI operations?',
                a: 'UCP supports sustainable AI operations by reducing compute waste, enabling efficient caching, minimizing redundant inference calls, and providing a lightweight intent layer that requires significantly fewer resources than traditional LLM pipelines. This approach is designed to reduce the environmental impact of AI systems at scale.'
              },
              {
                q: 'Can UCP work with my existing AI infrastructure?',
                a: 'Yes, UCP is designed to be cross-platform and portable. You can generate UCP packets and paste them into any AI system for validation, or integrate them directly into your infrastructure when ready. The protocol does not lock you into any specific AI provider or platform.'
              },
              {
                q: 'What kind of results can I expect?',
                a: 'Results vary based on your specific use case, model, provider, and workload patterns. UCP is designed to reduce repeated inference calls, minimize token usage, and improve caching efficiency. The demo provides illustrative examples, but production outcomes depend on your implementation and usage patterns.'
              },
              {
                q: 'Is UCP suitable for startups or only enterprises?',
                a: 'UCP is designed for both. Startups benefit from reduced infrastructure costs and the ability to build sustainable AI products from the start. Enterprises benefit from governance, compliance, and ESG support. DevOps and AI teams benefit from simplified orchestration and improved observability.'
              },
              {
                q: 'How do I get started with UCP?',
                a: 'Start by exploring the interactive simulator to see how UCP compiles natural language into execution packets. If you are interested in a pilot program or technical walkthrough, request access through the pilot qualification form or schedule a consultation with our team.'
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-4">{faq.q}</h3>
                  <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related Terms */}
        <section className="mb-20 scroll-mt-32">
          <h2 className="text-2xl font-bold mb-4">Related Terms & Topics</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-block bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Build Sustainable AI Infrastructure?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join forward-thinking organizations using UCP to reduce AI energy consumption, optimize token usage, 
            and build compute-efficient operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setPilotOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-green-600 bg-white hover:bg-gray-100 shadow-lg"
            >
              Request Pilot Access <Rocket className="h-5 w-5" />
            </button>
            <Link
              to={createPageUrl('UCPSimulator')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white/10"
            >
              Try the Simulator <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to={createPageUrl('UCPSimulator')} className="hover:text-gray-900 dark:hover:text-white">UCP Simulator</Link></li>
                <li><Link to={createPageUrl('About')} className="hover:text-gray-900 dark:hover:text-white">About UCP</Link></li>
                <li><Link to={createPageUrl('GreenAI')} className="hover:text-gray-900 dark:hover:text-white">Green AI</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to={createPageUrl('About')} className="hover:text-gray-900 dark:hover:text-white">About Omega UI</Link></li>
                <li><Link to={createPageUrl('About') + '#pilot'} className="hover:text-gray-900 dark:hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#faq" className="hover:text-gray-900 dark:hover:text-white">FAQ</a></li>
                <li><a href="#technical" className="hover:text-gray-900 dark:hover:text-white">Technical Summary</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                © {new Date().getFullYear()} Omega UI, LLC<br />
                Universal Command Protocol<br />
                Patent Pending
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-500">
            UCP is designed to support sustainable AI operations. Results may vary by implementation.
          </div>
        </div>
      </footer>

      <PilotQualificationModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
    </div>
  );
}