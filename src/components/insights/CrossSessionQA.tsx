import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

interface SessionSource {
  id: string;
  date: string;
}

interface Citation {
  sessionId: string;
  sessionDate: string;
}

interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  followUps?: string[];
}

interface CrossSessionQAProps {
  interviewerId: string;
  sessions: SessionSource[];
}

export function CrossSessionQA({ interviewerId, sessions }: CrossSessionQAProps) {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const generateMockResponse = (question: string): { content: string; citations: Citation[]; followUps: string[] } => {
    const lowerQuestion = question.toLowerCase();
    
    // Get random sessions for citations
    const getRandomSessions = (count: number): Citation[] => {
      const shuffled = [...sessions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, shuffled.length)).map(s => ({
        sessionId: s.id,
        sessionDate: s.date,
      }));
    };

    if (lowerQuestion.includes('pain point') || lowerQuestion.includes('challenge')) {
      return {
        content: `Based on analysis across all ${sessions.length} sessions, the most common pain points mentioned are:\n\n• **Stakeholder buy-in challenges** - Participants frequently cite difficulty getting leadership approval for new initiatives [1,2]\n• **Training and skill gaps** - Teams lack necessary skills to implement new tools effectively [2,3]\n• **Integration complexity** - Existing systems are difficult to connect with new solutions [1,3,4]\n• **Unclear ROI measurement** - Difficulty demonstrating value to justify continued investment [4,5]`,
        citations: getRandomSessions(5),
        followUps: [
          "How did teams overcome stakeholder resistance?",
          "What training approaches were mentioned?",
        ]
      };
    }
    
    if (lowerQuestion.includes('theme') || lowerQuestion.includes('pattern')) {
      return {
        content: `Key themes emerging from these ${sessions.length} conversations:\n\n• **Change management is critical** - Success depends more on people than technology [1,2,3]\n• **Start small, prove value** - Pilot programs consistently mentioned as best practice [2,4]\n• **Documentation gaps** - Need for better onboarding and reference materials [1,3]\n• **Cross-functional collaboration** - Breaking down silos accelerates adoption [3,4,5]`,
        citations: getRandomSessions(5),
        followUps: [
          "Tell me more about successful pilot programs",
          "What collaboration strategies worked best?",
        ]
      };
    }
    
    if (lowerQuestion.includes('recommend') || lowerQuestion.includes('suggest')) {
      return {
        content: `Participants across sessions recommend:\n\n• **Phase implementation gradually** - Don't try to change everything at once [1,2]\n• **Invest in training early** - Upfront investment saves time and frustration [2,3,4]\n• **Measure and communicate wins** - Regular progress updates maintain momentum [1,4]\n• **Engage end users in design** - Solutions designed with users have higher adoption [3,5]`,
        citations: getRandomSessions(5),
        followUps: [
          "What metrics did they use to measure success?",
          "How long did typical implementations take?",
        ]
      };
    }
    
    return {
      content: `Analyzing ${sessions.length} interview sessions for "${question}":\n\nThis topic was discussed in several interviews [1,2,3]. Participants shared varied perspectives based on their organizational context and experience level. Would you like me to focus on a specific aspect of this topic?`,
      citations: getRandomSessions(3),
      followUps: [
        "What are the main challenges discussed?",
        "Summarize the key recommendations",
      ]
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
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const response = generateMockResponse(userMessage.content);
    
    const assistantMessage: QAMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
      citations: response.citations,
      followUps: response.followUps,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
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

  // Render content with inline citation hover cards
  const renderContentWithCitations = (content: string, citations: Citation[] = []) => {
    const parts = content.split(/(\[\d+(?:,\d+)*\])/g);
    
    return parts.map((part, index) => {
      const citationMatch = part.match(/\[([\d,]+)\]/);
      if (citationMatch) {
        const numbers = citationMatch[1].split(',').map(n => parseInt(n, 10));
        const relevantCitations = numbers
          .map(n => citations[n - 1])
          .filter(Boolean);
        
        if (relevantCitations.length > 0) {
          return (
            <HoverCard key={index} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button className="inline text-xs text-muted-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-2">
                  [{numbers.join(',')}]
                </button>
              </HoverCardTrigger>
              <HoverCardContent align="start" className="w-64 p-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Sources ({relevantCitations.length})
                  </p>
                  {relevantCitations.map((citation, i) => (
                    <Link
                      key={citation.sessionId}
                      to={`/app/interviewers/${interviewerId}/sessions/${citation.sessionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors text-sm"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-primary/20 text-primary text-[10px] flex items-center justify-center font-medium">
                        {numbers[i]}
                      </span>
                      <span className="text-foreground hover:text-primary transition-colors">
                        Session from {formatDate(citation.sessionDate)}
                      </span>
                    </Link>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        }
        return part;
      }
      
      // Handle markdown-style bold
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((boldPart, boldIndex) => {
        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
          return <strong key={`${index}-${boldIndex}`}>{boldPart.slice(2, -2)}</strong>;
        }
        return boldPart;
      });
    });
  };

  // Render collapsible sources section
  const renderCitationSources = (messageId: string, citations: Citation[] = []) => {
    if (citations.length === 0) return null;
    
    const isExpanded = expandedSources[messageId] || false;
    
    // Dedupe by sessionId
    const seen = new Set<string>();
    const uniqueCitations = citations.filter(c => {
      if (seen.has(c.sessionId)) return false;
      seen.add(c.sessionId);
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
          <div className="mt-2 space-y-1">
            {uniqueCitations.map((citation, index) => (
              <Link
                key={citation.sessionId}
                to={`/app/interviewers/${interviewerId}/sessions/${citation.sessionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs hover:bg-primary/10 rounded p-1.5 transition-colors"
              >
                <span className="flex-shrink-0 w-4 h-4 rounded bg-primary/20 text-primary text-[10px] flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-muted-foreground hover:text-foreground">
                  Session from {formatDate(citation.sessionDate)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const suggestedQuestions = [
    "What are the most common pain points mentioned across all interviews?",
    "Summarize the key themes emerging from these conversations",
    "What recommendations do participants suggest most frequently?",
  ];

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Cross-Session Q&A
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ask questions across {sessions.length} interview sessions
        </p>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center py-4">
              Query insights from all interview sessions
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Try asking:</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-sm p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
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
            
            {/* Follow-up suggestions */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].followUps && (
              <div className="flex flex-wrap gap-2 mt-2 ml-11">
                {messages[messages.length - 1].followUps?.map((followUp, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(followUp)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
                  >
                    {followUp}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about all sessions..."
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
