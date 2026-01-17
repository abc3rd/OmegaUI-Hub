import React, { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  MapPin, 
  Play, 
  Pause,
  ExternalLink,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function MessageBubble({ message, currentUser, onReaction }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const isOwn = message.created_by === currentUser?.email;

  // Get decrypted content
  const decryptedContent = message.decryptedContent || '[Encrypted Message - Cannot Decrypt]';
  const decryptedMetadata = message.decryptedMetadata || null;
  const isDecrypted = decryptedContent !== '[Encrypted Message - Cannot Decrypt]';

  const getFileIcon = (fileType) => {
    if (!fileType) return File;
    if (fileType.startsWith('image/')) return ImageIcon;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    return File;
  };

  const renderMessageContent = () => {
    if (!isDecrypted) {
      return (
        <div className="flex items-center gap-2 text-sm opacity-75">
          <Lock className="w-4 h-4" />
          <span>Message encrypted - unable to decrypt</span>
        </div>
      );
    }

    switch (message.message_type) {
      case 'file':
        if (!decryptedMetadata) {
          return <p className="text-sm">{decryptedContent}</p>;
        }
        
        const FileIcon = getFileIcon(decryptedMetadata.file_type);
        const isImage = decryptedMetadata.file_type?.startsWith('image/');
        
        return (
          <div className="space-y-2">
            {isImage ? (
              <img 
                src={decryptedMetadata.file_url} 
                alt={decryptedMetadata.file_name}
                className="rounded-lg max-w-xs max-h-64 object-cover"
              />
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileIcon className="w-8 h-8 text-emerald-600" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{decryptedMetadata.file_name}</p>
                  <p className="text-xs text-gray-500">Click to download</p>
                </div>
                <a 
                  href={decryptedMetadata.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download
                >
                  <Button size="icon" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            )}
            {decryptedContent && decryptedContent !== decryptedMetadata.file_name && (
              <p className="text-sm">{decryptedContent}</p>
            )}
          </div>
        );

      case 'voice':
        return (
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "rounded-full",
                isOwn ? "text-white hover:bg-emerald-700" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/3" />
            </div>
            <span className="text-xs opacity-75">
              {decryptedMetadata?.voice_duration || 0}s
            </span>
          </div>
        );

      case 'location':
        if (!decryptedMetadata) {
          return <p className="text-sm">{decryptedContent}</p>;
        }
        
        return (
          <div className="space-y-2">
            <div className="bg-gray-100 rounded-lg p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-500 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">
                  {decryptedMetadata.location_name || 'Shared Location'}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${decryptedMetadata.location_lat},${decryptedMetadata.location_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  View on map <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            {decryptedContent && decryptedContent !== (decryptedMetadata.location_name || 'Shared location') && (
              <p className="text-sm">{decryptedContent}</p>
            )}
          </div>
        );

      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{decryptedContent}</p>;
    }
  };

  return (
    <div className={cn("flex gap-2 mb-4", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="text-white text-xs" style={{ background: '#ea00ea' }}>
            {message.created_by?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[70%] relative group")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 shadow-sm",
            isOwn 
              ? "text-white rounded-tr-sm omega-primary" 
              : "bg-white border border-gray-200 rounded-tl-sm"
          )}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {!isOwn && (
            <p className="text-xs font-medium omega-text-primary mb-1">
              {message.created_by?.split('@')[0]}
            </p>
          )}
          
          {renderMessageContent()}

          <div className="flex items-center justify-end gap-2 mt-1">
            <ShieldCheck className={cn(
              "w-3 h-3",
              isOwn ? "text-white/70" : "omega-text-primary"
            )} />
            <span className={cn(
              "text-xs",
              isOwn ? "text-white/80" : "text-gray-500"
            )}>
              {format(new Date(message.created_date), 'HH:mm')}
            </span>
          </div>
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {message.reactions.map((reaction, idx) => (
              <div 
                key={idx}
                className="bg-white border rounded-full px-2 py-0.5 text-xs flex items-center gap-1 shadow-sm"
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600">1</span>
              </div>
            ))}
          </div>
        )}

        {showReactions && (
          <div className="absolute -top-10 left-0 bg-white shadow-lg rounded-full px-2 py-1 flex gap-1 border z-10">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReaction?.(message.id, emoji)}
                className="hover:scale-125 transition-transform text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}