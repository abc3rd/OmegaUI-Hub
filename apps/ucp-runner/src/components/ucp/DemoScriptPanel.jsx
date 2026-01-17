import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, CheckCircle } from 'lucide-react';
const INVESTOR_DEMO_SCRIPT = [
  {
    step: 1,
    title: "Load Demo Pack",
    description: "Click 'Demo' to load sample packets and templates with baseline token counts."
  },
  {
    step: 2,
    title: "Open Compile",
    description: "Click 'Compile' and type an intent like 'capture lead and notify team'."
  },
  {
    step: 3,
    title: "Match Template",
    description: "See the template matching algorithm find the best match with a confidence score."
  },
  {
    step: 4,
    title: "Create Packet (Cache HIT)",
    description: "Select a matched template to create a packet — this is a 'cache hit' that saves tokens."
  },
  {
    step: 5,
    title: "Run Packet",
    description: "Execute the packet and watch real-time token tracking during execution."
  },
  {
    step: 6,
    title: "View Receipt Token Savings",
    description: "Check the receipt to see avoided tokens, cost saved, and reuse count."
  },
  {
    step: 7,
    title: "Run Again",
    description: "Run the same template again — reuse count increases, savings compound."
  }
];

const DemoScriptPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleStep = (step) => {
    if (completedSteps.includes(step)) {
      setCompletedSteps(completedSteps.filter(s => s !== step));
    } else {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-500/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-amber-100">Investor Demo Script</span>
          <span className="text-xs text-amber-400/60">
            ({completedSteps.length}/{INVESTOR_DEMO_SCRIPT.length} completed)
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-amber-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-amber-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {INVESTOR_DEMO_SCRIPT.map((item) => (
                <button
                  key={item.step}
                  onClick={() => toggleStep(item.step)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    completedSteps.includes(item.step)
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      completedSteps.includes(item.step)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {completedSteps.includes(item.step) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{item.step}</span>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        completedSteps.includes(item.step) ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoScriptPanel;