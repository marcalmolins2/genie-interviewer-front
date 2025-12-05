import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { QAMessage, CleanedTranscript } from '@/types';

interface TranscriptQAProps {
  sessionId: string;
  transcript: CleanedTranscript;
  initialMessages?: QAMessage[];
  onSaveMessage?: (message: QAMessage) => void;
}

export function TranscriptQA({ sessionId, transcript, initialMessages = [], onSaveMessage }: TranscriptQAProps) {
  const [messages, setMessages] = useState<QAMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateMockResponse = (question: string): string => {
    // Mock AI responses based on transcript content
    const transcriptText = transcript.sections.map(s => 
      `Q: ${s.question}\nA: ${s.answer.bulletPoints.join('. ')}`
    ).join('\n\n');
    
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('main') || lowerQuestion.includes('key') || lowerQuestion.includes('summary')) {
      return `Based on the transcript, the main points discussed were:\n\n• ${transcript.sections.slice(0, 3).map(s => s.answer.summary || s.answer.bulletPoints[0]).join('\n• ')}`;
    }
    
    if (lowerQuestion.includes('challenge') || lowerQuestion.includes('problem') || lowerQuestion.includes('issue')) {
      return "The respondent mentioned several challenges including stakeholder buy-in concerns, implementation complexity, and the need for careful change management when introducing new technologies.";
    }
    
    if (lowerQuestion.includes('recommend') || lowerQuestion.includes('suggest') || lowerQuestion.includes('advice')) {
      return "Key recommendations from the interview include:\n\n• Start with small pilot programs to demonstrate value\n• Focus on augmentation rather than replacement messaging\n• Invest in comprehensive training programs\n• Track clear metrics to measure success";
    }
    
    if (lowerQuestion.includes('metric') || lowerQuestion.includes('measure') || lowerQuestion.includes('success')) {
      return "The respondent tracked several success metrics:\n\n• Response time improvements (60% reduction mentioned)\n• Customer satisfaction scores (15 point increase)\n• Employee job satisfaction improvements\n• Completion and resolution rates";
    }
    
    return `Based on my analysis of this interview transcript, I found relevant information regarding your question about "${question}". The respondent discussed various aspects that may be helpful. Would you like me to focus on any specific part of their responses?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: QAMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    onSaveMessage?.(userMessage);
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const assistantMessage: QAMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: generateMockResponse(userMessage.content),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    onSaveMessage?.(assistantMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What were the main challenges discussed?",
    "Summarize the key recommendations",
    "What metrics were mentioned?",
  ];

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Talk to Transcript
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ask questions about this interview
        </p>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center py-4">
              Ask any question about this interview transcript
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Suggested questions:</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="block w-full text-left text-sm p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className={cn(
                  "flex-1 max-w-[80%] rounded-lg p-3 text-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn(
                    "text-xs mt-2 opacity-70",
                    msg.role === 'user' ? "text-right" : ""
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the transcript..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
