import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { QAMessage, CleanedTranscript, TranscriptSection } from '@/types';

interface TranscriptQAProps {
  sessionId: string;
  transcript: CleanedTranscript;
  initialMessages?: QAMessage[];
  onSaveMessage?: (message: QAMessage) => void;
  onCitationClick?: (sectionId: string) => void;
}

interface GeneratedResponse {
  content: string;
  citations: string[];
}

export function TranscriptQA({ sessionId, transcript, initialMessages = [], onSaveMessage, onCitationClick }: TranscriptQAProps) {
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

  // Get section by ID for citation tooltips
  const getSectionById = (sectionId: string): TranscriptSection | undefined => {
    return transcript.sections.find(s => s.id === sectionId);
  };

  const generateMockResponse = (question: string): GeneratedResponse => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('main') || lowerQuestion.includes('key') || lowerQuestion.includes('summary')) {
      return {
        content: `Based on the transcript, the main points discussed were:\n\n• The respondent's role and approach to AI implementation [1]\n• Key challenges including stakeholder buy-in [2]\n• Successful strategies like pilot programs [3]`,
        citations: ['q1', 'q2', 'q3']
      };
    }
    
    if (lowerQuestion.includes('challenge') || lowerQuestion.includes('problem') || lowerQuestion.includes('issue')) {
      return {
        content: "The respondent mentioned several challenges [2] including stakeholder buy-in concerns, implementation complexity, and the need for careful change management when introducing new technologies. They addressed these through pilot programs [3] that demonstrated clear value.",
        citations: ['q2', 'q3']
      };
    }
    
    if (lowerQuestion.includes('recommend') || lowerQuestion.includes('suggest') || lowerQuestion.includes('advice')) {
      return {
        content: "Key recommendations from the interview include [5]:\n\n• Start with small pilot programs to demonstrate value [3]\n• Focus on augmentation rather than replacement messaging [2]\n• Invest in comprehensive training programs\n• Track clear metrics to measure success [4]",
        citations: ['q2', 'q3', 'q4', 'q5']
      };
    }
    
    if (lowerQuestion.includes('metric') || lowerQuestion.includes('measure') || lowerQuestion.includes('success')) {
      return {
        content: "The respondent tracked several success metrics [4]:\n\n• Response times dropped by 60% after AI implementation\n• Customer satisfaction scores increased by 15 points\n• Human agents reported higher job satisfaction\n• Agents now focus on complex tasks instead of repetitive queries",
        citations: ['q4']
      };
    }
    
    return {
      content: `Based on my analysis of this interview transcript, I found relevant information regarding your question about "${question}". The respondent discussed various aspects in their role and approach [1] that may be helpful. Would you like me to focus on any specific part of their responses?`,
      citations: ['q1']
    };
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
    
    const response = generateMockResponse(userMessage.content);
    
    const assistantMessage: QAMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
      citations: response.citations,
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

  // Render message content with clickable citation badges
  const renderContentWithCitations = (content: string, citations: string[] = []) => {
    // Parse content for citation markers like [1], [2], etc.
    const parts = content.split(/(\[\d+\])/g);
    
    return parts.map((part, index) => {
      const citationMatch = part.match(/\[(\d+)\]/);
      if (citationMatch) {
        const citationIndex = parseInt(citationMatch[1], 10) - 1;
        const sectionId = citations[citationIndex];
        const section = sectionId ? getSectionById(sectionId) : undefined;
        
        if (section && onCitationClick) {
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onCitationClick(sectionId)}
                    className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-medium rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors mx-0.5"
                  >
                    {citationMatch[1]}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  <p className="text-xs font-medium line-clamp-2">{section.question}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return part;
      }
      return part;
    });
  };

  // Render citation sources legend
  const renderCitationSources = (citations: string[] = []) => {
    if (citations.length === 0) return null;
    
    const uniqueCitations = [...new Set(citations)];
    const validSources = uniqueCitations
      .map((id, idx) => ({ id, section: getSectionById(id), index: idx + 1 }))
      .filter(s => s.section);
    
    if (validSources.length === 0) return null;
    
    return (
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Sources</p>
        <div className="space-y-1">
          {validSources.map(({ id, section, index }) => (
            <button
              key={id}
              onClick={() => onCitationClick?.(id)}
              className="flex items-start gap-2 text-left w-full text-xs hover:bg-primary/10 rounded p-1 -ml-1 transition-colors"
            >
              <span className="flex-shrink-0 w-4 h-4 rounded bg-primary/20 text-primary text-[10px] flex items-center justify-center">
                {index}
              </span>
              <span className="text-muted-foreground line-clamp-1">{section!.question}</span>
            </button>
          ))}
        </div>
      </div>
    );
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
                  "flex-1 max-w-[85%] rounded-lg p-3 text-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <div className="whitespace-pre-wrap">
                    {msg.role === 'assistant' 
                      ? renderContentWithCitations(msg.content, msg.citations)
                      : msg.content
                    }
                  </div>
                  {msg.role === 'assistant' && renderCitationSources(msg.citations)}
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