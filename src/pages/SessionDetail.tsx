import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { TranscriptSection } from '@/components/TranscriptSection';
import { TranscriptSearch } from '@/components/TranscriptSearch';
import { TranscriptQA } from '@/components/TranscriptQA';
import { SessionFeedback } from '@/components/SessionFeedback';
import { useIsMobile } from '@/hooks/use-mobile';
import type { SessionDetail as SessionDetailType, QAMessage, SessionFeedback as SessionFeedbackType } from '@/types';

// Mock session data
const getMockSessionDetail = (sessionId: string, agentId: string): SessionDetailType => {
  const sessions: Record<string, SessionDetailType> = {
    'int-20241201-001': {
      id: 'int-20241201-001',
      agentId,
      startedAt: '2024-12-01T14:30:00Z',
      durationSec: 1280,
      completed: true,
      respondentId: 'sarah.chen@company.com',
      channel: 'inbound_call',
      transcript: {
        sections: [
          {
            id: 'q1',
            question: "Could you start by telling me about your role and how you currently approach AI implementation?",
            timestamp: "00:00:45",
            answer: {
              summary: "Product Manager at a fintech company focusing on AI integration for 18 months",
              bulletPoints: [
                "Works as a Product Manager at a fintech company",
                "Has been exploring AI integration for approximately 18 months",
                "Primary focus areas include customer service automation and risk assessment",
                "Team is actively evaluating various AI solutions for their platform"
              ],
              rawText: "Hi! I'm a Product Manager at a fintech company. We've been exploring AI integration for about 18 months now, mainly focusing on customer service automation and risk assessment."
            }
          },
          {
            id: 'q2',
            question: "What's been the biggest challenge you've faced during this AI implementation journey?",
            timestamp: "03:15",
            answer: {
              summary: "Stakeholder buy-in and fear of job replacement are the main challenges",
              bulletPoints: [
                "Getting buy-in from stakeholders has been the biggest hurdle",
                "Significant fear around AI replacing human jobs",
                "Had to carefully position AI tools as augmentation rather than replacement",
                "Change management requires thoughtful communication strategy"
              ],
              rawText: "Honestly, the biggest hurdle has been getting buy-in from stakeholders. There's a lot of fear around AI replacing jobs, and we've had to be very careful about how we position these tools as augmentation rather than replacement."
            }
          },
          {
            id: 'q3',
            question: "How have you addressed those fears? What strategies have worked best for you?",
            timestamp: "05:42",
            answer: {
              summary: "Started with small pilot programs that showed clear value without displacing anyone",
              bulletPoints: [
                "Began with small pilot programs to demonstrate value",
                "AI chatbot handles routine queries, freeing human agents for complex issues",
                "Results showed improved customer satisfaction",
                "Approach proved that AI enhances rather than replaces human work"
              ],
              rawText: "We started with small pilot programs that showed clear value without displacing anyone. For example, our AI chatbot handles routine queries, which freed up our human agents to focus on complex issues. The results spoke for themselves - customer satisfaction actually improved."
            }
          },
          {
            id: 'q4',
            question: "Can you tell me more about the specific metrics you used to measure success?",
            timestamp: "08:30",
            answer: {
              summary: "Tracked response times, resolution rates, and CSAT scores with impressive improvements",
              bulletPoints: [
                "Response times dropped by 60% after AI implementation",
                "Customer satisfaction scores increased by 15 points",
                "Human agents reported higher job satisfaction",
                "Agents now focus on complex tasks instead of repetitive queries",
                "Overall resolution rates improved significantly"
              ],
              rawText: "We tracked response times, resolution rates, and customer satisfaction scores. Response times dropped by 60%, and our CSAT scores went up by 15 points. But the real win was that our human agents reported higher job satisfaction because they weren't dealing with repetitive tasks anymore."
            }
          },
          {
            id: 'q5',
            question: "What advice would you give to other organizations starting their AI journey?",
            timestamp: "12:15",
            answer: {
              summary: "Start small, focus on augmentation messaging, and invest in training",
              bulletPoints: [
                "Start with small, low-risk pilot programs",
                "Focus messaging on augmentation rather than replacement",
                "Invest heavily in employee training and change management",
                "Let results speak for themselves before scaling",
                "Involve stakeholders early in the process"
              ]
            }
          }
        ]
      }
    },
    'int-20241201-002': {
      id: 'int-20241201-002',
      agentId,
      startedAt: '2024-12-01T09:15:00Z',
      durationSec: 952,
      completed: true,
      respondentId: 'mike.rodriguez@company.com',
      channel: 'inbound_call',
      transcript: {
        sections: [
          {
            id: 'q1',
            question: "Could you walk me through your current AI landscape at your company?",
            timestamp: "00:00:30",
            answer: {
              summary: "CTO at mid-size consulting firm, cautiously adopting AI for content and automation",
              bulletPoints: [
                "CTO at a mid-size consulting firm",
                "Taking a cautious approach to AI adoption",
                "Currently using tools like ChatGPT for content creation",
                "Implementing basic automation workflows"
              ]
            }
          },
          {
            id: 'q2',
            question: "What's driving your AI adoption? Are there specific business challenges you're trying to solve?",
            timestamp: "02:45",
            answer: {
              summary: "Main driver is efficiency - consultants spend too much time on routine tasks",
              bulletPoints: [
                "Primary driver is improving efficiency",
                "Consultants spend excessive time on routine tasks",
                "Target activities include writing proposals, creating reports, initial research",
                "Goal to automate 30% of routine work",
                "Free up consultants for high-value client work"
              ]
            }
          },
          {
            id: 'q3',
            question: "Have you encountered any resistance to implementing these AI tools?",
            timestamp: "05:20",
            answer: {
              summary: "Pushback from senior staff about quality control and client perception",
              bulletPoints: [
                "Some pushback from senior consultants",
                "Concerns about quality control",
                "Worry about client perception if AI usage is discovered",
                "Younger consultants are embracing AI fully",
                "Generational divide in adoption attitudes"
              ]
            }
          },
          {
            id: 'q4',
            question: "How are you handling that generational divide? Any specific strategies that have worked?",
            timestamp: "08:10",
            answer: {
              summary: "Training, transparency, and positioning AI as a starting point not final product",
              bulletPoints: [
                "Training and transparency have been key strategies",
                "Teaching everyone to use AI as a starting point, not final product",
                "Complete transparency with clients about AI-assisted processes",
                "Most clients appreciate the efficiency gains",
                "Focus on quality output regardless of how it was created"
              ]
            }
          }
        ]
      }
    }
  };

  return sessions[sessionId] || {
    id: sessionId,
    agentId,
    startedAt: new Date().toISOString(),
    durationSec: 600,
    completed: true,
    respondentId: 'participant@example.com',
    channel: 'inbound_call',
    transcript: {
      sections: [
        {
          id: 'q1',
          question: "Could you tell me about your background and experience?",
          timestamp: "00:00:30",
          answer: {
            summary: "Professional with relevant industry experience",
            bulletPoints: [
              "Has extensive experience in the field",
              "Background includes various relevant roles",
              "Currently focused on strategic initiatives"
            ]
          }
        },
        {
          id: 'q2',
          question: "What are the main challenges you face in your current role?",
          timestamp: "03:00",
          answer: {
            summary: "Balancing technology adoption with practical implementation",
            bulletPoints: [
              "Staying up to date with rapidly changing technology",
              "Ensuring solutions remain practical and user-friendly",
              "Managing stakeholder expectations"
            ]
          }
        }
      ]
    }
  };
};

