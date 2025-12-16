import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface LiveTranscriptProps {
  messages: TranscriptMessage[];
  isAiSpeaking?: boolean;
}

export function LiveTranscript({ messages, isAiSpeaking }: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Live Transcript</h2>
        <p className="text-sm text-muted-foreground">Real-time conversation</p>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && !isAiSpeaking && (
          <div className="text-center text-muted-foreground text-sm py-8">
            The conversation will appear here...
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className={cn(
                'text-xs mt-1',
                message.role === 'user' 
                  ? 'text-primary-foreground/70' 
                  : 'text-muted-foreground'
              )}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator when AI is speaking */}
        {isAiSpeaking && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
