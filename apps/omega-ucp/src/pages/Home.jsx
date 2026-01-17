import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  ArrowRight,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  FileText,
  Gauge,
  Sparkles,
  Lock,
} from "lucide-react";

export default function Home() {
  const colors = useMemo(
    () => ({
      purple: "#ea00ea",
      blue: "#2699fe",
      green: "#4bce2a",
      dark: "#3c3c3c",
      orange: "#c4653a",
      bg: "#0b0b10",
    }),
    []
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b10] text-gray-900 dark:text-white transition-colors">
      {/* Top gradient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-70"
        style={{
          background: `radial-gradient(900px 320px at 20% 10%, ${colors.purple}33, transparent 60%),
                       radial-gradient(900px 320px at 80% 10%, ${colors.blue}33, transparent 60%),
                       radial-gradient(900px 320px at 50% 30%, ${colors.green}22, transparent 60%)`,
        }}
      />

      {/* NAV */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f4efdc3458d09380ec104/9be157a01_UCPlogowithgeometricshield.png"
                alt="UCP Logo"
                className="h-9"
              />
              <div className="leading-tight">
                <div className="text-xs text-gray-500 dark:text-white/60">Universal Command Protocol</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={createPageUrl("About")}
                className="text-xs font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                to={createPageUrl("UCPSimulator")}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-black"
                style={{ background: `linear-gradient(90deg, ${colors.green}, ${colors.blue})` }}
              >
                Try the Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="mt-4 rounded-2xl border border-yellow-500/50 dark:border-yellow-700/50 bg-yellow-100/80 dark:bg-yellow-900/20 px-4 py-3 backdrop-blur">
            <p className="text-xs text-yellow-800 dark:text-yellow-200/90 text-center">
              <strong>Demo Notice:</strong> This demo is illustrative and simplified. It does not represent the full production system or proprietary implementations.
            </p>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pt-10 md:px-8 md:pt-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 text-xs text-gray-700 dark:text-white/80 backdrop-blur">
                <Sparkles className="h-4 w-4" style={{ color: colors.purple }} />
                <span className="font-semibold">UCP</span>
                <span className="text-white/50">•</span>
                <span>Patent Pending</span>
                <span className="text-white/50">•</span>
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Cross-platform
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl text-gray-900 dark:text-white">
                Turn messy natural language into{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(90deg, ${colors.purple}, ${colors.blue}, ${colors.green})` }}
                >
                  deterministic execution packets
                </span>
                .
              </h1>

              <p className="mt-5 max-w-xl text-base text-gray-600 dark:text-white/70 md:text-lg">
                Universal Command Protocol (UCP) is an intent layer that decouples AI reasoning from execution.
                You get a compact, repeatable packet (like an instruction barcode) that can be validated, cached,
                audited, and pasted into any AI for consistent results.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={createPageUrl("UCPSimulator")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-black shadow-lg transition hover:opacity-95"
                  style={{ background: `linear-gradient(90deg, ${colors.blue}, ${colors.purple})` }}
                >
                  Demo Now <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-6 text-xs text-gray-500 dark:text-white/50">
                Note: Savings and latency numbers shown in the demo are illustrative; results vary by model, provider, and workload.
              </div>
            </div>

            {/* HERO CARD */}
            <div className="relative">
              <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800 dark:text-white/90">UCP Packet Example</div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-3 py-1 text-xs text-gray-600 dark:text-white/70">
                    <Cpu className="h-4 w-4" style={{ color: colors.green }} />
                    Deterministic
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black/30 p-4 font-mono text-xs text-gray-700 dark:text-white/80">
                  <div className="text-gray-500 dark:text-white/50">// Natural language</div>
                  <div className="mt-2 text-gray-800 dark:text-white">
                    "Analyze Q3 sales data, generate a summary report, and email it to the executive team."
                  </div>

                  <div className="mt-4 text-gray-500 dark:text-white/50">// UCP intent packet</div>
                  <div className="mt-2 break-words">
                    <span style={{ color: colors.purple }}>UCP</span>
                    <span className="text-gray-400 dark:text-white/40">::</span>
                    <span style={{ color: colors.blue }}>EXEC</span>
                    <span className="text-gray-400 dark:text-white/40">::</span>
                    <span style={{ color: colors.green }}>[A72-Q3]</span>
                    <span className="text-gray-400 dark:text-white/40">::</span>
                    <span style={{ color: colors.green }}>[GEN-RPT]</span>
                    <span className="text-gray-400 dark:text-white/40">::</span>
                    <span style={{ color: colors.green }}>[SND-EXEC]</span>
                  </div>

                  <div className="mt-4 text-gray-500 dark:text-white/50">// Deterministic steps</div>
                  <div className="mt-2 space-y-1">
                    <div>01. query @ sales_db from [A72-Q3]</div>
                    <div>02. analyze @ sales_db from [A72-Q3]</div>
                    <div>03. format @ report_engine from [GEN-RPT]</div>
                    <div>04. notify @ email from [SND-EXEC]</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <StatCard label="Token Reduction" value="~95%" icon={Zap} color={colors.green} />
                  <StatCard label="Latency" value="Up to 12x" icon={Gauge} color={colors.blue} />
                  <StatCard label="Auditability" value="High" icon={ShieldCheck} color={colors.purple} />
                </div>
              </div>

              <div
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-50 blur-2xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.purple}33, ${colors.blue}22, ${colors.green}22)`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                Why UCP exists
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/65 md:text-base">
                Most AI workflows burn tokens describing work that a deterministic system can execute.
                UCP compresses intent into a stable packet that your stack can run consistently—today as copy/paste,
                tomorrow as a direct integration.
              </p>
            </div>
            <Link
              to={createPageUrl("UCPSimulator")}
              className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Launch Demo <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <FeatureCard
              title="Cross-platform by design"
              icon={Globe}
              color={colors.blue}
              text="Packets are portable: paste into any AI, or route into your tools later. UCP does not lock you into one model or provider."
            />
            <FeatureCard
              title="Deterministic execution"
              icon={Layers}
              color={colors.green}
              text="Convert ambiguous prompts into deterministic steps that can be validated, cached, audited, and replayed."
            />
            <FeatureCard
              title="Patent pending IP"
              icon={Lock}
              color={colors.purple}
              text="UCP is proprietary intellectual property under Omega UI with a patent-pending status, built to be commercialized."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pb-14 md:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-10">
            <h3 className="text-xl font-black md:text-2xl">How it works</h3>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <HowStep
                n="01"
                title="Capture intent"
                text="A user writes a normal instruction in plain English."
                accent={colors.blue}
              />
              <HowStep
                n="02"
                title="Compile a packet"
                text="UCP compiles intent into a compact, portable packet: UCP::EXEC::[CODES]."
                accent={colors.purple}
              />
              <HowStep
                n="03"
                title="Detokenize deterministically"
                text="Codes expand into deterministic steps. Same packet → same steps → consistent output."
                accent={colors.green}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-white/70">
                Start with copy/paste validation. Integrate later when ready.
              </div>
              <Link
                to={createPageUrl("UCPSimulator")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-black"
                style={{ background: `linear-gradient(90deg, ${colors.green}, ${colors.blue})` }}
              >
                Try It Now <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + DISCLAIMER */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
              <h3 className="text-xl font-black">FAQ</h3>
              <FaqItem
                q="Is UCP an AI model?"
                a="No. UCP is a protocol layer. It compiles intent into a portable packet and deterministic steps, and can sit on top of any AI provider."
              />
              <FaqItem
                q="Can I test it without integrating anything?"
                a="Yes. Use the demo, generate a copy/paste prompt pack, and paste it into your preferred AI to verify consistent outputs."
              />
              <FaqItem
                q='What does "deterministic" mean here?'
                a="Given the same dictionary + rules, UCP produces the same packet and the same step expansion. The AI output format is constrained for repeatability."
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
              <h3 className="text-xl font-black">Disclaimer</h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                This site and demo are provided for evaluation. Do not paste confidential or personal data.
                AI outputs may vary by model/provider and must be validated independently. Nothing here is legal,
                medical, or financial advice. Deterministic formatting is enforced where possible, but identical
                responses are not guaranteed across all AI systems.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={createPageUrl("UCPSimulator")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-black shadow-lg"
                  style={{ background: `linear-gradient(90deg, ${colors.blue}, ${colors.purple})` }}
                >
                  Open Demo <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          <footer className="mt-10 text-center text-xs text-white/45">
            © {new Date().getFullYear()} Omega UI, LLC • Universal Command Protocol (UCP) • Patent Pending
          </footer>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <div className="text-[11px] text-white/60">{label}</div>
      </div>
      <div className="mt-1 text-lg font-black">{value}</div>
    </div>
  );
}

function FeatureCard({ title, text, icon: Icon, color }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10">
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10"
          style={{ background: `${color}1a` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="text-base font-bold">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{text}</p>
    </div>
  );
}

function HowStep({ n, title, text, accent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-white/60">STEP {n}</div>
        <div className="h-2 w-2 rounded-full" style={{ background: accent }} />
      </div>
      <div className="mt-3 text-lg font-black">{title}</div>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{text}</p>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-bold">{q}</div>
      <div className="mt-2 text-sm text-white/70 leading-relaxed">{a}</div>
    </div>
  );
}