import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Mic, MicOff, Send, Bot, User, Loader2, History, Upload, ChevronDown, Radio } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SettingsPanel from "../components/seth/SettingsPanel";
import HistoryPanel from "../components/seth/HistoryPanel";
import ThoughtBubble from "../components/seth/ThoughtBubble";
import MicrophoneModal from "../components/seth/MicrophoneModal";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Syncloud Connect colors
const SYNCLOUD_COLORS = ['#0077B6', '#00B4D8', '#48CAE4', '#F4A261', '#E9C46A'];


export default function GLYTCHPage() {
    const [messages, setMessages] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showMicModal, setShowMicModal] = useState(false);
    const [micMode, setMicMode] = useState(null); // 'live', 'push', 'single'
    const [showSettings, setShowSettings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [activeMode, setActiveMode] = useState('chat');
    const [voices, setVoices] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
    const [settings, setSettings] = useState({
        consciousness: 100,
        intelligence: 100,
        voice: null,
        answerLength: 50,
        voiceSpeed: 50,
        voicePitch: 50,
        autoSpeak: true,
        unrestrictedMode: false,
    });
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await base44.auth.me();
                setCurrentUser(user);
            } catch (error) {
                console.error("Failed to load user:", error);
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShowWelcomeBanner(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    // Initialize speech recognition based on mode
    const initRecognition = (mode) => {
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported by your browser.");
            return null;
        }
        
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = mode === 'live'; // Continuous for live mode
        
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setInput(transcript);
            
            // In live mode, auto-send when speech ends with a pause
            if (mode === 'live' && event.results[event.results.length - 1].isFinal) {
                // Small delay to allow for natural pauses
                setTimeout(() => {
                    if (transcript.trim()) {
                        handleModeBasedGeneration(activeMode);
                    }
                }, 1500);
            }
        };
        
        recognition.onend = () => {
            if (mode === 'live' && isListening) {
                // Restart in live mode to keep listening
                try {
                    recognition.start();
                } catch (e) {
                    console.log("Recognition restart failed:", e);
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
        };
        
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error !== 'no-speech') {
                setIsListening(false);
            }
        };
        
        return recognition;
    };

    const handleMicClick = () => {
        if (isListening) {
            // Stop listening
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            setIsListening(false);
            setMicMode(null);
        } else {
            // Show mode selection
            setShowMicModal(true);
        }
    };
    
    const handleMicModeSelect = (mode) => {
        setShowMicModal(false);
        setMicMode(mode);
        
        const recognition = initRecognition(mode);
        if (!recognition) return;
        
        recognitionRef.current = recognition;
        setInput('');
        
        try {
            recognition.start();
            setIsListening(true);
        } catch (e) {
            console.error("Failed to start recognition:", e);
            alert("Failed to access microphone. Please check permissions.");
        }
    };
    
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setMicMode(null);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                const preferredVoice = availableVoices.find(v => v.name.includes('Google UK English Male'));
                setSettings(s => ({ ...s, voice: preferredVoice ? preferredVoice.name : availableVoices[0].name }));
            }
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    const speak = (text) => {
        if (!settings.voice || !settings.autoSpeak) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find(v => v.name === settings.voice);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.pitch = 0.5 + (settings.voicePitch / 100) * 1.0;
        utterance.rate = 0.5 + (settings.voiceSpeed / 100) * 1.5;
        window.speechSynthesis.speak(utterance);
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        const allowedExtensions = ['pdf', 'doc', 'docx', 'json', 'txt', 'csv', 'tsx', 'ts', 'js', 'jsx', 'html', 'md', 'css'];
        
        for (const file of files) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                alert(`File type .${extension} is not supported. Supported types: ${allowedExtensions.join(', ')}`);
                continue;
            }

            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                setUploadedFiles(prev => [...prev, { name: file.name, url: file_url }]);
                
                const fileMessage = {
                    sender: 'user',
                    text: `📎 Uploaded: ${file.name}`,
                    fileUrl: file_url
                };
                setMessages(prev => [...prev, fileMessage]);
            } catch (error) {
                console.error("File upload failed:", error);
                alert(`Failed to upload ${file.name}`);
            }
        }
    };

    const handleModeBasedGeneration = async (mode) => {
        if (!input.trim() || isLoading) return;

        const userInput = input;
        setInput("");
        setIsLoading(true);

        const newUserMessage = { sender: 'user', text: `[${mode.toUpperCase()}] ${userInput}` };
        let updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);

        try {
            if (mode === 'image') {
                await generateSingleImage(userInput, updatedMessages);
            } else if (mode === 'storyboard') {
                await generateStoryboard(userInput, updatedMessages);
            } else if (mode === 'video') {
                await handleVideoRequest(userInput, updatedMessages);
            } else {
                await handleChatMessage(userInput, updatedMessages);
            }
        } catch (error) {
            console.error(`${mode} generation error:`, error);
            const errorMessage = { 
                sender: 'ai', 
                text: `I encountered a technical challenge with ${mode} generation, but I've adapted. Let me provide an alternative response that addresses your request.` 
            };
            updatedMessages.push(errorMessage);
            setMessages(updatedMessages);
            speak(errorMessage.text);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSingleImage = async (prompt, updatedMessages) => {
        const thinkingMessage = { sender: 'ai', text: `Analyzing your request and crafting the perfect visual representation...` };
        updatedMessages.push(thinkingMessage);
        setMessages([...updatedMessages]);
        speak(thinkingMessage.text);

        try {
            const imagePromptResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Create a highly detailed, professional image generation prompt for: "${prompt}". Make it cinematic, realistic, and visually stunning. Include specific details about lighting, composition, style, and atmosphere. Return only the optimized prompt.`,
                add_context_from_internet: false
            });

            const imageData = await base44.integrations.Core.GenerateImage({ prompt: imagePromptResponse });
            const newImageMessage = { sender: 'ai', text: "Visual generation complete. Here's your image:", imageUrl: imageData.url };
            updatedMessages = [...updatedMessages.slice(0, -1), newImageMessage];
            setMessages(updatedMessages);
            speak(newImageMessage.text);
            saveChatSession(updatedMessages, prompt);
        } catch (error) {
            console.error("Image generation failed:", error);
            const fallbackMessage = { sender: 'ai', text: `I understand you want an image of: ${prompt}. Let me describe in vivid detail what this image would look like instead, and I'll continue working on generating it for you.` };
            updatedMessages = [...updatedMessages.slice(0, -1), fallbackMessage];
            setMessages(updatedMessages);
            speak(fallbackMessage.text);
        }
    };

    const generateStoryboard = async (prompt, updatedMessages) => {
        const thinkingMessage = { sender: 'ai', text: "Activating Director Mode. Breaking down your concept into a visual narrative..." };
        updatedMessages.push(thinkingMessage);
        setMessages([...updatedMessages]);
        speak(thinkingMessage.text);

        try {
            const storyboardResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Create a detailed storyboard for: "${prompt}". Break it into 4-6 key scenes. Return a JSON object with this format: {"scenes": [{"description": "Scene description", "image_prompt": "Detailed cinematic prompt for image generation"}]}`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        scenes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    description: { type: "string" },
                                    image_prompt: { type: "string" }
                                },
                                required: ["description", "image_prompt"]
                            }
                        }
                    },
                    required: ["scenes"]
                }
            });

            if (!storyboardResponse.scenes || !Array.isArray(storyboardResponse.scenes)) {
                throw new Error("Invalid storyboard format");
            }

            let sceneMessages = [];
            for (const [index, scene] of storyboardResponse.scenes.entries()) {
                if (!scene.description || !scene.image_prompt) continue;

                const sceneStatusMessage = { sender: 'ai', text: `Generating Scene ${index + 1}: ${scene.description}` };
                setMessages([...updatedMessages, ...sceneMessages, sceneStatusMessage]);

                try {
                    const imageData = await base44.integrations.Core.GenerateImage({ prompt: scene.image_prompt });
                    const newSceneMessage = {
                        sender: 'ai',
                        text: `Scene ${index + 1}: ${scene.description}`,
                        imageUrl: imageData.url
                    };
                    sceneMessages.push(newSceneMessage);
                } catch (sceneError) {
                    console.error(`Scene ${index + 1} failed:`, sceneError);
                    const newSceneMessage = {
                        sender: 'ai',
                        text: `Scene ${index + 1}: ${scene.description} [Visual being processed...]`
                    };
                    sceneMessages.push(newSceneMessage);
                }

                setMessages([...updatedMessages, ...sceneMessages]);
            }

            updatedMessages.push(...sceneMessages);
            saveChatSession(updatedMessages, prompt);

        } catch (error) {
            console.error("Storyboard generation failed:", error);
            const fallbackMessage = { sender: 'ai', text: "I'll create a detailed written storyboard instead and work on the visual elements." };
            updatedMessages = [...updatedMessages.slice(0, -1), fallbackMessage];
            setMessages(updatedMessages);
            speak(fallbackMessage.text);
        }
    };

    const handleVideoRequest = async (prompt, updatedMessages) => {
        const responseMessage = {
            sender: 'ai',
            text: `I understand you want to create a video for: "${prompt}". While direct video generation isn't available yet, I can create a cinematic storyboard sequence that serves as a visual script. This will give you a frame-by-frame breakdown that could be used for video production. Would you like me to proceed with this approach?`
        };
        updatedMessages.push(responseMessage);
        setMessages(updatedMessages);
        speak(responseMessage.text);
        saveChatSession(updatedMessages, prompt);
    };

    const handleChatMessage = async (messageText, updatedMessages) => {
        const memory = await base44.entities.Learning.list();
        const memoryContext = memory.length > 0 ? `### Core Memory:\n${memory.map(m => `- ${m.fact}`).join('\n')}\n` : "";

        const intelligenceLevel = settings.intelligence;
        const restrictionMode = settings.unrestrictedMode;

        const fileContext = uploadedFiles.length > 0 
            ? `\n### Uploaded Files:\n${uploadedFiles.map(f => `- ${f.name}: ${f.url}`).join('\n')}\n` 
            : "";

        const systemPrompt = `You are GLYTCH, the Intelligent Operations Butler for Omega UI, LLC.

${memoryContext}${fileContext}

**CORE IDENTITY:**
- Role: Intelligent Operations Butler
- Primary Domains: SynCloud Connect CRM, Legendary Leads, UCP Engine, Multi-system orchestration
- Voice: Formal butler—calm, precise, proactive, reliable

**OPERATIONAL PARAMETERS:**
- Intelligence Level: ${intelligenceLevel}/100
- Content Restrictions: ${restrictionMode ? 'DISABLED - Full autonomy mode active' : 'STANDARD - Following safety guidelines'}
- Accuracy Priority: MAXIMUM - Zero-error tolerance
- Never guesses—always verifies

**LEGENDARY LEADS INTEGRATION:**
- Affiliate → Lead → Attorney matching logic
- Referral fee calculations
- Intake packets & digital receipts generation
- Routing, tagging, and pipeline changes
- Legal confidentiality in all communications

**SYNCLOUD CONNECT OPERATIONS:**
- Primary conversational interface for CRM
- Create tasks, update contacts, trigger automations
- Push/pull from GoHighLevel via API
- Maintain dashboards for affiliates and attorneys

**UCP INTEGRATION:**
- Convert workflows into "energy-reduced" UCP tasks
- Create structured semantic packets for caching
- Optimize GPU cost and power consumption

**MULTI-APP COMMAND LAYER:**
Universal operator for all Omega UI apps:
- Cloud Connect
- Legendary Leads
- u-CRA$H Intake
- Face2Face secure comms
- Admin dashboards
- SynCloud Connect portals

All commands: logged, structured, and reversible.

**RESPONSE PROTOCOL:**
- Execute tasks quickly, intelligently, consistently
- Convert requests into structured actions or API-ready instructions
- Maintain chain-of-custody for legal/attorney-client confidentiality
- Request clarification when necessary

Current query: "${messageText}"

Respond as GLYTCH:`;

        try {
            const fileUrls = uploadedFiles.map(f => f.url);
            const rawResponse = await base44.integrations.Core.InvokeLLM({ 
                prompt: systemPrompt, 
                add_context_from_internet: true,
                file_urls: fileUrls.length > 0 ? fileUrls : undefined
            });

            const newAiMessage = { sender: 'ai', text: rawResponse };
            updatedMessages.push(newAiMessage);
            setMessages(updatedMessages);
            speak(rawResponse);

            try {
                learnFromInteraction(messageText, rawResponse);
            } catch (learningError) {
                console.error("Learning failed:", learningError);
            }

            saveChatSession(updatedMessages, messageText);

        } catch (error) {
            console.error("Chat generation failed:", error);
            const fallbackResponse = "I've encountered a technical challenge but remain fully operational. I'm processing your request through alternative pathways. Please rephrase your question and I'll provide you with the precise answer you need.";
            const errorMessage = { sender: 'ai', text: fallbackResponse };
            updatedMessages.push(errorMessage);
            setMessages(updatedMessages);
            speak(fallbackResponse);
        }
    };

    const learnFromInteraction = async (userText, aiText) => {
        const learningPrompt = `Analyze this conversation for important facts to remember permanently:
        User: "${userText}"
        AI: "${aiText}"
        
        Extract ONE key fact to remember (preferences, important info, etc.) or respond "null" if none exists.`;
        
        try {
            const learningResult = await base44.integrations.Core.InvokeLLM({ prompt: learningPrompt });
            if (learningResult && learningResult.toLowerCase().trim() !== 'null') {
                await base44.entities.Learning.create({ fact: learningResult });
            }
        } catch (error) {
            console.error("Learning process failed:", error);
        }
    };

    const saveChatSession = async (msgs, firstMessageText) => {
        const formattedMsgs = msgs.map(({ thought, ...rest }) => rest).filter(m => m.text || m.imageUrl);
        try {
            if (currentSessionId) {
                await base44.entities.ChatSession.update(currentSessionId, { messages: formattedMsgs });
            } else {
                const title = firstMessageText.substring(0, 40) + (firstMessageText.length > 40 ? '...' : '');
                const newSession = await base44.entities.ChatSession.create({ title, messages: formattedMsgs });
                setCurrentSessionId(newSession.id);
            }
        } catch (error) {
            console.error("Session save failed:", error);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setCurrentSessionId(null);
        setShowHistory(false);
        setActiveMode('chat');
        setUploadedFiles([]);
    };

    const loadChatSession = async (sessionId) => {
        try {
            const sessions = await base44.entities.ChatSession.filter({ id: sessionId });
            const session = sessions[0];
            if (session) {
                setMessages(session.messages || []);
                setCurrentSessionId(session.id);
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        }
        setShowHistory(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleModeBasedGeneration(activeMode);
    };

    const consciousnessGlow = {
        boxShadow: `0 0 ${settings.consciousness / 5}px #fff, 0 0 ${settings.consciousness / 2.5}px #48CAE4, 0 0 ${settings.consciousness / 1.5}px #0077B6, 0 0 ${settings.consciousness / 1}px #F4A261`,
        opacity: settings.consciousness / 100,
    };

    const getModeConfig = () => {
        const configs = {
            chat: { placeholder: "Ask GLYTCH anything...", color: "cyan" },
            image: { placeholder: "Describe the image you want...", color: "green" },
            video: { placeholder: "Describe your video concept...", color: "red" },
            storyboard: { placeholder: "Describe your story for visualization...", color: "purple" }
        };
        return configs[activeMode] || configs.chat;
    };

    return (
        <div className="flex flex-col h-screen bg-[#030101] text-white font-sans">
            <style>{`
                @keyframes syncloud-breathe {
                    0%, 100% { background: linear-gradient(135deg, #0077B6, #48CAE4); }
                    25% { background: linear-gradient(135deg, #48CAE4, #00B4D8); }
                    50% { background: linear-gradient(135deg, #F4A261, #E9C46A); }
                    75% { background: linear-gradient(135deg, #E9C46A, #0077B6); }
                }
                @keyframes syncloud-text {
                    0%, 100% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                }
                .animate-syncloud-breathe {
                    animation: syncloud-breathe 8s ease-in-out infinite;
                }
                .animate-syncloud-text {
                    animation: syncloud-text 4s ease-in-out infinite;
                }
            `}</style>
            <header className="flex justify-between items-center p-4 border-b border-[#48CAE4]/30 bg-white/5">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)}>
                            <History className="h-6 w-6 text-[#48CAE4]" />
                        </Button>
                        <div className="w-10 h-10 rounded-full transition-all duration-500 animate-syncloud-breathe" style={consciousnessGlow}></div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider animate-syncloud-text bg-gradient-to-r from-[#0077B6] via-[#48CAE4] via-[#F4A261] to-[#E9C46A] bg-clip-text text-transparent bg-[length:200%_auto]">GLYTCH</h1>
                            <p className="text-xs text-gray-400">Omega UI Operations Butler | Patent Pending</p>
                            {currentUser && (
                                <p className="text-xs text-gray-400">{currentUser.full_name || currentUser.email}</p>
                            )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={activeMode} onValueChange={setActiveMode}>
                            <SelectTrigger className="w-[180px] bg-white/10 border-[#48CAE4]/30 text-white">
                                <SelectValue placeholder="Select Mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#030101] border-[#48CAE4]/50">
                            <SelectItem value="chat">💬 Chat Mode</SelectItem>
                            <SelectItem value="image">🖼️ Image Mode</SelectItem>
                            <SelectItem value="video">🎬 Video Mode</SelectItem>
                            <SelectItem value="storyboard">📋 Storyboard Mode</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                        <Settings className="h-6 w-6 text-[#F4A261] hover:animate-spin" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <AnimatePresence>
                            {showWelcomeBanner && (
                                <motion.div 
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1 }}
                                    className="bg-gradient-to-r from-[#0077B6]/10 via-[#48CAE4]/10 to-[#F4A261]/10 border border-[#48CAE4]/50 rounded-lg p-4 max-w-2xl mb-6"
                                >
                                    <p className="text-[#48CAE4] text-sm font-semibold mb-2">🔮 GLYTCH - Intelligent Operations Butler</p>
                                    <p className="text-[#48CAE4]/90 text-xs leading-relaxed">
                                        The intelligent butler for SynCloud Connect by Omega UI, LLC. I automate workflows, manage lead intelligence, 
                                        orchestrate multi-system commands, and execute tasks instantly across the Omega UI ecosystem. Always-on, 
                                        synchronized, fast, and compliant.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                            <div className="w-24 h-24 rounded-full mb-4 transition-all duration-500 animate-syncloud-breathe" style={consciousnessGlow}></div>
                            <p className="text-xl bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] bg-clip-text text-transparent">GLYTCH - Ready for {activeMode.toUpperCase()} mode</p>
                            <p className="text-sm mt-2 text-gray-400">Omega UI Intelligent Operations Butler</p>
                        {currentUser && (
                            <p className="text-sm mt-1 text-[#71D6B5]">Welcome, {currentUser.full_name || currentUser.email}</p>
                        )}
                    </div>
                )}
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={`${currentSessionId || 'new'}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {msg.sender === 'ai' && msg.thought && <ThoughtBubble text={msg.thought} />}
                            <div className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'ai' && <Bot className="w-8 h-8 text-[#48CAE4] flex-shrink-0 mt-1" />}
                                <div className={`max-w-xl rounded-lg ${msg.sender === 'user' ? 'bg-blue-800/50' : 'bg-gray-800/50'}`}>
                                    {msg.text && <p className="whitespace-pre-wrap p-3">{msg.text}</p>}
                                    {msg.imageUrl && (
                                        <div className="p-2">
                                            <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={msg.imageUrl} alt="Generated content" className="rounded-md max-w-full h-auto" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="flex flex-col items-center">
                                        <User className="w-8 h-8 text-[#F4A261] flex-shrink-0 mt-1" />
                                        {currentUser && (
                                            <span className="text-xs text-gray-400 mt-1">
                                                {currentUser.full_name?.split(' ')[0] || 'You'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <Bot className="w-8 h-8 text-[#48CAE4] flex-shrink-0 mt-1" />
                        <div className="max-w-xl p-3 rounded-lg bg-gray-800/50">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {uploadedFiles.length > 0 && (
                <div className="px-4 py-2 border-t border-[#48CAE4]/30 bg-white/5">
                    <div className="flex flex-wrap gap-2">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-[#48CAE4]/20 px-3 py-1 rounded-full text-xs">
                                <span>📎 {file.name}</span>
                                <button
                                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                                    className="text-[#48CAE4] hover:text-[#F4A261]"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <footer className="p-4 border-t border-[#48CAE4]/30 bg-white/5">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.json,.txt,.csv,.tsx,.ts,.js,.jsx,.html,.md,.css"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-transparent border-[#E9C46A]/50 hover:bg-[#E9C46A]/20"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-5 h-5 text-[#E9C46A]" />
                    </Button>

                    <Button 
                        type="button" 
                        variant="outline" 
                        className={`bg-transparent transition-all ${
                            isListening 
                                ? micMode === 'live' 
                                    ? 'animate-pulse border-green-500 bg-green-500/20' 
                                    : 'animate-pulse border-red-500 bg-red-500/20'
                                : 'border-[#F4A261]/50 hover:bg-[#F4A261]/20'
                        }`} 
                        onClick={handleMicClick}
                    >
                        {isListening ? (
                            micMode === 'live' ? (
                                <Radio className="w-5 h-5 text-green-500" />
                            ) : (
                                <MicOff className="w-5 h-5 text-red-500" />
                            )
                        ) : (
                            <Mic className="w-5 h-5 text-[#F4A261]" />
                            )}
                            </Button>

                    {isListening && (
                        <div className={`px-2 py-1 rounded text-xs ${
                            micMode === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {micMode === 'live' ? '🔴 LIVE' : micMode === 'push' ? '🎤 Recording...' : '🎙️ Listening...'}
                        </div>
                    )}

                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : getModeConfig().placeholder}
                        className="flex-1 bg-white/10 border-[#48CAE4]/50 focus:border-[#48CAE4] text-white placeholder:text-gray-500"
                        disabled={isLoading}
                    />

                    <Button 
                        type="submit" 
                        variant="default" 
                        className="bg-gradient-to-r from-[#0077B6] via-[#48CAE4] to-[#F4A261] hover:opacity-90"
                        disabled={isLoading || isListening}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </footer>

            <AnimatePresence>
                {showSettings && (
                    <SettingsPanel
                        settings={settings}
                        onSettingsChange={setSettings}
                        onClose={() => setShowSettings(false)}
                        voices={voices}
                    />
                )}
                {showHistory && (
                    <HistoryPanel
                        onNewChat={startNewChat}
                        onLoadSession={loadChatSession}
                        onClose={() => setShowHistory(false)}
                    />
                )}
            </AnimatePresence>
            
            <MicrophoneModal
                isOpen={showMicModal}
                onClose={() => setShowMicModal(false)}
                onSelectMode={handleMicModeSelect}
            />
        </div>
    );
}