export default function SessionDetail() {
  const { interviewerId, sessionId } = useParams<{ interviewerId: string; sessionId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [session, setSession] = useState<SessionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [viewMode, setViewMode] = useState<'clean' | 'original'>('clean');
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SessionFeedbackType | null>(null);

  // Load feedback from localStorage
  useEffect(() => {
    if (sessionId) {
      const storedFeedback = localStorage.getItem(`session-feedback-${sessionId}`);
      if (storedFeedback) {
        setFeedback(JSON.parse(storedFeedback));
      }
    }
  }, [sessionId]);

  useEffect(() => {
    if (interviewerId && sessionId) {
      // Simulate loading
      setTimeout(() => {
        const sessionData = getMockSessionDetail(sessionId, interviewerId);
        setSession(sessionData);
        setLoading(false);
      }, 500);
    }
  }, [interviewerId, sessionId]);

  const handleFeedbackSubmit = useCallback((newFeedback: SessionFeedbackType) => {
    setFeedback(newFeedback);
    localStorage.setItem(`session-feedback-${newFeedback.sessionId}`, JSON.stringify(newFeedback));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSaveMessage = useCallback((message: QAMessage) => {
    // In production, this would save to database
    console.log('Save message:', message);
  }, []);

  const handleCitationClick = useCallback((sectionId: string) => {
    setHighlightedSectionId(sectionId);
    
    // Scroll to the section
    const element = document.getElementById(`transcript-section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Clear highlight after animation
    setTimeout(() => {
      setHighlightedSectionId(null);
    }, 2000);
  }, []);

  const matchCount = searchQuery ? session?.transcript.sections.filter(s =>
    s.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.answer.bulletPoints.some(bp => bp.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.answer.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.answer.rawText?.toLowerCase().includes(searchQuery.toLowerCase())
  ).length : undefined;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    if (!session) return;
    
    let content: string;
    
    if (viewMode === 'original') {
      content = session.transcript.sections.map((s) => 
        `${s.question}\n\n${s.answer.rawText || 'Original transcript not available'}\n`
      ).join('\n---\n\n');
    } else {
      content = session.transcript.sections.map((s) => 
        `${s.question}\n\n${s.answer.summary ? s.answer.summary + '\n\n' : ''}${s.answer.bulletPoints.map(bp => `• ${bp}`).join('\n')}\n`
      ).join('\n---\n\n');
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${sessionId}-${viewMode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Session not found</h2>
          <p className="text-muted-foreground mb-6">
            The requested interview session could not be found.
          </p>
          <Button onClick={() => navigate(`/app/interviewers/${interviewerId}/insights?tab=sessions`)}>
            Back to Insights
          </Button>
        </Card>
      </div>
    );
  }

  // Transcript content renderer
  const renderTranscriptContent = () => (
    <>
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div className="min-w-[280px]">
          <TranscriptSearch 
            onSearch={handleSearch} 
            matchCount={matchCount}
            placeholder="Search questions & answers..."
          />
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-muted-foreground">View:</span>
          <Label 
            htmlFor="view-mode" 
            className={`text-sm cursor-pointer ${viewMode === 'clean' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            Clean
          </Label>
          <Switch
            id="view-mode"
            checked={viewMode === 'original'}
            onCheckedChange={(checked) => setViewMode(checked ? 'original' : 'clean')}
          />
          <Label 
            htmlFor="view-mode" 
            className={`text-sm cursor-pointer ${viewMode === 'original' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            Original
          </Label>
        </div>
      </div>
      
      <div className="space-y-3">
        {session.transcript.sections.map((section) => (
          <TranscriptSection
            key={section.id}
            section={section}
            searchQuery={searchQuery}
            viewMode={viewMode}
            isHighlighted={highlightedSectionId === section.id}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className="container flex flex-col" style={{ height: 'calc(100dvh - 64px)' }}>
      {/* Header */}
      <div className="flex-shrink-0 py-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/app/interviewers/${interviewerId}/insights?tab=sessions`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Interview Session</h1>
              <p className="text-sm text-muted-foreground">{session.id}</p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Session Metadata */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(session.startedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDuration(session.durationSec)}</span>
              </div>
              <Badge variant={session.completed ? 'default' : 'secondary'}>
                {session.completed ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Incomplete</>
                )}
              </Badge>
            </div>
            
            {session.completed && (
              <SessionFeedback
                sessionId={session.id}
                currentFeedback={feedback}
                onFeedbackSubmit={handleFeedbackSubmit}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 min-h-0 pb-4">
        {isMobile ? (
          // Mobile: Stacked layout
          <div className="h-full overflow-auto space-y-4">
            <div className="space-y-4 pb-4">
              {renderTranscriptContent()}
            </div>
            <div className="min-h-[500px]">
              <TranscriptQA
                sessionId={session.id}
                transcript={session.transcript}
                initialMessages={qaMessages}
                onSaveMessage={handleSaveMessage}
                onCitationClick={handleCitationClick}
              />
            </div>
          </div>
        ) : (
          // Desktop: Resizable panels
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
            {/* Transcript Panel */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {renderTranscriptContent()}
                </div>
              </ScrollArea>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Q&A Panel */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full flex flex-col overflow-hidden bg-muted/30">
                <TranscriptQA
                  sessionId={session.id}
                  transcript={session.transcript}
                  initialMessages={qaMessages}
                  onSaveMessage={handleSaveMessage}
                  onCitationClick={handleCitationClick}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
