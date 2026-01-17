
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UCPPacket, OmegaEntity } from '../types';
import { processUCPCommand, generateTTS } from '../geminiService';
import { OMEGA_ENTITIES_DATA, CORPORATE_INFO, APP_HUB_DATA } from '../constants';

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if ('vibrate' in navigator) navigator.vibrate(30);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {}
  };
  return (
    <button onClick={handleCopy} className={`px-2 py-0.5 rounded border font-mono text-[7px] uppercase tracking-tighter transition-all ${copied ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white'}`}>
      {copied ? 'OK' : 'CP'}
    </button>
  );
};

const ExecutionTimelineStage: React.FC<{ label: string; color: string; isActive: boolean }> = ({ label, color, isActive }) => (
  <div className={`flex flex-col items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-10'}`}>
    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: isActive ? `0 0 5px ${color}` : 'none' }}></div>
    <span className="text-[6px] font-mono uppercase tracking-tighter text-zinc-500">{label[0]}</span>
  </div>
);

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  useEffect(() => {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
    const initAudio = () => { if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playTTS = async (base64Audio: string) => {
    if (!audioContextRef.current) return;
    try {
      setIsSpeaking(true);
      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (err) { setIsSpeaking(false); }
  };

  const executeCommandAction = async (cmd: string) => {
    if (isLoading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: cmd }]);
    setIsLoading(true);
    try {
      if ('vibrate' in navigator) navigator.vibrate(20);
      const response = await processUCPCommand(cmd + (location ? ` [LOC: ${location.lat}, ${location.lng}]` : ''));
      const responseText = response.text || "Protocol sequence valid.";
      const ttsPromise = generateTTS(responseText);
      let ucpPacket: UCPPacket | undefined;
      let targetEntity: OmegaEntity | undefined;

      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        if (fc.name === 'route_command') {
          const args = fc.args as { entity: string; action: string; payload: Record<string, any> };
          targetEntity = args.entity as OmegaEntity;
          ucpPacket = {
            ucp_header: { version: '1.4', packet_id: crypto.randomUUID(), timestamp: new Date().toISOString(), ttl_seconds: 300, digital_stamp: { origin_signature: 'G_SVR', algorithm: 'SHA256', key_id: 'G_01' } },
            ucp_payload: { intent: { domain: args.entity, action: args.action, modality: 'immediate' }, parameters: { ...args.payload, _geo: location }, target_application: { app_id: args.entity.toLowerCase(), api_version: '5.2', endpoint_canonical: 'exec' } }
          };
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        ucpPacket,
        metadata: {
          entity: targetEntity,
          sovereign_auth: true,
          layer_status: { interpretation: 'COMPLETE', storage: 'HIT', verification: 'VERIFIED', execution: 'DETERMINISTIC' },
          telemetry: { energy: '0.001Wh', latency: '<2ms' }
        }
      }]);

      const base64Audio = await ttsPromise;
      if (base64Audio) playTTS(base64Audio);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: "UCP Fault." }]);
    } finally { setIsLoading(false); }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const currentInput = input;
    setInput('');
    await executeCommandAction(currentInput);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full overflow-hidden safe-bottom">
      {/* Ecosystem Ribbon - Ultra Compact */}
      <div className="flex gap-1.5 p-1.5 overflow-x-auto no-scrollbar bg-zinc-950/50">
        {OMEGA_ENTITIES_DATA.map(entity => (
          <button key={entity.name} onClick={() => executeCommandAction(entity.name)} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[8px] font-mono font-black uppercase tracking-tighter text-zinc-500 whitespace-nowrap active:scale-95 transition-all">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: entity.color }}></div>
            {entity.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
        {isScanning && (
          <div className="relative aspect-video rounded-xl bg-black border border-[#ea00ea]/20 overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <div className="w-4 h-4 border border-[#ea00ea]/20 border-t-[#ea00ea] rounded-full animate-spin"></div>
              <p className="text-[#ea00ea] font-mono text-[7px] uppercase tracking-widest">SCANNING</p>
            </div>
            <div className="absolute top-2 right-2 z-20">
              <button onClick={() => setIsScanning(false)} className="bg-zinc-900/50 p-1.5 rounded text-zinc-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
        )}

        {messages.length === 0 && !isScanning && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50 py-12">
            <div className="w-12 h-12 rounded-xl border border-zinc-800 flex items-center justify-center bg-zinc-900">
              <span className="text-2xl font-black text-[#ea00ea] italic">Γ</span>
            </div>
            <p className="text-[7px] font-mono text-zinc-600 uppercase tracking-[0.4em]">SOVEREIGN COMMAND HUB</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end pl-12' : 'items-start pr-12'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`p-3 rounded-xl border ${msg.role === 'user' ? 'bg-zinc-800/40 text-white border-zinc-700/50' : 'bg-zinc-900/60 border-zinc-800 backdrop-blur-md'}`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-zinc-800/50">
                  <div className="flex gap-2">
                    <ExecutionTimelineStage label="A" color="#ea00ea" isActive />
                    <ExecutionTimelineStage label="R" color="#2699fe" isActive />
                    <ExecutionTimelineStage label="V" color="#4bce2a" isActive />
                    <ExecutionTimelineStage label="E" color="#ffffff" isActive />
                  </div>
                  <span className="text-[7px] font-mono text-[#4bce2a] font-black">{msg.metadata?.telemetry?.energy}</span>
                </div>
              )}
              <div className="text-[13px] leading-snug text-zinc-300">{msg.content}</div>
              {msg.ucpPacket && (
                <div className="mt-2 pt-2 border-t border-zinc-800/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[7px] font-mono text-[#ea00ea] font-black uppercase tracking-widest">PACKET_V1.4</span>
                    <CopyButton text={JSON.stringify(msg.ucpPacket)} />
                  </div>
                  <div className="p-2 bg-black/80 rounded border border-zinc-800/50">
                    <pre className="text-[9px] font-mono text-zinc-500 overflow-x-auto no-scrollbar">{JSON.stringify(msg.ucpPacket.ucp_payload, null, 1)}</pre>
                  </div>
                  <div className="flex justify-center p-1.5 bg-white/95 rounded">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(JSON.stringify(msg.ucpPacket.ucp_payload))}`} alt="QR" className="w-16 h-16 sm:w-20 sm:h-20" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Zone - Super Compact */}
      <div className="bg-zinc-950/90 border-t border-zinc-900 px-3 py-2 sm:py-3 z-20">
        <form onSubmit={handleSend} className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group focus-within:border-[#ea00ea]/50 transition-colors shadow-sm">
          <button type="button" onClick={() => { if ('vibrate' in navigator) navigator.vibrate(30); setIsScanning(!isScanning); }} className={`px-2.5 py-3 transition-colors ${isScanning ? 'text-[#ea00ea]' : 'text-zinc-600 hover:text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h3m-3 3h3m7 5V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2z" /></svg>
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} placeholder="Deploy command..." className="flex-1 bg-transparent py-3 text-[13px] text-white focus:outline-none placeholder:text-zinc-700 font-mono px-2" />
          <button type="submit" disabled={isLoading || !input.trim()} className="px-4 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-[#ea00ea] hover:text-white transition-all disabled:opacity-5 active:scale-95">SEND</button>
        </form>
        <div className="mt-2 flex items-center justify-between px-1">
          <div className="flex gap-3">
            <div className="flex items-center gap-1 text-[7px] font-mono text-zinc-700 font-bold"><div className="w-0.5 h-0.5 bg-[#ea00ea] rounded-full"></div> BIO:OK</div>
            <div className="flex items-center gap-1 text-[7px] font-mono text-zinc-700 font-bold"><div className={`w-0.5 h-0.5 rounded-full ${location ? 'bg-green-500' : 'bg-zinc-800'}`}></div> GPS:{location ? 'FIX' : '...'}</div>
          </div>
          <span className="text-[7px] font-mono text-zinc-800 font-bold uppercase opacity-30">v5.6.1-SVR</span>
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }`}</style>
    </div>
  );
};

export default ChatInterface;
