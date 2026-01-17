import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PilotQualificationModal({ open, onClose }) {
    const [step, setStep] = useState('form'); // form | submitting | result
    const [result, setResult] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [decisionRole, setDecisionRole] = useState('');
    const [timeline, setTimeline] = useState('');
    const [budget, setBudget] = useState('');
    const [useCase, setUseCase] = useState('');
    const [volume, setVolume] = useState('');
    const [pain, setPain] = useState('');
    const [commitAck, setCommitAck] = useState(false);
    const [preparedToPilot, setPreparedToPilot] = useState(false);
    const [evalFeeOk, setEvalFeeOk] = useState(false);

    // Compute qualification
    const { score, qualified, disqualifyReasons } = useMemo(() => {
        const reasons = [];
        let points = 0;

        // Hard fails
        if (!name || !email || !company || !role) {
            reasons.push('Missing required identity fields');
        }
        if (decisionRole === 'no') {
            reasons.push('No decision authority');
        }
        if (budget === 'none') {
            reasons.push('No budget available');
        }
        if (timeline === 'someday') {
            reasons.push('No clear timeline');
        }
        if (!commitAck) {
            reasons.push('Pilot commitment not acknowledged');
        }
        if (!preparedToPilot) {
            reasons.push('Not prepared to proceed');
        }

        // Hard fail check
        if (reasons.length > 0) {
            return { score: 0, qualified: false, disqualifyReasons: reasons };
        }

        // Scoring
        if (decisionRole === 'decision_maker') points += 5;
        else if (decisionRole === 'influencer') points += 3;

        if (timeline === '0_14') points += 5;
        else if (timeline === '15_30') points += 4;
        else if (timeline === '31_90') points += 2;

        if (budget === 'have') points += 5;
        else if (budget === 'need_approval') points += 3;

        if (volume === 'high') points += 3;
        else if (volume === 'medium') points += 2;
        else if (volume === 'low') points += 1;

        if (evalFeeOk) points += 2;

        const isQualified = points >= 12;
        return { score: points, qualified: isQualified, disqualifyReasons: [] };
    }, [name, email, company, role, decisionRole, timeline, budget, volume, commitAck, preparedToPilot, evalFeeOk]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setStep('submitting');

        try {
            const payload = {
                name,
                email,
                company,
                role,
                decisionRole,
                timeline,
                budget,
                useCase,
                volume,
                pain,
                commitAck,
                preparedToPilot,
                evalFeeOk,
                score,
                qualified,
                pageUrl: window.location.href
            };

            const { data } = await base44.functions.invoke('pilotRequest', payload);

            setResult(data);
            setStep('result');
        } catch (error) {
            if (error?.response?.status === 401) {
                setResult({ ok: false, error: 'Please sign in to request a pilot.' });
            } else {
                setResult({ ok: false, error: error?.message || String(error) });
            }
            setStep('result');
        }
    };

    const reset = () => {
        setStep('form');
        setResult(null);
        setName('');
        setEmail('');
        setCompany('');
        setRole('');
        setDecisionRole('');
        setTimeline('');
        setBudget('');
        setUseCase('');
        setVolume('');
        setPain('');
        setCommitAck(false);
        setPreparedToPilot(false);
        setEvalFeeOk(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">UCP Pilot Request</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {step === 'form' && 'Help us understand your readiness'}
                            {step === 'submitting' && 'Processing your request...'}
                            {step === 'result' && (result?.qualified ? 'Qualification Result' : 'Not Ready Yet')}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                {step === 'form' && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* A) Your Info */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Your Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name *"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-gray-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Work Email *"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-gray-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Company *"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    required
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-gray-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Role/Title *"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-gray-500"
                                />
                            </div>
                        </div>

                        {/* B) Readiness */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Readiness Assessment</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Decision Authority *</label>
                                    <select
                                        value={decisionRole}
                                        onChange={(e) => setDecisionRole(e.target.value)}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="">Select...</option>
                                        <option value="decision_maker">I make the final decision</option>
                                        <option value="influencer">I influence the decision</option>
                                        <option value="no">I cannot influence this decision</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Timeline *</label>
                                    <select
                                        value={timeline}
                                        onChange={(e) => setTimeline(e.target.value)}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="">Select...</option>
                                        <option value="0_14">0-14 days</option>
                                        <option value="15_30">15-30 days</option>
                                        <option value="31_90">31-90 days</option>
                                        <option value="someday">No specific timeline</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Budget *</label>
                                    <select
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="">Select...</option>
                                        <option value="have">Budget available</option>
                                        <option value="need_approval">Need approval</option>
                                        <option value="none">No budget</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Monthly Usage Volume *</label>
                                    <select
                                        value={volume}
                                        onChange={(e) => setVolume(e.target.value)}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="">Select...</option>
                                        <option value="low">Low (testing/exploration)</option>
                                        <option value="medium">Medium (department-level)</option>
                                        <option value="high">High (enterprise-level)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* C) Use Case */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Use Case</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Primary Goal *</label>
                                    <select
                                        value={useCase}
                                        onChange={(e) => setUseCase(e.target.value)}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="">Select...</option>
                                        <option value="cost_reduction">Cost reduction</option>
                                        <option value="governance">Governance & compliance</option>
                                        <option value="agents">AI agent orchestration</option>
                                        <option value="hybrid">Hybrid/multi-use</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Describe Your Pain Points</label>
                                    <textarea
                                        value={pain}
                                        onChange={(e) => setPain(e.target.value)}
                                        rows={3}
                                        placeholder="What challenges are you facing with current AI workflows?"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* D) Commitment */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Commitment</h3>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={commitAck}
                                        onChange={(e) => setCommitAck(e.target.checked)}
                                        required
                                        className="mt-1"
                                    />
                                    <span className="text-sm text-gray-300">
                                        I understand that a pilot requires dedicated time, resources, and active participation from our team. *
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preparedToPilot}
                                        onChange={(e) => setPreparedToPilot(e.target.checked)}
                                        required
                                        className="mt-1"
                                    />
                                    <span className="text-sm text-gray-300">
                                        If qualified, we are prepared to proceed with a pilot (not just exploring). *
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={evalFeeOk}
                                        onChange={(e) => setEvalFeeOk(e.target.checked)}
                                        className="mt-1"
                                    />
                                    <span className="text-sm text-gray-300">
                                        We are open to discussing an evaluation fee if required.
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Disqualification warning */}
                        {disqualifyReasons.length > 0 && (
                            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-400">Not Yet Ready</p>
                                        <ul className="text-xs text-red-300 mt-2 space-y-1">
                                            {disqualifyReasons.map((reason, i) => (
                                                <li key={i}>• {reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Qualification score preview */}
                        {disqualifyReasons.length === 0 && (
                            <div className={`border rounded-lg p-4 ${qualified ? 'bg-green-900/20 border-green-700' : 'bg-yellow-900/20 border-yellow-700'}`}>
                                <div className="flex items-center gap-3">
                                    {qualified ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-yellow-500" />
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            Qualification Score: {score}/20
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {qualified ? 'You meet the minimum requirements (12+)' : 'Below minimum threshold (need 12+)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all"
                        >
                            Submit Request
                        </button>
                    </form>
                )}

                {/* Submitting */}
                {step === 'submitting' && (
                    <div className="p-12 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                        <p className="text-white mt-4">Processing your request...</p>
                    </div>
                )}

                {/* Result */}
                {step === 'result' && result && (
                    <div className="p-6">
                        {result.ok && result.qualified ? (
                            <div className="text-center">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">You're Qualified!</h3>
                                <p className="text-gray-400 mb-6">
                                    Thank you for your interest in the UCP pilot program. We'll review your request and contact you within 24-48 hours.
                                </p>
                                {result.warning && (
                                    <p className="text-xs text-yellow-500 mb-4">Note: {result.warning}</p>
                                )}
                                <button
                                    onClick={handleClose}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                                >
                                    Close
                                </button>
                            </div>
                        ) : result.ok && !result.qualified ? (
                            <div className="text-center">
                                <XCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Not Ready Yet</h3>
                                <p className="text-gray-400 mb-6">
                                    Based on your responses, it looks like you might not be ready for a pilot program at this time. 
                                    We recommend exploring the demo further and revisiting when your timeline, budget, or decision authority are clearer.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
                                <p className="text-gray-400 mb-6">
                                    {result.error || 'Something went wrong. Please try again.'}
                                </p>
                                <button
                                    onClick={() => setStep('form')}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}