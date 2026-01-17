import React, { useState, useEffect, useRef } from 'react';

const GLYTCHAIButler = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm GLYTCH, your AI automation butler. I can help you with data routing, CRM management, workflow automation, and executing complex business logic. What would you like me to do today?",
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [metrics, setMetrics] = useState({
    commandsProcessed: 1247,
    automationsRunning: 12,
    dataProcessed: '2.4GB',
    uptime: '99.9%'
  });
  
  const [workflows] = useState([
    { name: 'Lead Processing', status: 'running' },
    { name: 'Data Sync', status: 'running' },
    { name: 'Email Automation', status: 'idle' },
    { name: 'Backup Schedule', status: 'running' }
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const quickActions = [
    { label: 'Process Leads', action: 'leads' },
    { label: 'Backup Data', action: 'backup' },
    { label: 'Sync CRM', action: 'sync' },
    { label: 'Analyze Data', action: 'analyze' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        commandsProcessed: Math.floor(1200 + Math.random() * 100),
        automationsRunning: Math.floor(10 + Math.random() * 5),
        dataProcessed: (2.0 + Math.random() * 1).toFixed(1) + 'GB'
      }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const processCommand = async (command) => {
    const responses = {
      'lead': `I've initiated lead processing. Found 47 new leads in the queue. Processing them through the qualification workflow and routing to your CRM. Email notifications have been sent to the sales team.`,
      'backup': `Starting backup process across all connected cloud providers. Google Drive sync: ✓ Complete. Dropbox sync: ✓ Complete. iCloud sync: In progress... All data encrypted and secured.`,
      'sync': `CRM synchronization initiated. Updating contact records, syncing deal pipeline data, and refreshing automation triggers. 234 contacts updated, 12 new opportunities added.`,
      'analyze': `Analyzing current data patterns. Lead conversion rate: 23.4% (↑2.1%). Top lead source: Organic search (47%). Recommended action: Increase social media campaigns for Q4.`,
      'default': `I understand you want me to: "${command}". I'm processing this request and will execute the appropriate automation workflows. This may involve data routing, CRM updates, and triggering relevant business processes.`
    };
    
    let response = responses.default;
    
    // Simple keyword matching for demo
    for (const keyword in responses) {
      if (command.toLowerCase().includes(keyword)) {
        response = responses[keyword];
        break;
      }
    }
    
    return response;
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI processing delay
    setTimeout(async () => {
      const response = await processCommand(inputValue);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Send to GHL if embedded
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'ghl-automation',
          command: inputValue,
          response: response,
          timestamp: new Date().toISOString()
        }, '*');
      }
    }, 1500);
  };

  const handleQuickAction = (action) => {
    const actions = {
      'leads': 'Process all pending leads in the queue',
      'backup': 'Run complete backup across all cloud providers',
      'sync': 'Synchronize CRM data with all connected platforms',
      'analyze': 'Generate comprehensive data analytics report'
    };
    
    const command = actions[action];
    if (command) {
      setInputValue(command);
      setTimeout(() => sendMessage(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-5 min-h-screen flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              GLYTCH AI Butler
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/20 border border-green-500 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online & Ready
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Chat Section */}
          <div className="lg:col-span-3 flex flex-col bg-white/5 rounded-3xl overflow-hidden border border-white/10">
            
            {/* Chat Header */}
            <div className="p-6 bg-cyan-500/10 border-b border-white/10">
              <h2 className="text-xl font-semibold mb-2">Natural Language Command Center</h2>
              <p className="text-gray-300 text-sm">Tell GLYTCH what you need in plain English</p>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto max-h-96 min-h-80">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 mb-6 ${
                    message.type === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                    }`}
                  >
                    {message.type === 'user' ? '👤' : '🤖'}
                  </div>
                  <div
                    className={`max-w-md p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700'
                        : 'bg-cyan-500/10 border border-cyan-500/30'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl">
                    <span className="opacity-70">GLYTCH is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your command here... e.g., 'Route all new leads from the website to the CRM and send a welcome email'"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-400/30"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-sm transition-all duration-300 hover:bg-cyan-500/20 hover:transform hover:-translate-y-1"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Active Workflows */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">Active Workflows</h3>
              <div className="space-y-3">
                {workflows.map((workflow, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                    <span className="text-sm">{workflow.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        workflow.status === 'running'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {workflow.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* System Metrics */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">System Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{metrics.commandsProcessed}</div>
                  <div className="text-xs opacity-70 mt-1">Commands Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{metrics.automationsRunning}</div>
                  <div className="text-xs opacity-70 mt-1">Active Automations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{metrics.dataProcessed}</div>
                  <div className="text-xs opacity-70 mt-1">Data Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{metrics.uptime}</div>
                  <div className="text-xs opacity-70 mt-1">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expose API for GHL integration
window.glytchAPI = {
  sendCommand: function(command) {
    // This would need to be connected to the React component instance
    console.log('Command received:', command);
  },
  
  getConversationHistory: function() {
    // Return conversation history
    return [];
  },
  
  executeWorkflow: function(workflowName, parameters) {
    const command = `Execute ${workflowName} workflow with parameters: ${JSON.stringify(parameters)}`;
    this.sendCommand(command);
  }
};

export default GLYTCHAIButler;