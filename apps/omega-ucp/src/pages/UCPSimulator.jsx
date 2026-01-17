import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Activity,
  Server,
  Cpu,
  ArrowRight,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  Rocket,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "../utils";
import BackendIndicator from "../components/ucp/BackendIndicator";
import RunHistoryPanel from "../components/ucp/RunHistoryPanel";
import PromptPackGenerator from "../components/ucp/PromptPackGenerator";
import PilotQualificationModal from "../components/ucp/PilotQualificationModal";

/**
 * UCP Simulator
 * - localStorage persistence for dictionary + rules
 * - NL -> Intent Packet (rule matching)
 * - Packet -> Deterministic steps (dictionary lookup)
 * - Trace + metrics simulation
 */

// ---------- localStorage helpers ----------
const LS_KEY = "omega_ucp_demo_v1";

function safeJsonParse(s, fallback) {
  try {
    const v = JSON.parse(s);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// ---------- default demo data (LOCAL ONLY - NOT PRODUCTION) ----------
const DEFAULT_STATE = {
  colors: {
    purple: "#ea00ea",
    blue: "#ea00ea",
    green: "#4bce2a",
    dark: "#3c3c3c",
    orange: "#c4653a",
  },
  dictionary: [
    {
      code: "DEMO-1",
      label: "Demo command (toy example only)",
      steps: [{ action: "demo", target: "local", params: {} }],
    },
  ],
  rules: [
    { id: "demo-r1", keywords: ["demo"], emit: ["DEMO-1"] },
  ],
  settings: {
    stdTokenPerTickBase: 10,
    stdTokenPerTickScale: 8,
    ucpTokenPerTickBase: 1,
    ucpTokenPerTickScale: 2,
    stdTokenCapBase: 650,
    stdTokenCapScale: 550,
    ucpTokenCapBase: 28,
    ucpTokenCapScale: 40,
    stdEnergyPerToken: 0.004,
    ucpEnergyPerToken: 0.001,
    dollarsPer1kTokens: 0.003,
    runsPerUserPerYear: 500,
    usersForAnnualization: 10000,
  },
};

export default function UCPSimulator() {
  // ---------- backend state ----------
  const [backendOnline, setBackendOnline] = useState(false);
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [pilotOpen, setPilotOpen] = useState(false);

  // Load runs from entities
  useEffect(() => {
    const loadRuns = async () => {
      try {
        const data = await base44.entities.UCPRun.list('-created_date', 25);
        setRuns(Array.isArray(data) ? data : []);
        setBackendOnline(true);
      } catch (e) {
        console.error('Failed to load runs:', e);
        setBackendOnline(false);
        setRuns([]);
      }
    };
    loadRuns();
    const interval = setInterval(loadRuns, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // ---------- load/persist state ----------
  const [store, setStore] = useState(() => {
    const fromLs = safeJsonParse(localStorage.getItem(LS_KEY), null);
    return fromLs ? { ...DEFAULT_STATE, ...fromLs } : DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  }, [store]);

  const colors = store.colors;

  // ---------- primary UI state ----------
  const [inputCommand, setInputCommand] = useState(
    "Analyze the Q3 sales data, generate a summary report, and email it to the executive team."
  );

  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [progress, setProgress] = useState(0);
  const [standardTokens, setStandardTokens] = useState(0);
  const [ucpTokens, setUcpTokens] = useState(0);

  const intervalRef = useRef(null);

  // ---------- server-side compilation state ----------
  const [compiledCodes, setCompiledCodes] = useState([]);
  const [intentPacket, setIntentPacket] = useState("UCP::EXEC::[NO-MATCH]");
  const [detokenizedSteps, setDetokenizedSteps] = useState([]);
  const [serverComplexity, setServerComplexity] = useState(0.2);
  
  // Use server-provided complexity
  const complexity = serverComplexity;

  // Compile on server when input changes
  useEffect(() => {
    const compile = async () => {
      if (!inputCommand.trim()) {
        setCompiledCodes([]);
        setIntentPacket("UCP::EXEC::[NO-MATCH]");
        setDetokenizedSteps([]);
        setServerComplexity(0.2);
        return;
      }

      try {
        const { data } = await base44.functions.invoke('compileUCP', { inputCommand });
        setCompiledCodes(data.compiledCodes || []);
        setIntentPacket(data.intentPacket || "UCP::EXEC::[NO-MATCH]");
        setDetokenizedSteps(data.detokenizedSteps || []);
        setServerComplexity(data.complexity || 0.2);
      } catch (e) {
        console.error('Compilation failed:', e);
        
        // Handle auth errors specifically
        if (e?.response?.status === 401) {
          setIntentPacket("UCP::EXEC::[AUTH_REQUIRED]");
          alert('Please sign in to use the UCP compiler.');
        } else {
          setIntentPacket("UCP::EXEC::[ERROR]");
        }
        
        setCompiledCodes([]);
        setDetokenizedSteps([]);
      }
    };

    const debounce = setTimeout(compile, 300);
    return () => clearTimeout(debounce);
  }, [inputCommand]);

  // ---------- simulation params ----------
  const s = store.settings;

  const standardCap = useMemo(() => Math.round(s.stdTokenCapBase + s.stdTokenCapScale * complexity), [s, complexity]);
  const ucpCap = useMemo(() => Math.round(s.ucpTokenCapBase + s.ucpTokenCapScale * complexity), [s, complexity]);

  const standardStep = useMemo(
    () => Math.max(8, Math.round(s.stdTokenPerTickBase + s.stdTokenPerTickScale * complexity)),
    [s, complexity]
  );
  const ucpStep = useMemo(
    () => Math.max(1, Math.round(s.ucpTokenPerTickBase + s.ucpTokenPerTickScale * complexity)),
    [s, complexity]
  );

  const estEnergyStandard = useMemo(() => standardTokens * s.stdEnergyPerToken, [standardTokens, s]);
  const estEnergyUcp = useMemo(() => ucpTokens * s.ucpEnergyPerToken, [ucpTokens, s]);

  const tokenSavingsPct = useMemo(() => {
    if (standardTokens <= 0) return 0;
    return clamp(((standardTokens - ucpTokens) / standardTokens) * 100, 0, 100);
  }, [standardTokens, ucpTokens]);

  const energySavingsPct = useMemo(() => {
    if (estEnergyStandard <= 0) return 0;
    return clamp(((estEnergyStandard - estEnergyUcp) / estEnergyStandard) * 100, 0, 100);
  }, [estEnergyStandard, estEnergyUcp]);

  const annualizedSavingsUSD = useMemo(() => {
    const perRunSavingsTokens = Math.max(0, standardCap - ucpCap);
    const perRunSavingsUSD = (perRunSavingsTokens / 1000) * s.dollarsPer1kTokens;
    return Math.round(perRunSavingsUSD * s.runsPerUserPerYear * s.usersForAnnualization);
  }, [standardCap, ucpCap, s]);

  // ---------- run/reset ----------
  const run = () => {
    if (phase === "running") return;

    setPhase("running");
    setProgress(0);
    setStandardTokens(0);
    setUcpTokens(0);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 2);

        setStandardTokens((t) => Math.min(standardCap, t + standardStep));
        setUcpTokens((t) => Math.min(ucpCap, t + ucpStep));

        if (next >= 100) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setPhase("done");
        }

        return next;
      });
    }, 50);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setPhase("idle");
    setProgress(0);
    setStandardTokens(0);
    setUcpTokens(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ---------- dictionary CRUD ----------
  const updateDictEntry = (idx, patch) => {
    setStore((prev) => {
      const next = { ...prev, dictionary: [...prev.dictionary] };
      next.dictionary[idx] = { ...next.dictionary[idx], ...patch };
      return next;
    });
  };

  const addDictEntry = () => {
    setStore((prev) => ({
      ...prev,
      dictionary: [
        ...prev.dictionary,
        { code: `NEW-${Date.now().toString().slice(-4)}`, label: "New command", steps: [{ action: "noop", target: "local", params: {} }] },
      ],
    }));
  };

  const deleteDictEntry = (idx) => {
    setStore((prev) => {
      const next = { ...prev, dictionary: prev.dictionary.filter((_, i) => i !== idx) };
      return next;
    });
  };

  // ---------- rules CRUD ----------
  const updateRule = (idx, patch) => {
    setStore((prev) => {
      const next = { ...prev, rules: [...prev.rules] };
      next.rules[idx] = { ...next.rules[idx], ...patch };
      return next;
    });
  };

  const addRule = () => {
    setStore((prev) => ({
      ...prev,
      rules: [...prev.rules, { id: `r-${Date.now()}`, keywords: ["keyword"], emit: ["GEN-RPT"] }],
    }));
  };

  const deleteRule = (idx) => {
    setStore((prev) => ({ ...prev, rules: prev.rules.filter((_, i) => i !== idx) }));
  };

  // ---------- import/export ----------
  const exportConfig = () => downloadJson("omega-ucp-demo-config.json", store);

  const fileInputRef = useRef(null);
  const importConfig = async (file) => {
    const text = await file.text();
    const obj = safeJsonParse(text, null);
    if (!obj) return;

    // merge with defaults (so missing fields won't break)
    setStore({ ...DEFAULT_STATE, ...obj });
  };

  // ---------- server sync ----------
  const saveToServer = async () => {
    alert('Config updates are read-only in demo mode. Use Export/Import JSON instead.');
  };

  const loadFromServer = async () => {
    try {
      const configs = await base44.entities.UCPConfig.list();
      if (configs.length > 0) {
        const config = configs[0];
        setStore((prev) => ({
          ...prev,
          dictionary: config.dictionary || prev.dictionary,
          rules: config.rules || prev.rules
        }));
        alert('Config loaded from server!');
      } else {
        alert('No config found on server.');
      }
    } catch (e) {
      alert('Failed to load from server: ' + (e?.message || String(e)));
    }
  };

  // ---------- real execution ----------
  const runReal = async () => {
    if (compiledCodes.length === 0) {
      alert('Please wait for compilation to complete.');
      return;
    }

    try {
      const run = await base44.entities.UCPRun.create({
        input_command: inputCommand,
        compiled_codes: compiledCodes,
        intent_packet: intentPacket,
        detokenized_steps: detokenizedSteps,
        standard_cap: standardCap,
        ucp_cap: ucpCap,
        complexity: complexity
      });
      setRuns((prev) => [run, ...prev]);
      setSelectedRun(run);
      alert(`Run created! ${run.compiled_codes.length} codes compiled.`);
    } catch (e) {
      alert('Failed to execute: ' + (e?.message || String(e)));
    }
  };

  const showResults = phase === "done";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans p-4 md:p-8 transition-colors">
      {/* Disclaimer Banner */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-yellow-100/80 dark:bg-yellow-900/20 border border-yellow-500/50 dark:border-yellow-700/50 rounded-lg px-4 py-3">
          <p className="text-xs text-yellow-800 dark:text-yellow-200/90 text-center">
            <strong>Demo Notice:</strong> This demo is illustrative and simplified. It does not represent the full production system or proprietary implementations. Do not enter confidential or personal data.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f4efdc3458d09380ec104/9be157a01_UCPlogowithgeometricshield.png"
              alt="UCP Logo"
              className="h-12"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Universal Command Protocol (UCP) | Patent Pending
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={createPageUrl('About')}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href={createPageUrl('Home')}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Home
            </a>
            <button
              onClick={exportConfig}
              className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 rounded flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 rounded flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importConfig(f);
                e.target.value = "";
              }}
            />

            <BackendIndicator isOnline={backendOnline} />
          </div>
        </div>
      </div>

      {/* Command + Intent */}
      <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-2xl">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">INPUT COMMAND (Natural Language)</label>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
            placeholder="Enter a complex task..."
            disabled={phase === "running"}
          />

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={run}
              disabled={phase === "running"}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {phase === "running" ? <Activity className="animate-spin h-5 w-5" /> : <Play className="h-5 w-5" />}
              SIMULATE
            </button>

            {backendOnline && (
              <button
                onClick={runReal}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-md flex items-center gap-2 transition-all"
              >
                <Rocket className="h-5 w-5" />
                RUN (REAL)
              </button>
            )}

            <button
              onClick={reset}
              className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-md flex items-center gap-2 transition-all"
            >
              <RotateCcw className="h-5 w-5" />
              RESET
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 font-mono text-xs">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Compiled Intent Packet</div>
            <div className="text-gray-900 dark:text-white break-words">
              <span className="text-purple-400">UCP</span>
              <span className="text-gray-500">::</span>
              <span className="text-blue-400">EXEC</span>
              <span className="text-gray-500">::</span>
              {compiledCodes.length ? (
                compiledCodes.map((c) => (
                  <span key={c} className="mr-2">
                    <span className="text-green-400">[{c}]</span>
                    <span className="text-gray-600">::</span>
                  </span>
                ))
              ) : (
                <span className="text-gray-500">[NO-MATCH]</span>
              )}
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 font-mono text-xs">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Detokenized Steps (Deterministic)</div>
            <div className="text-gray-900 dark:text-white space-y-1 max-h-24 overflow-auto pr-2">
              {detokenizedSteps.length ? (
                detokenizedSteps.map((st, i) => (
                  <div key={i} className="text-gray-200">
                    <span className="text-gray-500">{String(i + 1).padStart(2, "0")}.</span>{" "}
                    <span className="text-blue-400">{st.action}</span>{" "}
                    <span className="text-gray-500">@</span>{" "}
                    <span className="text-green-400">{st.target}</span>{" "}
                    <span className="text-gray-500">from</span>{" "}
                    <span className="text-purple-400">[{st.from || "N/A"}]</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No steps generated.</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
          <span className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700">complexity: {(complexity * 100).toFixed(0)}%</span>
          <span className="px-2 py-1 rounded border border-gray-700">std cap: {standardCap} tok</span>
          <span className="px-2 py-1 rounded border border-gray-700">ucp cap: {ucpCap} tok</span>
          <span className="px-2 py-1 rounded border border-gray-700">progress: {progress}%</span>
        </div>
      </div>

      {/* Visual Compare */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Standard */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900/30 overflow-hidden relative">
          <div className="bg-gray-100 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Server className="h-4 w-4" /> STANDARD LLM PIPELINE
            </h3>
            <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded">INEFFICIENT</span>
          </div>

          <div className="p-6 min-h-[280px] font-mono text-xs text-gray-600 dark:text-gray-400 overflow-y-auto">
            {progress > 0 ? (
              <div className="space-y-2">
                <p className="text-blue-400">{`> Parsing: "${inputCommand}"`}</p>
                <p>{`> Loading large context + tool schema...`}</p>
                <p>{`> Producing verbose intermediate structure...`}</p>
                <div className="opacity-60 whitespace-pre-wrap">
{`{
  "plan": [
    { "step": "retrieve", "source": "sales_db", "range": "Q3" },
    { "step": "analyze", "notes": "derivations + explanations for reliability" },
    { "step": "draft", "format": "exec_summary" },
    { "step": "send", "channel": "email", "audience": "executive_team" }
  ],
  "state": "repeated context to maintain continuity"
}`}
                </div>
                {progress > 55 && <p className="text-red-400 animate-pulse">{`> WARNING: High compute load detected`}</p>}
              </div>
            ) : (
              <p className="text-gray-500">Awaiting simulation run.</p>
            )}
          </div>

          <div className="bg-gray-900 p-4 border-t border-gray-700 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">TOKENS</p>
              <p className="text-2xl font-bold text-red-500">{standardTokens}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">EST. ENERGY</p>
              <p className="text-2xl font-bold text-red-500">
                {estEnergyStandard.toFixed(3)} <span className="text-sm">kWh</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">LATENCY</p>
              <p className="text-2xl font-bold text-red-500">{(1.2 + complexity * 0.8).toFixed(2)}s</p>
            </div>
          </div>
        </div>

        {/* UCP */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-green-500/30 overflow-hidden relative shadow-[0_0_30px_rgba(75,206,42,0.10)]">
          <div className="bg-gray-100 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-green-500" /> OMEGA UCP (LOCAL)
            </h3>
            <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-500/50">
              OPTIMIZED
            </span>
          </div>

          <div className="p-6 min-h-[280px] font-mono text-xs text-green-400 overflow-y-auto">
            {progress > 0 ? (
              <div className="space-y-2">
                <p className="text-white">{`> Input: "${inputCommand}"`}</p>
                <p className="text-blue-400">{`> Compile Intent → Packet`}</p>
                <div className="p-2 bg-gray-900 rounded border border-green-500/20 mt-2">
                  <p className="text-purple-400 mb-1">// UCP INTENT PACKET</p>
                  <p className="text-white break-words">{intentPacket}</p>
                </div>
                <p className="mt-2 text-gray-400">{`> Detokenize → deterministic local steps`}</p>
                <p className="text-green-500">{`> DONE. (${(0.08 + 0.05 * complexity).toFixed(2)}s)`}</p>
              </div>
            ) : (
              <p className="text-gray-500">Awaiting simulation run.</p>
            )}
          </div>

          <div className="bg-gray-900 p-4 border-t border-gray-700 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">TOKENS</p>
              <p className="text-2xl font-bold text-green-500">{ucpTokens}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">EST. ENERGY</p>
              <p className="text-2xl font-bold text-green-500">
                {estEnergyUcp.toFixed(3)} <span className="text-sm">kWh</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">LATENCY</p>
              <p className="text-2xl font-bold text-green-500">{(0.08 + 0.05 * complexity).toFixed(2)}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={`max-w-6xl mx-auto mt-8 transition-all duration-700 ${showResults ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-green-500 rounded-xl p-8 shadow-2xl relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ background: `linear-gradient(90deg, ${colors.purple}, ${colors.blue}, ${colors.green})` }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider mb-1">Token Savings</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white">{tokenSavingsPct.toFixed(0)}%</h2>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{Math.max(0, standardTokens - ucpTokens)} tokens avoided</p>
            </div>
            <div className="p-4 md:border-l md:border-gray-300 dark:md:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider mb-1">Energy Savings</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white">{energySavingsPct.toFixed(0)}%</h2>
              <p className="text-xs text-gray-500 mt-2">{(estEnergyStandard - estEnergyUcp).toFixed(3)} kWh avoided</p>
            </div>
            <div className="p-4 md:border-l md:border-gray-300 dark:md:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider mb-1">Latency Improvement</p>
              <h2 className="text-4xl font-black" style={{ color: colors.blue }}>
                {Math.max(1, ((1.2 + complexity * 0.8) / (0.08 + 0.05 * complexity))).toFixed(1)}x
              </h2>
              <p className="text-xs text-gray-500 mt-2">simulated speedup</p>
            </div>
            <div className="p-4 md:border-l md:border-gray-300 dark:md:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider mb-1">Annualized Savings</p>
              <h2 className="text-4xl font-black text-green-400">${annualizedSavingsUSD.toLocaleString()}</h2>
              <p className="text-xs text-gray-500 mt-2">illustrative model</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setPilotOpen(true)}
              className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2"
            >
              DEPLOY UCP PILOT <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Run Details */}
      {selectedRun && (
        <div className="max-w-6xl mx-auto mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-blue-500/30 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Selected Run Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 font-mono text-xs">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Input Command</div>
              <div className="text-gray-900 dark:text-white">{selectedRun.input_command}</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded p-3 font-mono text-xs">
              <div className="text-gray-400 mb-1">Intent Packet</div>
              <div className="text-green-400 break-words">{selectedRun.intent_packet}</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded p-3 font-mono text-xs">
              <div className="text-gray-400 mb-1">Compiled Codes</div>
              <div className="text-blue-400">{selectedRun.compiled_codes?.join(', ')}</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded p-3 font-mono text-xs">
              <div className="text-gray-400 mb-1">Metrics</div>
              <div className="text-white">
                STD: {selectedRun.standard_cap} | UCP: {selectedRun.ucp_cap} | 
                Savings: {selectedRun.standard_cap && selectedRun.standard_cap > 0 
                  ? ((1 - selectedRun.ucp_cap / selectedRun.standard_cap) * 100).toFixed(0) 
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Pack Generator */}
      {(phase === 'done' || selectedRun) && (
        <div className="max-w-6xl mx-auto mt-8">
          <PromptPackGenerator
            inputCommand={selectedRun?.input_command || inputCommand}
            intentPacket={selectedRun?.intent_packet || intentPacket}
            compiledCodes={selectedRun?.compiled_codes || compiledCodes}
            detokenizedSteps={selectedRun?.detokenized_steps || detokenizedSteps}
          />
        </div>
      )}

      {/* Admin Panels + Run History */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dictionary */}
        <div className="bg-gray-800 rounded-lg border border-yellow-700/50 p-5">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded px-3 py-2 mb-3">
            <p className="text-xs text-yellow-200/90">
              <strong>Note:</strong> This is a local toy configuration for demo purposes only. Production rules are server-side.
            </p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Demo Dictionary (Local Only)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={addDictEntry}
                className="text-xs bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 px-3 py-2 rounded flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {store.dictionary.map((d, idx) => (
              <div key={d.code + idx} className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Code</div>
                      <input
                        value={d.code}
                        onChange={(e) => updateDictEntry(idx, { code: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-700 rounded p-2 font-mono text-xs text-white"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Label</div>
                      <input
                        value={d.label}
                        onChange={(e) => updateDictEntry(idx, { label: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-700 rounded p-2 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDictEntry(idx)}
                    className="text-xs bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 px-2 py-2 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-400 mb-1">Steps (JSON)</div>
                  <textarea
                    value={JSON.stringify(d.steps, null, 2)}
                    onChange={(e) => {
                      const parsed = safeJsonParse(e.target.value, d.steps);
                      updateDictEntry(idx, { steps: parsed });
                    }}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded p-2 font-mono text-xs h-32 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-gray-800 rounded-lg border border-yellow-700/50 p-5">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded px-3 py-2 mb-3">
            <p className="text-xs text-yellow-200/90">
              <strong>Note:</strong> Demo rules only. Real compiler logic is proprietary and server-side.
            </p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Demo Rules (Local Only)
            </h3>
            <button
              onClick={addRule}
              className="text-xs bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 px-3 py-2 rounded flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <div className="space-y-4">
            {store.rules.map((r, idx) => (
              <div key={r.id} className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">Rule: {r.id}</div>
                  <button
                    onClick={() => deleteRule(idx)}
                    className="text-xs bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 px-2 py-2 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Keywords (comma separated)</div>
                    <input
                      value={r.keywords.join(", ")}
                      onChange={(e) =>
                        updateRule(idx, {
                          keywords: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full bg-gray-950 border border-gray-700 rounded p-2 font-mono text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Emit Codes (comma separated)</div>
                    <input
                      value={r.emit.join(", ")}
                      onChange={(e) =>
                        updateRule(idx, {
                          emit: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full bg-gray-950 border border-gray-700 rounded p-2 font-mono text-xs text-white"
                    />
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-600 dark:text-gray-500">
                  Matching logic: all keywords must appear in the input for this rule to fire.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Run History */}
        {backendOnline && (
          <RunHistoryPanel 
            runs={runs} 
            onSelectRun={setSelectedRun}
            selectedRunId={selectedRun?.id}
          />
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-10 text-xs text-gray-600 dark:text-gray-500 text-center">
        OMEGA UCP Simulator - Patent Pending
      </div>

      {/* Pilot Qualification Modal */}
      <PilotQualificationModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
    </div>
  );
}