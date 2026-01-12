import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X,
  Settings,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Channel, Archetype, ARCHETYPES, PRICE_BY_CHANNEL } from '@/types';
import { interviewersService, agentsService } from '@/services/interviewers';
import { useToast } from '@/hooks/use-toast';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

// Conversation phases for tracking progress
enum ConversationPhase {
  WELCOME = 'welcome',
  RESEARCH_GOALS = 'research_goals',
  ARCHETYPE_SELECTION = 'archetype_selection',
  AGENT_DETAILS = 'agent_details',
  INTERVIEW_GUIDE = 'interview_guide',
  KNOWLEDGE_BASE = 'knowledge_base',
  CHANNEL_SELECTION = 'channel_selection',
  REVIEW_CONFIRM = 'review_confirm',
  COMPLETE = 'complete'
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  phase?: ConversationPhase;
}

interface InterviewerData {
  name: string;
  archetype: Archetype | null;
  language: string;
  voiceId: string;
  channel: Channel;
  researchGoals: string;
  interviewGuide: string;
  knowledgeText: string;
}

const phaseLabels = {
  [ConversationPhase.WELCOME]: 'Welcome',
  [ConversationPhase.RESEARCH_GOALS]: 'Research Goals',
  [ConversationPhase.ARCHETYPE_SELECTION]: 'Interviewer Type',
  [ConversationPhase.AGENT_DETAILS]: 'Interviewer Details',
  [ConversationPhase.INTERVIEW_GUIDE]: 'Interview Guide',
  [ConversationPhase.KNOWLEDGE_BASE]: 'Knowledge Base',
  [ConversationPhase.CHANNEL_SELECTION]: 'Communication',
  [ConversationPhase.REVIEW_CONFIRM]: 'Review & Confirm',
  [ConversationPhase.COMPLETE]: 'Complete'
};

