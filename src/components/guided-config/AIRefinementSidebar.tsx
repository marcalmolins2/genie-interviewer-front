import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Lightbulb,
  Plus,
  Check,
  X,
  Wand2,
  AlertCircle,
  Loader2,
  Send,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Zap,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============ Types ============

export interface InlineSuggestion {
  id: string;
  type: 'improvement' | 'addition' | 'warning' | 'coverage';
  title: string;
  description: string;
  action?: string;
  status: 'pending' | 'applied' | 'dismissed';
}

export interface PreviewChange {
  summary: string;
  diff: string;
  fullContent: string;
}

export interface RefinementMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: InlineSuggestion[];
  previewChanges?: PreviewChange;
  followUps?: string[];
}

export interface Suggestion {
  id: string;
  type: 'improvement' | 'addition' | 'warning' | 'coverage';
  title: string;
  description: string;
  action?: string;
}

interface AIRefinementSidebarProps {
  currentContent: string;
  contentType: 'research-brief' | 'interview-guide';
  selectedText?: string;
  onApplyChanges: (newContent: string) => void;
  initialSuggestions?: Suggestion[];
  voiceEnabled?: boolean;
}

// ============ Quick Actions ============

const QUICK_ACTIONS = [
  { id: 'concise', label: 'Make concise', icon: Zap },
  { id: 'depth', label: 'Add depth', icon: Plus },
  { id: 'coverage', label: 'Check coverage', icon: FileText },
  { id: 'clarity', label: 'Improve clarity', icon: Edit3 },
];

// ============ Sub-Components ============

