import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
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

interface Citation {
  sectionId: string;
  quote: string;
}

interface GeneratedResponse {
  content: string;
  citations: Citation[];
}

// Extended QAMessage with structured citations
interface QAMessageWithCitations extends Omit<QAMessage, 'citations'> {
  citations?: Citation[];
}

export function TranscriptQA({ sessionId, transcript, initialMessages = [], onSaveMessage, onCitationClick }: TranscriptQAProps) {
  const [messages, setMessages] = useState<QAMessageWithCitations[]>(
    initialMessages.map(m => ({ ...m, citations: m.citations?.map(id => ({ sectionId: id, quote: '' })) }))
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
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
        citations: [
          { sectionId: 'q1', quote: "I'm a Product Manager at a fintech company. We've been exploring AI integration for about 18 months now" },
          { sectionId: 'q2', quote: "The biggest hurdle has been getting buy-in from stakeholders. There's a lot of fear around AI replacing jobs" },
          { sectionId: 'q3', quote: "We started with small pilot programs that showed clear value without displacing anyone" }
        ]
      };
    }
    
    if (lowerQuestion.includes('challenge') || lowerQuestion.includes('problem') || lowerQuestion.includes('issue')) {
      return {
        content: "The respondent mentioned several challenges [1] including stakeholder buy-in concerns, implementation complexity, and the need for careful change management when introducing new technologies. They addressed these through pilot programs [2] that demonstrated clear value.",
        citations: [
          { sectionId: 'q2', quote: "There's a lot of fear around AI replacing jobs, and we've had to be very careful about how we position these tools as augmentation rather than replacement" },
          { sectionId: 'q3', quote: "Our AI chatbot handles routine queries, which freed up our human agents to focus on complex issues. The results spoke for themselves" }
        ]
      };
    }
    
    if (lowerQuestion.includes('recommend') || lowerQuestion.includes('suggest') || lowerQuestion.includes('advice')) {
      return {
        content: "Key recommendations from the interview include [1]:\n\n• Start with small pilot programs to demonstrate value [2]\n• Focus on augmentation rather than replacement messaging [3]\n• Invest in comprehensive training programs\n• Track clear metrics to measure success [4]",
        citations: [
          { sectionId: 'q5', quote: "Start with small, low-risk pilot programs and focus messaging on augmentation rather than replacement" },
          { sectionId: 'q3', quote: "We started with small pilot programs that showed clear value without displacing anyone" },
          { sectionId: 'q2', quote: "We've had to be very careful about how we position these tools as augmentation rather than replacement" },
          { sectionId: 'q4', quote: "We tracked response times, resolution rates, and customer satisfaction scores" }
        ]
      };
    }
    
    if (lowerQuestion.includes('metric') || lowerQuestion.includes('measure') || lowerQuestion.includes('success')) {
      return {
        content: "The respondent tracked several success metrics [1]:\n\n• Response times dropped by 60% after AI implementation\n• Customer satisfaction scores increased by 15 points\n• Human agents reported higher job satisfaction\n• Agents now focus on complex tasks instead of repetitive queries",
        citations: [
          { sectionId: 'q4', quote: "Response times dropped by 60%, and our CSAT scores went up by 15 points. But the real win was that our human agents reported higher job satisfaction" }
        ]
      };
    }
    
    return {
      content: `Based on my analysis of this interview transcript, I found relevant information regarding your question about "${question}". The respondent discussed various aspects in their role and approach [1] that may be helpful. Would you like me to focus on any specific part of their responses?`,
      citations: [
        { sectionId: 'q1', quote: "I'm a Product Manager at a fintech company. We've been exploring AI integration for about 18 months now" }
      ]
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: QAMessageWithCitations = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    onSaveMessage?.({ ...userMessage, citations: undefined });
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const response = generateMockResponse(userMessage.content);
    
    const assistantMessage: QAMessageWithCitations = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
      citations: response.citations,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    onSaveMessage?.({ ...assistantMessage, citations: response.citations.map(c => c.sectionId) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSources = (messageId: string) => {
    setExpandedSources(prev => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  // Render message content with clickable citation badges
  const renderContentWithCitations = (content: string, citations: Citation[] = []) => {
    // Parse content for citation markers like [1], [2], etc.
    const parts = content.split(/(\[\d+\])/g);
    
    return parts.map((part, index) => {
      const citationMatch = part.match(/\[(\d+)\]/);
      if (citationMatch) {
        const citationIndex = parseInt(citationMatch[1], 10) - 1;
        const citation = citations[citationIndex];
        const section = citation ? getSectionById(citation.sectionId) : undefined;
        
        if (section && onCitationClick) {
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onCitationClick(citation.sectionId)}
                    className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-medium rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors mx-0.5"
                  >
                    {citationMatch[1]}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  <p className="text-xs italic">"{citation.quote}"</p>
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

  // Render collapsible citation sources
  const renderCitationSources = (messageId: string, citations: Citation[] = []) => {
    if (citations.length === 0) return null;
    
    const isExpanded = expandedSources[messageId] || false;
    
    // Dedupe by sectionId while keeping order
    const seen = new Set<string>();
    const uniqueCitations = citations.filter(c => {
      if (seen.has(c.sectionId)) return false;
      seen.add(c.sectionId);
      return true;
    });
    
    return (
      <div className="mt-3 pt-3 border-t border-border/50">
        <button 
          onClick={() => toggleSources(messageId)}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Sources ({uniqueCitations.length})
        </button>
        
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {uniqueCitations.map((citation, index) => (
              <button
                key={citation.sectionId}
                onClick={() => onCitationClick?.(citation.sectionId)}
                className="flex items-start gap-2 text-left w-full text-xs hover:bg-primary/10 rounded p-1.5 -ml-1 transition-colors"
              >
                <span className="flex-shrink-0 w-4 h-4 rounded bg-primary/20 text-primary text-[10px] flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <span className="text-muted-foreground italic line-clamp-2">"{citation.quote}"</span>
              </button>
            ))}
          </div>
        )}
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
                  {msg.role === 'assistant' && renderCitationSources(msg.id, msg.citations)}
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
