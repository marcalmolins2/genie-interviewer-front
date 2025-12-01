import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles,
  HelpCircle,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

const getContextualSuggestions = (pathname: string): QuickAction[] => {
  if (pathname.includes('/agents/new')) {
    return [
      { icon: <HelpCircle className="h-4 w-4" />, label: 'How do I create an agent?', prompt: 'How do I create a new interview agent?' },
      { icon: <BookOpen className="h-4 w-4" />, label: 'What are archetypes?', prompt: 'What are the different archetypes and when should I use each?' },
      { icon: <Lightbulb className="h-4 w-4" />, label: 'Best practices', prompt: 'What are the best practices for setting up an interview agent?' },
    ];
  }
  
  if (pathname.includes('/agents/') && pathname.includes('/edit')) {
    return [
      { icon: <HelpCircle className="h-4 w-4" />, label: 'Edit agent settings', prompt: 'How can I modify my agent\'s interview settings?' },
      { icon: <BookOpen className="h-4 w-4" />, label: 'Interview guide tips', prompt: 'How do I write an effective interview guide?' },
      { icon: <Lightbulb className="h-4 w-4" />, label: 'Test my agent', prompt: 'How do I test my interview agent before deploying?' },
    ];
  }
  
  if (pathname.includes('/agents/') && pathname.includes('/analyze')) {
    return [
      { icon: <HelpCircle className="h-4 w-4" />, label: 'Understanding insights', prompt: 'How do I interpret the interview insights?' },
      { icon: <BookOpen className="h-4 w-4" />, label: 'Export data', prompt: 'How can I export interview data and transcripts?' },
      { icon: <Lightbulb className="h-4 w-4" />, label: 'Improve response rate', prompt: 'How can I improve my interview response rate?' },
    ];
  }
  
  // Default suggestions for agents list
  return [
    { icon: <HelpCircle className="h-4 w-4" />, label: 'What is Genie?', prompt: 'What is Genie and how does it help with interviews?' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Getting started', prompt: 'How do I get started with creating my first interview agent?' },
    { icon: <Lightbulb className="h-4 w-4" />, label: 'View documentation', prompt: 'Where can I find the full documentation?' },
  ];
};

const getMockResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('what is genie') || lowerMessage.includes('what does') || lowerMessage.includes('how does it help')) {
    return "Genie is BCG's internal tool for creating and managing AI-powered interview agents. It helps you conduct automated interviews at scale, gather qualitative insights, and analyze responses efficiently. You can create different types of interview agents for various research needs.";
  }
  
  if (lowerMessage.includes('create') || lowerMessage.includes('new agent') || lowerMessage.includes('getting started')) {
    return "To create a new interview agent:\n\n1. Click the '+ Create Agent' button\n2. Choose between Manual setup (full control) or Assisted setup (AI-guided)\n3. Follow the step-by-step process: Project Details → Configure Interviewer → Interview Content → Review → Test → Deploy\n\nWould you like me to explain any specific step in detail?";
  }
  
  if (lowerMessage.includes('archetype')) {
    return "Archetypes define your agent's interview style:\n\n• **Discovery** - Open-ended exploration of topics\n• **Evaluative** - Structured assessment interviews\n• **Generative** - Creative ideation sessions\n• **Validation** - Testing specific hypotheses\n\nChoose based on your research goals. Discovery works well for early-stage research, while Validation suits hypothesis testing.";
  }
  
  if (lowerMessage.includes('interview guide') || lowerMessage.includes('effective')) {
    return "Tips for an effective interview guide:\n\n1. **Start broad** - Begin with warm-up questions\n2. **Use open questions** - Avoid yes/no questions\n3. **Follow logical flow** - Group related topics together\n4. **Include probes** - Add follow-up prompts for deeper insights\n5. **End thoughtfully** - Include closing/wrap-up questions\n\nThe rich text editor supports headers and bullet points for organization.";
  }
  
  if (lowerMessage.includes('test')) {
    return "Testing your agent before deployment:\n\n1. Navigate to the **Test** step in the agent setup\n2. You'll see a preview of your interview flow\n3. Interact with the agent as a respondent would\n4. Check that questions flow naturally\n5. Verify screener logic works correctly\n\nYou can always go back to edit and re-test until satisfied.";
  }
  
  if (lowerMessage.includes('insight') || lowerMessage.includes('analyze') || lowerMessage.includes('interpret')) {
    return "Understanding your interview insights:\n\n• **Overview** - High-level summary of all responses\n• **Themes** - AI-identified patterns across interviews\n• **Individual Transcripts** - Full conversation logs\n• **Sentiment** - Emotional tone analysis\n\nUse filters to segment by date, completion status, or custom tags.";
  }
  
  if (lowerMessage.includes('export')) {
    return "To export your interview data:\n\n1. Go to the **Analyze** tab of your agent\n2. Click the export button (top-right)\n3. Choose format: CSV, JSON, or PDF report\n4. Select which data to include\n\nYou can export individual transcripts or aggregate data.";
  }
  
  if (lowerMessage.includes('documentation') || lowerMessage.includes('docs') || lowerMessage.includes('help')) {
    return "You can find documentation and help resources:\n\n• **In-app guides** - Look for (?) icons throughout the interface\n• **Quick tips** - Hover over labels for explanations\n• **This chatbot** - Ask me anything!\n\nFor technical support, contact the Genie team via your internal BCG channels.";
  }
  
  return "I can help you with:\n\n• Creating and configuring interview agents\n• Understanding archetypes and settings\n• Writing effective interview guides\n• Testing and deploying agents\n• Analyzing interview insights\n\nWhat would you like to know more about?";
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  
  const suggestions = getContextualSuggestions(location.pathname);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    const response = getMockResponse(content);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };
  
  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };
  
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      
      {/* Chat Modal */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px]",
          "bg-card border border-border rounded-2xl shadow-xl",
          "flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Genie Assistant</h3>
              <p className="text-xs text-muted-foreground">Here to help you</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-1">How can I help?</h4>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about Genie
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggestions
                </p>
                {suggestions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="text-primary">{action.icon}</div>
                    <span className="text-sm text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="rounded-full shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}