function QuickActionsBar({ 
  onAction, 
  isCollapsed, 
  onToggle 
}: { 
  onAction: (action: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Collapsible open={!isCollapsed} onOpenChange={() => onToggle()}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Quick Actions
          </span>
          {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onAction(action.label)}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SuggestionIcon({ type }: { type: InlineSuggestion['type'] }) {
  switch (type) {
    case 'improvement':
      return <Wand2 className="h-3.5 w-3.5 text-primary" />;
    case 'addition':
      return <Plus className="h-3.5 w-3.5 text-green-500" />;
    case 'warning':
      return <AlertCircle className="h-3.5 w-3.5 text-orange-500" />;
    case 'coverage':
      return <Check className="h-3.5 w-3.5 text-blue-500" />;
    default:
      return <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />;
  }
}

function InlineSuggestionCard({
  suggestion,
  onApply,
  onDismiss,
}: {
  suggestion: InlineSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}) {
  if (suggestion.status === 'dismissed') return null;
  
  return (
    <div className={cn(
      "p-2 rounded-lg border bg-muted/30 transition-all",
      suggestion.status === 'applied' && "opacity-60 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
    )}>
      <div className="flex items-start gap-2">
        <SuggestionIcon type={suggestion.type} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium">{suggestion.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
        </div>
      </div>
      {suggestion.status === 'pending' && (
        <div className="flex gap-1.5 mt-2">
          <Button size="sm" variant="default" className="h-6 text-xs flex-1" onClick={onApply}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onDismiss}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      {suggestion.status === 'applied' && (
        <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
          <Check className="h-3 w-3" />
          Applied
        </div>
      )}
    </div>
  );
}

function PreviewChangesCard({
  preview,
  onApply,
  onEdit,
}: {
  preview: PreviewChange;
  onApply: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="p-3 rounded-lg border bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Edit3 className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium">Proposed Changes</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{preview.summary}</p>
      <div className="max-h-24 overflow-auto rounded border bg-background p-2 mb-3">
        <p className="text-xs whitespace-pre-wrap">
          <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
            {preview.diff.slice(0, 200)}
            {preview.diff.length > 200 && '...'}
          </span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-7 text-xs" onClick={onApply}>
          <Check className="h-3 w-3 mr-1" />
          Apply
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onEdit}>
          Edit First
        </Button>
      </div>
    </div>
  );
}

function FollowUpChips({ 
  followUps, 
  onSelect 
}: { 
  followUps: string[]; 
  onSelect: (text: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {followUps.map((followUp, idx) => (
        <Badge
          key={idx}
          variant="outline"
          className="cursor-pointer hover:bg-primary/10 text-xs"
          onClick={() => onSelect(followUp)}
        >
          {followUp}
        </Badge>
      ))}
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2">
        <p className="text-xs">{content}</p>
      </div>
    </div>
  );
}

function AssistantMessage({
  message,
  onApplySuggestion,
  onDismissSuggestion,
  onApplyPreview,
  onEditPreview,
  onFollowUpSelect,
}: {
  message: RefinementMessage;
  onApplySuggestion: (id: string) => void;
  onDismissSuggestion: (id: string) => void;
  onApplyPreview: () => void;
  onEditPreview: () => void;
  onFollowUpSelect: (text: string) => void;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] space-y-2">
        <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
          <p className="text-xs whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Inline Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="space-y-2 pl-1">
            {message.suggestions.map((suggestion) => (
              <InlineSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={() => onApplySuggestion(suggestion.id)}
                onDismiss={() => onDismissSuggestion(suggestion.id)}
              />
            ))}
          </div>
        )}
        
        {/* Preview Changes */}
        {message.previewChanges && (
          <div className="pl-1">
            <PreviewChangesCard
              preview={message.previewChanges}
              onApply={onApplyPreview}
              onEdit={onEditPreview}
            />
          </div>
        )}
        
        {/* Follow-up Chips */}
        {message.followUps && message.followUps.length > 0 && (
          <FollowUpChips followUps={message.followUps} onSelect={onFollowUpSelect} />
        )}
      </div>
    </div>
  );
}

function ChatInputBar({
  value,
  onChange,
  onSend,
  onVoiceToggle,
  isRecording,
  isLoading,
  placeholder,
  voiceEnabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceToggle: () => void;
  isRecording: boolean;
  isLoading: boolean;
  placeholder: string;
  voiceEnabled: boolean;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t pt-3">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 h-9 text-sm"
        disabled={isLoading}
      />
      {voiceEnabled && (
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          className={cn("h-9 w-9 shrink-0", isRecording && "animate-pulse")}
          onClick={onVoiceToggle}
          disabled={isLoading}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}
      <Button
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={onSend}
        disabled={!value.trim() || isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
}

// ============ Main Component ============

export function AIRefinementSidebar({
  currentContent,
  contentType,
  selectedText,
  onApplyChanges,
  initialSuggestions = [],
  voiceEnabled = true,
}: AIRefinementSidebarProps) {
  const [messages, setMessages] = useState<RefinementMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [quickActionsCollapsed, setQuickActionsCollapsed] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message and initial suggestions
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: RefinementMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `I've analyzed your ${contentType === 'research-brief' ? 'research brief' : 'interview guide'}. ${initialSuggestions.length > 0 ? 'Here are some suggestions to improve it:' : 'It looks good! Let me know if you\'d like any changes.'}`,
        timestamp: new Date(),
        suggestions: initialSuggestions.map(s => ({ ...s, status: 'pending' as const })),
        followUps: ['Make it more concise', 'Add more detail', 'Check topic coverage'],
      };
      setMessages([welcomeMessage]);
    }
  }, [contentType, initialSuggestions, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice input using Web Speech API
  const toggleVoiceInput = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInput(transcript);
        };
        
        recognition.onerror = () => {
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      }
    }
  }, [isRecording]);

  // Simulate AI response (will be replaced with actual API call)
  const simulateAIResponse = useCallback(async (userMessage: string): Promise<RefinementMessage> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Simulate different responses based on user input
    if (lowerMessage.includes('concise') || lowerMessage.includes('shorter')) {
      return {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "I've made the content more concise by removing redundant phrases and tightening the language.",
        timestamp: new Date(),
        previewChanges: {
          summary: 'Removed 3 redundant phrases and shortened 2 paragraphs',
          diff: currentContent.slice(0, 150) + '...',
          fullContent: currentContent.slice(0, -50),
        },
        followUps: ['Make it even shorter', 'Undo changes', 'Add back some detail'],
      };
    }
    
    if (lowerMessage.includes('coverage') || lowerMessage.includes('check')) {
      return {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "I analyzed your content against common elements for this type of interview:\n\n✅ Research objectives - Well defined\n✅ Target audience - Covered\n⚠️ Timeline expectations - Not mentioned\n⚠️ Success metrics - Consider adding",
        timestamp: new Date(),
        followUps: ['Draft timeline section', 'Add success metrics', 'Show me what\'s covered'],
      };
    }
    
    if (lowerMessage.includes('depth') || lowerMessage.includes('detail') || lowerMessage.includes('more')) {
      return {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "I can add more depth to specific sections. Which area would you like me to expand?",
        timestamp: new Date(),
        suggestions: [
          {
            id: `sug-${Date.now()}-1`,
            type: 'addition',
            title: 'Expand target audience section',
            description: 'Add demographic details and company characteristics',
            status: 'pending',
          },
          {
            id: `sug-${Date.now()}-2`,
            type: 'addition',
            title: 'Add competitive context',
            description: 'Include competitor landscape information',
            status: 'pending',
          },
        ],
        followUps: ['Expand all sections', 'Just the introduction', 'Add examples'],
      };
    }
    
    // Default response
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `I understand you want to "${userMessage}". Let me work on that for your ${contentType === 'research-brief' ? 'research brief' : 'interview guide'}.`,
      timestamp: new Date(),
      previewChanges: {
        summary: 'Updated content based on your request',
        diff: `Updated: ${userMessage.slice(0, 50)}...`,
        fullContent: currentContent + `\n\n[Updated based on: ${userMessage}]`,
      },
      followUps: ['Looks good', 'Try a different approach', 'Undo'],
    };
  }, [currentContent, contentType]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: RefinementMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const aiResponse = await simulateAIResponse(input.trim());
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, simulateAIResponse]);

  const handleQuickAction = useCallback((action: string) => {
    setInput(action);
    // Auto-send after a brief delay
    setTimeout(() => {
      setInput('');
      const userMessage: RefinementMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: action,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      simulateAIResponse(action).then(aiResponse => {
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      });
    }, 100);
  }, [simulateAIResponse]);

  const handleApplySuggestion = useCallback((suggestionId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.suggestions) {
        return {
          ...msg,
          suggestions: msg.suggestions.map(s => 
            s.id === suggestionId ? { ...s, status: 'applied' as const } : s
          ),
        };
      }
      return msg;
    }));
    
    // TODO: Actually apply the suggestion to content
    // onApplyChanges(newContent);
  }, []);

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.suggestions) {
        return {
          ...msg,
          suggestions: msg.suggestions.map(s => 
            s.id === suggestionId ? { ...s, status: 'dismissed' as const } : s
          ),
        };
      }
      return msg;
    }));
  }, []);

  const handleApplyPreview = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message?.previewChanges) {
      onApplyChanges(message.previewChanges.fullContent);
      
      // Add confirmation message
      const confirmMessage: RefinementMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: '✓ Changes applied successfully!',
        timestamp: new Date(),
        followUps: ['Undo changes', 'Make more edits'],
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  }, [messages, onApplyChanges]);

  const handleFollowUpSelect = useCallback((text: string) => {
    setInput(text);
  }, []);

  // Dynamic placeholder based on selected text
  const inputPlaceholder = selectedText 
    ? `Improve: "${selectedText.slice(0, 30)}..."` 
    : 'Ask me to refine...';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Wand2 className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-sm">AI Refinement</h3>
      </div>

      {/* Quick Actions Bar */}
      <QuickActionsBar
        onAction={handleQuickAction}
        isCollapsed={quickActionsCollapsed}
        onToggle={() => setQuickActionsCollapsed(!quickActionsCollapsed)}
      />

      {/* Selection Context Banner */}
      {selectedText && (
        <div className="mt-3 p-2 rounded-lg border border-primary/30 bg-primary/5">
          <p className="text-xs font-medium text-primary mb-1">Selected text:</p>
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            "{selectedText}"
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-6 text-xs w-full"
            onClick={() => handleQuickAction(`Improve this: "${selectedText}"`)}
          >
            <Wand2 className="h-3 w-3 mr-1" />
            Improve selection
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 mt-3 -mx-4 px-4" ref={scrollRef}>
        <div className="space-y-3 pb-2">
          {messages.map((message) => (
            message.role === 'user' ? (
              <UserMessage key={message.id} content={message.content} />
            ) : (
              <AssistantMessage
                key={message.id}
                message={message}
                onApplySuggestion={handleApplySuggestion}
                onDismissSuggestion={handleDismissSuggestion}
                onApplyPreview={() => handleApplyPreview(message.id)}
                onEditPreview={() => console.log('Edit preview')}
                onFollowUpSelect={handleFollowUpSelect}
              />
            )
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <ChatInputBar
        value={input}
        onChange={setInput}
        onSend={handleSendMessage}
        onVoiceToggle={toggleVoiceInput}
        isRecording={isRecording}
        isLoading={isLoading}
        placeholder={inputPlaceholder}
        voiceEnabled={voiceEnabled}
      />
    </div>
  );
}
