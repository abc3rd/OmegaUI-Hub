import React, { useState } from "react";
import ConversationList from "../components/chat/ConversationList";
import ChatView from "../components/chat/ChatView";
import SettingsPanel from "../components/chat/SettingsPanel";
import PinLockScreen from "../components/auth/PinLockScreen";
import { usePinLock } from "../components/auth/hooks/usePinLock";
import { Button } from "@/components/ui/button";
import { Settings, MessageSquare } from "lucide-react";

export default function SecureChat() {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const { isLocked, needsSetup, unlock, enablePinLock, disablePinLock, changePin, isPinEnabled } = usePinLock();

  const handleTogglePinLock = (enabled) => {
    if (enabled) {
      enablePinLock();
    } else {
      if (confirm("Disable PIN lock? Your conversations will remain stored locally.")) {
        disablePinLock();
      }
    }
  };

  if (isLocked) {
    return <PinLockScreen onUnlock={unlock} isSetup={needsSetup} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Secure AI Chat</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-200 flex-shrink-0">
          <ConversationList
            onSelectConversation={setSelectedConversationId}
            selectedId={selectedConversationId}
          />
        </div>

        <div className="flex-1">
          {showSettings ? (
            <SettingsPanel 
              onPinChange={changePin}
              isPinEnabled={isPinEnabled}
              onTogglePinLock={handleTogglePinLock}
            />
          ) : (
            <ChatView conversationId={selectedConversationId} />
          )}
        </div>
      </div>
    </div>
  );
}