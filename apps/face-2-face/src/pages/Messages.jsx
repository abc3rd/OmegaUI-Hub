import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Shield, Lock, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const allConnections = await base44.entities.Connection.list();
      const userConnections = allConnections.filter(c =>
        c.status === "accepted" &&
        (c.user_a === userData.email || c.user_b === userData.email)
      );
      setConnections(userConnections);

      if (selectedChat) {
        await loadMessages();
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedChat || !user) return;

    try {
      const allMessages = await base44.entities.Message.list("-created_date", 100);
      const chatMessages = allMessages.filter(m =>
        m.conversation_id === selectedChat.id
      );
      setMessages(chatMessages.reverse());

      // Mark messages as read
      for (const msg of chatMessages) {
        if (msg.receiver_email === user.email && !msg.read) {
          await base44.entities.Message.update(msg.id, { read: true });
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      const friendEmail = selectedChat.user_a === user.email 
        ? selectedChat.user_b 
        : selectedChat.user_a;

      await base44.entities.Message.create({
        conversation_id: selectedChat.id,
        sender_email: user.email,
        receiver_email: friendEmail,
        content: newMessage,
        read: false
      });

      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to={createPageUrl("FaceToFace")}>
              <Button variant="ghost" className="text-slate-400 hover:text-white mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Face to Face
              </Button>
            </Link>
            <h1 className="text-4xl font-black text-white flex items-center gap-3">
              <MessageCircle className="w-10 h-10 text-blue-400" />
              Secure Messages
            </h1>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-4 py-2">
            <Lock className="w-4 h-4 mr-2" />
            End-to-End Encrypted
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="bg-slate-900/50 border-white/10 md:col-span-1">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Verified Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {connections.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm">No connections yet</p>
                  <Link to={createPageUrl("Handshake")}>
                    <Button size="sm" className="mt-4 bg-blue-500 hover:bg-blue-600">
                      Create Handshake
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {connections.map((connection) => (
                    <ContactItem
                      key={connection.id}
                      connection={connection}
                      userEmail={user?.email}
                      isSelected={selectedChat?.id === connection.id}
                      onClick={() => setSelectedChat(connection)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="bg-slate-900/50 border-white/10 md:col-span-2">
            {selectedChat ? (
              <>
                <CardHeader className="border-b border-white/10">
                  <ChatHeader connection={selectedChat} userEmail={user?.email} />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <AnimatePresence>
                        {messages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.sender_email === user?.email}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="p-4 border-t border-white/10 bg-slate-800/50">
                      <div className="flex gap-3">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type your message..."
                          className="bg-slate-900/50 border-slate-700 text-white resize-none"
                          rows={2}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-blue-500 hover:bg-blue-600 px-6"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Select a Contact</h3>
                <p className="text-slate-400">
                  Choose a verified connection to start secure messaging
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ connection, userEmail, isSelected, onClick }) {
  const [friend, setFriend] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadFriend();
    loadUnreadCount();
  }, []);

  const loadFriend = async () => {
    try {
      const friendEmail = connection.user_a === userEmail ? connection.user_b : connection.user_a;
      const allUsers = await base44.entities.User.list();
      const friendUser = allUsers.find(u => u.email === friendEmail);
      if (friendUser) setFriend(friendUser);
    } catch (error) {
      console.error("Error loading friend:", error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const allMessages = await base44.entities.Message.list();
      const unread = allMessages.filter(m =>
        m.conversation_id === connection.id &&
        m.receiver_email === userEmail &&
        !m.read
      );
      setUnreadCount(unread.length);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 hover:bg-white/5 transition-all text-left ${
        isSelected ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {friend?.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{friend?.full_name || 'User'}</p>
          <p className="text-xs text-slate-400 truncate">Verified Human</p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-blue-500 text-white">
            {unreadCount}
          </Badge>
        )}
      </div>
    </button>
  );
}

function ChatHeader({ connection, userEmail }) {
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    loadFriend();
  }, []);

  const loadFriend = async () => {
    try {
      const friendEmail = connection.user_a === userEmail ? connection.user_b : connection.user_a;
      const allUsers = await base44.entities.User.list();
      const friendUser = allUsers.find(u => u.email === friendEmail);
      if (friendUser) setFriend(friendUser);
    } catch (error) {
      console.error("Error loading friend:", error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
        {friend?.full_name?.[0]?.toUpperCase() || 'U'}
      </div>
      <div>
        <p className="font-bold text-white">{friend?.full_name || 'User'}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <p className="text-xs text-slate-400">Verified & Online</p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isOwn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-slate-800 text-white'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
          {format(new Date(message.created_date), 'h:mm a')}
        </p>
      </div>
    </motion.div>
  );
}