export default function CreateInterviewerAssisted() {
  const isEnabled = useFeatureFlag('ASSISTED_CONFIGURATION');
  
  // In-page guard: redirect if flag is disabled while on page
  if (!isEnabled) {
    return <Navigate to="/app/interviewers/new" replace />;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(ConversationPhase.WELCOME);
  const [interviewerData, setInterviewerData] = useState<InterviewerData>({
    name: '',
    archetype: null,
    language: 'en',
    voiceId: 'voice-1',
    channel: 'inbound_call',
    researchGoals: '',
    interviewGuide: '',
    knowledgeText: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const hasUnsavedChanges = (): boolean => {
    return messages.length > 1 || // More than just the welcome message
           interviewerData.name !== '' ||
           interviewerData.researchGoals !== '';
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowCancelDialog(true);
    } else {
      navigate('/app/interviewers');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/app/interviewers');
  };

  useEffect(() => {
    // Send welcome message when component mounts
    setTimeout(() => {
      addAssistantMessage(
        "👋 Hi there! I'm your Genie Interviewer Configuration Assistant, here to help you create the perfect interviewer. This will be a quick conversation where I'll ask about your research goals and guide you through the setup.\n\nLet's start with a simple question: **What type of research are you planning to conduct?** For example:\n- User experience interviews\n- Market research\n- Customer feedback collection\n- Product validation\n- Academic research",
        ConversationPhase.WELCOME
      );
    }, 500);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addAssistantMessage = (content: string, phase?: ConversationPhase) => {
    setIsTyping(true);
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        phase
      };
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Simulate typing delay
  };

  const getProgressPercentage = () => {
    const phases = Object.values(ConversationPhase);
    const currentIndex = phases.indexOf(currentPhase);
    return Math.round((currentIndex / (phases.length - 1)) * 100);
  };

  const getCompletedPhases = () => {
    const phases = Object.values(ConversationPhase);
    const currentIndex = phases.indexOf(currentPhase);
    return phases.slice(0, currentIndex);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isTyping) return;

    const userMessage = currentMessage.trim();
    addUserMessage(userMessage);
    setCurrentMessage('');

    // Process the conversation based on current phase
    processConversation(userMessage);
  };

  const processConversation = (userMessage: string) => {
    switch (currentPhase) {
      case ConversationPhase.WELCOME:
        handleResearchGoals(userMessage);
        break;
      case ConversationPhase.RESEARCH_GOALS:
        handleArchetypeSelection(userMessage);
        break;
      case ConversationPhase.ARCHETYPE_SELECTION:
        handleAgentDetails(userMessage);
        break;
      case ConversationPhase.AGENT_DETAILS:
        handleInterviewGuide(userMessage);
        break;
      case ConversationPhase.INTERVIEW_GUIDE:
        handleKnowledgeBase(userMessage);
        break;
      case ConversationPhase.KNOWLEDGE_BASE:
        handleConfirmChannel(userMessage);
        break;
      case ConversationPhase.CHANNEL_SELECTION:
        handleReviewConfirm(userMessage);
        break;
      case ConversationPhase.REVIEW_CONFIRM:
        handleFinalConfirmation(userMessage);
        break;
    }
  };

  const handleResearchGoals = (userMessage: string) => {
    setInterviewerData(prev => ({ ...prev, researchGoals: userMessage }));
    
    // Suggest archetype based on goals
    const lowerMessage = userMessage.toLowerCase();
    let suggestedArchetype: Archetype = 'diagnostic';
    
    if (lowerMessage.includes('user') || lowerMessage.includes('ux') || lowerMessage.includes('experience')) {
      suggestedArchetype = 'customer_user';
    } else if (lowerMessage.includes('market') || lowerMessage.includes('customer')) {
      suggestedArchetype = 'investigative';
    } else if (lowerMessage.includes('expert') || lowerMessage.includes('deep')) {
      suggestedArchetype = 'expert_deep_dive';
    } else if (lowerMessage.includes('focus') || lowerMessage.includes('group')) {
      suggestedArchetype = 'panel_moderator';
    } else if (lowerMessage.includes('survey') || lowerMessage.includes('quick') || lowerMessage.includes('poll')) {
      suggestedArchetype = 'rapid_survey';
    } else if (lowerMessage.includes('stakeholder') || lowerMessage.includes('business') || lowerMessage.includes('strategy')) {
      suggestedArchetype = 'client_stakeholder';
    }

    const archetype = ARCHETYPES.find(a => a.id === suggestedArchetype);
    
    setCurrentPhase(ConversationPhase.RESEARCH_GOALS);
    addAssistantMessage(
      `Perfect! Based on your research goals, I recommend the **${archetype?.title}** archetype.\n
${archetype?.description}\n
**Use case:** ${archetype?.useCase}\n
Does this sound like what you need? If not, I can suggest other types like:
- Expert Deep-Dive (technical discussions with specialists)
- Customer User (end-user needs and experiences)
- Investigative (market research and analysis)
- Panel Moderator (group discussions and workshops)
- Rapid Survey (quick polls and feedback)`,
      ConversationPhase.ARCHETYPE_SELECTION
    );
  };

  const handleArchetypeSelection = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    let selectedArchetype: Archetype = 'diagnostic';
    
    if (lowerMessage.includes('yes') || lowerMessage.includes('perfect') || lowerMessage.includes('sounds good')) {
      // Keep the previously suggested archetype from interviewerData
      selectedArchetype = interviewerData.archetype || 'diagnostic';
    } else if (lowerMessage.includes('user') || lowerMessage.includes('customer') || lowerMessage.includes('ux')) {
      selectedArchetype = 'customer_user';
    } else if (lowerMessage.includes('market') || lowerMessage.includes('investigative')) {
      selectedArchetype = 'investigative';
    } else if (lowerMessage.includes('expert') || lowerMessage.includes('deep')) {
      selectedArchetype = 'expert_deep_dive';
    } else if (lowerMessage.includes('panel') || lowerMessage.includes('group') || lowerMessage.includes('moderator')) {
      selectedArchetype = 'panel_moderator';
    } else if (lowerMessage.includes('survey') || lowerMessage.includes('rapid') || lowerMessage.includes('quick')) {
      selectedArchetype = 'rapid_survey';
    } else if (lowerMessage.includes('stakeholder') || lowerMessage.includes('client')) {
      selectedArchetype = 'client_stakeholder';
    }

    setInterviewerData(prev => ({ ...prev, archetype: selectedArchetype }));
    setCurrentPhase(ConversationPhase.ARCHETYPE_SELECTION);
    
    addAssistantMessage(
      `Great choice! Now let's give your interviewer a name. This should be descriptive and help you identify the purpose.\n
**What would you like to name your interviewer?**\n
Some examples:
- "Customer Satisfaction Deep-Dive"
- "UX Research Assistant"
- "Product Feedback Collector"
- "Market Analysis Interviewer"`,
      ConversationPhase.AGENT_DETAILS
    );
  };

  const handleAgentDetails = (userMessage: string) => {
    setInterviewerData(prev => ({ ...prev, name: userMessage }));
    setCurrentPhase(ConversationPhase.AGENT_DETAILS);
    
    addAssistantMessage(
      `Perfect! "${userMessage}" is a great name. Now I'll create a customized interview guide for your interviewer.\n
Based on your research goals and chosen archetype, I'll generate a structured interview flow. **Is there anything specific you want me to include or focus on in the interview questions?**\n
For example:
- Specific topics to cover
- Types of questions (open-ended, rating scales, etc.)
- Key areas of interest\n
Or just type "auto-generate" and I'll create a comprehensive guide based on best practices.`,
      ConversationPhase.INTERVIEW_GUIDE
    );
  };

  const handleInterviewGuide = (userMessage: string) => {
    // Generate interview guide based on archetype and user input
    let guideContent = '';
    const archetype = ARCHETYPES.find(a => a.id === interviewerData.archetype);
    
    if (userMessage.toLowerCase().includes('auto') || userMessage.toLowerCase().includes('generate')) {
      guideContent = `# ${interviewerData.name} Interview Guide\n
## Introduction
Thank you for participating in this ${archetype?.title.toLowerCase()}. This conversation will help us ${interviewerData.researchGoals.toLowerCase()}.\n
## Key Questions
1. Can you tell me about your background and experience?
2. What are your main challenges in this area?
3. How do you currently handle [relevant topic]?
4. What would an ideal solution look like to you?
5. Any final thoughts or questions?`;
    } else {
      guideContent = `# ${interviewerData.name} Interview Guide\n
## Introduction
Thank you for participating in this ${archetype?.title.toLowerCase()}.\n
## Focus Areas
Based on your input: ${userMessage}\n
## Key Questions
1. Opening question about background
2. Questions focused on: ${userMessage}
3. Follow-up and clarification questions
4. Closing thoughts`;
    }
    
    setInterviewerData(prev => ({ ...prev, interviewGuide: guideContent }));
    setCurrentPhase(ConversationPhase.INTERVIEW_GUIDE);
    
    addAssistantMessage(
      `Excellent! I've created a tailored interview guide for your interviewer. Now, let's add some knowledge context.\n
**Do you have any background information, context, or specific knowledge you want your interviewer to be aware of during interviews?**\n
This could include:
- Company background
- Product information
- Industry context
- Previous research findings
- Specific terminology\n
Or type "skip" if you don't need any additional context right now.`,
      ConversationPhase.KNOWLEDGE_BASE
    );
  };

  const handleKnowledgeBase = (userMessage: string) => {
    if (!userMessage.toLowerCase().includes('skip')) {
      setInterviewerData(prev => ({ ...prev, knowledgeText: userMessage }));
    }
    
    setCurrentPhase(ConversationPhase.KNOWLEDGE_BASE);
    addAssistantMessage(
      `Great! Your interviewer will use **Inbound Calls** - participants will call a dedicated phone number to complete the interview.\n
**Price:** $${PRICE_BY_CHANNEL.inbound_call} per interview\n
**Features:**
- Dedicated phone number
- Voice interaction
- Call recording\n`,
      ConversationPhase.CHANNEL_SELECTION
    );
    
    setInterviewerData(prev => ({ ...prev, channel: 'inbound_call' }));
    setCurrentPhase(ConversationPhase.CHANNEL_SELECTION);
    
    const archetype = ARCHETYPES.find(a => a.id === interviewerData.archetype);
    
    addAssistantMessage(
      `Perfect! Here's a summary of your interviewer:\n
**Interviewer Name:** ${interviewerData.name}\n
**Type:** ${archetype?.title}\n
**Communication:** Inbound Call\n
**Price:** $${PRICE_BY_CHANNEL.inbound_call} per interview\n
**Research Goals:** ${interviewerData.researchGoals}\n
Your interviewer will have a customized interview guide and ${interviewerData.knowledgeText ? 'background knowledge context' : 'no additional context'}.\n
**Are you ready to create this interviewer?** Type "yes" to proceed or "modify" if you want to change anything.`,
      ConversationPhase.REVIEW_CONFIRM
    );
  };

  const handleConfirmChannel = (userMessage: string) => {
    setCurrentPhase(ConversationPhase.CHANNEL_SELECTION);
    const archetype = ARCHETYPES.find(a => a.id === interviewerData.archetype);
    
    addAssistantMessage(
      `Perfect! Here's a summary of your interviewer:\n
**Interviewer Name:** ${interviewerData.name}\n
**Type:** ${archetype?.title}\n
**Communication:** Inbound Call\n
**Price:** $${PRICE_BY_CHANNEL.inbound_call} per interview\n
**Research Goals:** ${interviewerData.researchGoals}\n
Your interviewer will have a customized interview guide and ${interviewerData.knowledgeText ? 'background knowledge context' : 'no additional context'}.\n
**Are you ready to create this interviewer?** Type "yes" to proceed or "modify" if you want to change anything.`,
      ConversationPhase.REVIEW_CONFIRM
    );
  };

  const handleReviewConfirm = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('modify') || lowerMessage.includes('change') || lowerMessage.includes('no')) {
      addAssistantMessage(
        `No problem! What would you like to modify? You can change:
- Interviewer name
- Communication method
- Interview focus
- Background context\n
Or if you prefer more control, you can switch to our manual setup process.`,
        ConversationPhase.REVIEW_CONFIRM
      );
      return;
    }
    
    setCurrentPhase(ConversationPhase.REVIEW_CONFIRM);
    createInterviewer();
  };

  const handleFinalConfirmation = (userMessage: string) => {
    // Handle any final modifications or confirmations
    createInterviewer();
  };

  const createInterviewer = async () => {
    if (!interviewerData.archetype) return;
    
    setIsCreating(true);
    addAssistantMessage(`Creating your interviewer now... This will just take a moment! ✨`);
    
    try {
      const newInterviewer = await agentsService.createAgent({
        name: interviewerData.name,
        archetype: interviewerData.archetype,
        language: interviewerData.language,
        voiceId: interviewerData.voiceId,
        channel: interviewerData.channel,
      });

      // Provision contact info
      await agentsService.provisionContact(newInterviewer.id);

      setCurrentPhase(ConversationPhase.COMPLETE);
      addAssistantMessage(
        `🎉 **Success!** Your interviewer "${interviewerData.name}" has been created and is ready to use!\n
Your interviewer is now live and ready to conduct interviews. You can view details, test it out, or share it with participants.\n
**What would you like to do next?**`,
        ConversationPhase.COMPLETE
      );

      toast({
        title: 'Success!',
        description: 'Your interviewer has been created and is ready to test.',
      });

      // Navigate to interviewer details after a short delay
      setTimeout(() => {
        navigate(`/app/interviewers/${newInterviewer.id}`);
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create interviewer. Please try again.',
        variant: 'destructive',
      });
      addAssistantMessage(
        `I'm sorry, there was an error creating your interviewer. Please try again or switch to manual setup if the problem persists.`
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background pb-4 -mx-4 px-4 -mt-8 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Genie-Assisted Interviewer Creation</h1>
              <p className="text-muted-foreground">Let's create your perfect interviewer together</p>
            </div>
          </div>
          
          <Link to="/app/interviewers/new/manual">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Switch to Manual
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Setup Progress</span>
                  <span className="text-sm text-muted-foreground">{getProgressPercentage()}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
              
              <div className="space-y-2">
                {Object.entries(phaseLabels).map(([phase, label]) => {
                  const isCompleted = getCompletedPhases().includes(phase as ConversationPhase);
                  const isCurrent = currentPhase === phase;
                  
                  return (
                    <div key={phase} className="flex items-center gap-2 text-sm">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : isCurrent ? (
                        <Clock className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted" />
                      )}
                      <span className={`${isCurrent ? 'font-medium text-primary' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Genie Agent Configuration Assistant</CardTitle>
                  <CardDescription>Creating your perfect interview agent</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content.split('**').map((part, index) => 
                          index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                        )}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              {currentPhase !== ConversationPhase.COMPLETE && !isCreating && (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type your response..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isTyping}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {currentPhase === ConversationPhase.COMPLETE && (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/app/agents`)}
                      variant="outline"
                      className="flex-1"
                    >
                      View All Interviewers
                    </Button>
                    <Button 
                      onClick={() => navigate(`/app/interviewers/${interviewerData.name ? 'new' : ''}`)}
                      className="flex-1"
                    >
                      Create Another
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved progress. Are you sure you want to leave? 
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
