import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import NewChatDialog from '../components/chat/NewChatDialog';
import UserProfileDialog from '../components/chat/UserProfileDialog';
import {
  getOrCreateIdentityKeypair,
  exportPublicKeyJwk,
  importPublicKeyJwk,
  generateConversationKey,
  wrapConversationKey,
  unwrapConversationKey,
  encryptMessage,
  decryptMessage,
  encryptMetadata,
  decryptMetadata,
  cacheConversationKey,
  getCachedConversationKey,
  validateMessageInput,
  validateFileUpload
} from '../components/chat/EncryptionUtils';

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [identityKeypair, setIdentityKeypair] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [messageSendThrottle, setMessageSendThrottle] = useState({});
  const queryClient = useQueryClient();

  // Initialize user and identity keypair
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        // Ensure user has organization set to Omega UI
        if (!user.organization || user.organization !== 'Omega UI, LLC') {
          await base44.auth.updateMe({ organization: 'Omega UI, LLC' });
        }

        // Generate or load identity keypair
        const keypair = await getOrCreateIdentityKeypair(user.email);
        setIdentityKeypair(keypair);

        // Publish public key to UserKeyring if not already done
        const keyrings = await base44.entities.UserKeyring.filter({ user_email: user.email });
        if (keyrings.length === 0) {
          const publicKeyJwkString = await exportPublicKeyJwk(keypair.publicKey);
          await base44.entities.UserKeyring.create({
            user_email: user.email,
            organization: 'Omega UI, LLC',
            identity_public_key_jwk: publicKeyJwkString,
            identity_key_type: 'ECDH-P256'
          });
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        toast.error('Failed to initialize secure chat');
      }
    };
    initializeUser();
  }, []);

  // Fetch conversations (org-scoped)
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!currentUser) return [];
      const all = await base44.entities.Conversation.filter({ 
        organization: 'Omega UI, LLC'
      }, '-last_message_time');
      return all.filter(c => c.participants && c.participants.includes(currentUser.email));
    },
    enabled: !!currentUser,
  });

  // Fetch messages with pagination
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => base44.entities.Message.filter(
      { conversation_id: selectedConversation.id },
      'created_date',
      50
    ),
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  // Fetch org users only
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.filter(u => u.organization === 'Omega UI, LLC');
    },
    enabled: !!currentUser,
  });

  // Fetch user keyrings for key exchange
  const { data: userKeyrings = [] } = useQuery({
    queryKey: ['userKeyrings'],
    queryFn: async () => {
      return await base44.entities.UserKeyring.filter({ organization: 'Omega UI, LLC' });
    },
    enabled: !!currentUser,
  });

  // Update presence
  useEffect(() => {
    if (!currentUser) return;

    const updatePresence = async () => {
      try {
        if (currentUser.show_last_seen !== false) {
          await base44.auth.updateMe({
            last_seen: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Load and unwrap conversation key
  useEffect(() => {
    const loadConversationKey = async () => {
      if (!selectedConversation || !currentUser || !identityKeypair) return;

      // Check cache first
      const cachedKey = getCachedConversationKey(selectedConversation.id);
      if (cachedKey) return;

      try {
        // Parse key_wraps
        const keyWraps = JSON.parse(selectedConversation.key_wraps || '{}');
        const myWrap = keyWraps[currentUser.email];

        if (!myWrap) {
          console.error('No key wrap found for current user');
          toast.error('Cannot decrypt conversation - missing encryption key');
          return;
        }

        // Get sender's public key from keyring
        const senderKeyring = userKeyrings.find(k => k.user_email === selectedConversation.created_by);
        if (!senderKeyring) {
          console.error('Sender keyring not found');
          return;
        }

        const senderPublicKey = await importPublicKeyJwk(senderKeyring.identity_public_key_jwk);

        // Unwrap conversation key
        const conversationKey = await unwrapConversationKey(
          myWrap,
          identityKeypair.privateKey,
          senderPublicKey
        );

        cacheConversationKey(selectedConversation.id, conversationKey);
      } catch (error) {
        console.error('Error loading conversation key:', error);
        toast.error('Failed to decrypt conversation key');
      }
    };

    loadConversationKey();
  }, [selectedConversation, currentUser, identityKeypair, userKeyrings]);

  // Decrypt messages incrementally
  useEffect(() => {
    const decryptMessagesIncremental = async () => {
      if (!messages.length || !selectedConversation) return;

      const conversationKey = getCachedConversationKey(selectedConversation.id);
      if (!conversationKey) return;

      // Decrypt in batches to avoid UI lockup
      const batchSize = 10;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        
        await new Promise(resolve => {
          requestIdleCallback(async () => {
            const decrypted = {};
            for (const msg of batch) {
              if (decryptedMessages[msg.id]) {
                decrypted[msg.id] = decryptedMessages[msg.id];
                continue;
              }

              try {
                const content = await decryptMessage(conversationKey, msg.ciphertext_b64, msg.iv_b64);
                let metadata = null;

                if (msg.encrypted_metadata_b64 && msg.message_type !== 'text') {
                  metadata = await decryptMetadata(conversationKey, msg.encrypted_metadata_b64, msg.iv_b64);
                }

                decrypted[msg.id] = { content, metadata };
              } catch (error) {
                console.error('Error decrypting message:', error);
                decrypted[msg.id] = { content: '[Encrypted Message]', metadata: null };
              }
            }

            setDecryptedMessages(prev => ({ ...prev, ...decrypted }));
            resolve();
          });
        });
      }
    };

    decryptMessagesIncremental();
  }, [messages, selectedConversation]);

  // Create conversation with proper E2EE
  const createConversationMutation = useMutation({
    mutationFn: async ({ type, participants, name }) => {
      if (!identityKeypair) throw new Error('Identity keypair not initialized');

      // Generate conversation key
      const conversationKey = await generateConversationKey();

      // Wrap key for each participant
      const keyWraps = {};
      for (const participantEmail of participants) {
        const participantKeyring = userKeyrings.find(k => k.user_email === participantEmail);
        if (!participantKeyring) {
          throw new Error(`No keyring found for ${participantEmail}`);
        }

        const participantPublicKey = await importPublicKeyJwk(participantKeyring.identity_public_key_jwk);
        const wrap = await wrapConversationKey(conversationKey, identityKeypair.privateKey, participantPublicKey);
        keyWraps[participantEmail] = wrap;
      }

      const conversation = await base44.entities.Conversation.create({
        type,
        organization: 'Omega UI, LLC',
        participants,
        name,
        key_wraps: JSON.stringify(keyWraps),
        key_version: 1,
        last_message_time: new Date().toISOString()
      });

      cacheConversationKey(conversation.id, conversationKey);

      return conversation;
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(newConversation);
      setShowNewChat(false);
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  });

  // Send message with throttling
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, type, extraData }) => {
      // Throttle check
      const now = Date.now();
      const lastSent = messageSendThrottle[conversationId] || 0;
      if (now - lastSent < 300) {
        throw new Error('Please wait before sending another message');
      }

      // Validate input
      if (type === 'text') {
        content = validateMessageInput(content);
      }

      const conversationKey = getCachedConversationKey(conversationId);
      if (!conversationKey) throw new Error('No encryption key available');

      const { ciphertext_b64, iv_b64 } = await encryptMessage(conversationKey, content || '');

      let encrypted_metadata_b64 = null;
      if (extraData && type !== 'text') {
        const metadataResult = await encryptMetadata(conversationKey, extraData);
        encrypted_metadata_b64 = metadataResult.ciphertext_b64;
      }

      const message = await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: currentUser.email,
        ciphertext_b64,
        iv_b64,
        message_type: type || 'text',
        encrypted_metadata_b64,
        key_version: 1,
        read_by: [currentUser.email]
      });

      await base44.entities.Conversation.update(conversationId, {
        last_message_time: new Date().toISOString(),
        last_message_cipher_preview: ciphertext_b64.substring(0, 50)
      });

      setMessageSendThrottle(prev => ({ ...prev, [conversationId]: now }));

      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    }
  });

  const handleCreateChat = (type, participants, name) => {
    // Convert 'private' to 'direct' for conversation type
    const conversationType = type === 'private' ? 'direct' : type;
    createConversationMutation.mutate({ type: conversationType, participants, name });
  };

  const handleSendMessage = async (content) => {
    if (!selectedConversation || !content.trim()) return;

    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversation.id,
      content,
      type: 'text'
    });
  };

  const handleSendFile = async (file, caption) => {
    if (!selectedConversation) return;

    try {
      validateFileUpload(file);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        content: caption || file.name,
        type: 'file',
        extraData: {
          file_url,
          file_name: file.name,
          file_type: file.type
        }
      });
    } catch (error) {
      toast.error(error.message || 'Failed to upload file');
    }
  };

  const handleSendVoice = async (audioBlob) => {
    if (!selectedConversation || !audioBlob) return;

    try {
      const file = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        content: 'Voice message',
        type: 'voice',
        extraData: {
          file_url,
          voice_duration: 10
        }
      });
    } catch (error) {
      toast.error('Failed to send voice message');
    }
  };

  const handleSendLocation = async (lat, lng, name) => {
    if (!selectedConversation) return;

    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversation.id,
      content: name || 'Shared location',
      type: 'location',
      extraData: {
        location_lat: lat,
        location_lng: lng,
        location_name: name
      }
    });
  };

  if (!currentUser || !identityKeypair || conversationsLoading) {
    return (
      <div className="h-screen flex items-center justify-center omega-gradient">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8" style={{ color: '#ea00ea' }} />
          </div>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-white" />
          <p className="text-white font-semibold">Initializing secure encryption...</p>
          <p className="text-white/80 text-sm mt-1">Omega UI Connect Sphere</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <div className="w-80 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onNewChat={() => setShowNewChat(true)}
          onEditProfile={() => setShowProfileDialog(true)}
          currentUser={currentUser}
          allUsers={allUsers}
        />
      </div>

      <ChatWindow
        conversation={selectedConversation}
        messages={messages.map(msg => ({
          ...msg,
          decryptedContent: decryptedMessages[msg.id]?.content,
          decryptedMetadata: decryptedMessages[msg.id]?.metadata
        }))}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        onSendVoice={handleSendVoice}
        onSendLocation={handleSendLocation}
        onShowInfo={() => {}}
      />

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreateChat={handleCreateChat}
        allUsers={allUsers}
        currentUser={currentUser}
      />

      <UserProfileDialog
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        user={currentUser}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          window.location.reload();
        }}
      />
    </div>
  );
}