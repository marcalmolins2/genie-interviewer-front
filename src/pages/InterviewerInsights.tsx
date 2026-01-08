import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft,
  BarChart3,
  Clock,
  Users,
  MessageSquare,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  FileSliders,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';
import { SessionFeedback } from '@/components/SessionFeedback';
import { 
  KeyFindingsList, 
  CrossSessionQA,
  CrossSessionSummary,
} from '@/components/insights';
import { Agent, InterviewSummary, SessionFeedback as SessionFeedbackType, FindingsCategory, CrossSessionSummary as CrossSessionSummaryType } from '@/types';
import { interviewersService, agentsService } from '@/services/interviewers';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export default function InterviewerInsights() {
  const { interviewerId } = useParams<{ interviewerId: string }>();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'cross-session';
  const [interviewer, setInterviewer] = useState<Agent | null>(null);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [selectedTranscript, setSelectedTranscript] = useState<InterviewSummary | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Mock cross-session summary
  const mockCrossSessionSummary: CrossSessionSummaryType = {
    narrativeParagraph: "Across five interviews with enterprise technology leaders, this research explored AI adoption challenges and implementation strategies. Participants consistently highlighted training gaps and unclear ROI as primary barriers, while successful adopters emphasized pilot programs and transparent communication as key enablers.",
    keyTakeaways: [
      "ROI uncertainty is the top barrier—leadership needs concrete metrics before committing",
      "Fear of job displacement creates resistance across all organization sizes",
      "Pilot programs with clear, measurable wins drive broader organizational adoption",
      "Training investment correlates strongly with successful implementation outcomes",
      "Younger employees adopt faster but need structured governance frameworks"
    ],
    stats: {
      sessionCount: 5,
      totalDurationMinutes: 192,
      dateRange: { start: '2024-11-29', end: '2024-12-01' }
    }
  };

  // Mock key findings - categories from both interview guide sections AND emergent themes
  const mockKeyFindings: FindingsCategory[] = [
    // Emergent themes (derived from cross-session analysis)
    {
      id: 'theme-adoption-barriers',
      category: 'AI Adoption Barriers',
      summary: 'Participants consistently mention lack of training and unclear ROI as primary barriers to AI adoption in their organizations.',
      source: 'emergent',
      sessionCount: 4,
      findings: [
        {
          id: 'finding-barriers-1',
          insight: 'Unclear ROI metrics make it difficult to secure leadership buy-in for AI initiatives',
          supportingQuote: {
            text: "We can't justify the investment without concrete numbers. Leadership keeps asking for ROI projections we simply don't have.",
            sessionId: 'int-20241201-001',
            sessionDate: '2024-12-01T14:30:00Z',
          },
          sessionIds: ['int-20241201-001', 'int-20241130-004'],
        },
        {
          id: 'finding-barriers-2',
          insight: 'Organizations lack practical AI skills training, leaving employees unable to leverage tools effectively',
          supportingQuote: {
            text: "We bought the tools, but nobody knows how to use them effectively. It's like having a sports car but only driving it in first gear.",
            sessionId: 'int-20241201-001',
            sessionDate: '2024-12-01T14:30:00Z',
          },
          sessionIds: ['int-20241201-001', 'int-20241201-002'],
        },
      ],
    },
    {
      id: 'theme-change-management',
      category: 'Change Management Challenges',
      summary: 'Stakeholder buy-in and fear of job displacement emerge as recurring concerns across interviews.',
      source: 'emergent',
      sessionCount: 5,
      findings: [
        {
          id: 'finding-change-1',
          insight: 'Fear of job displacement creates organizational resistance that slows adoption',
          supportingQuote: {
            text: "The biggest hurdle has been getting buy-in from stakeholders. There's a lot of fear around AI replacing jobs.",
            sessionId: 'int-20241201-001',
            sessionDate: '2024-12-01T14:30:00Z',
          },
          sessionIds: ['int-20241201-001', 'int-20241201-002', 'int-20241130-004'],
        },
        {
          id: 'finding-change-2',
          insight: 'Generational divide affects AI adoption, with younger employees embracing tools faster',
          supportingQuote: {
            text: "Some pushback from the old guard, definitely. They're worried about quality control. But the younger consultants are embracing it fully.",
            sessionId: 'int-20241201-002',
            sessionDate: '2024-12-01T09:15:00Z',
          },
          sessionIds: ['int-20241201-002'],
        },
      ],
    },
    // Interview guide categories
    {
      id: 'cat-challenges',
      category: 'Current Challenges',
      summary: 'Users consistently struggle with the initial learning curve and lack of clear documentation for advanced features.',
      source: 'interview_guide',
      findings: [
        {
          id: 'finding-1',
          insight: 'Most users feel overwhelmed during the first week of use due to lack of structured onboarding',
          supportingQuote: {
            text: "We bought the tools, but nobody knows how to use them effectively. It's like having a sports car but only driving it in first gear.",
            sessionId: 'int-20241201-001',
            sessionDate: '2024-12-01T14:30:00Z',
          },
          sessionIds: ['int-20241201-001', 'int-20241201-002'],
        },
        {
          id: 'finding-2',
          insight: 'Documentation gaps are cited as primary friction point for advanced feature adoption',
          supportingQuote: {
            text: "The biggest hurdle has been getting buy-in from stakeholders. There's a lot of fear around AI replacing jobs.",
            sessionId: 'int-20241201-001',
            sessionDate: '2024-12-01T14:30:00Z',
          },
          sessionIds: ['int-20241201-001', 'int-20241130-004'],
        },
      ],
    },
    {
      id: 'cat-strategies',
      category: 'Adoption Strategies',
      summary: 'Organizations that start with small pilots and invest in training see significantly higher adoption rates.',
      source: 'interview_guide',
      findings: [
        {
          id: 'finding-3',
          insight: 'Pilot programs demonstrate value without overwhelming teams and reduce organizational resistance',
          supportingQuote: {
            text: "We started with small pilot programs that showed clear value without displacing anyone. The results spoke for themselves.",
            sessionId: 'int-20241201-002',
            sessionDate: '2024-12-01T09:15:00Z',
          },
          sessionIds: ['int-20241201-001', 'int-20241130-004'],
        },
        {
          id: 'finding-4',
          insight: 'Transparent communication about AI role reduces resistance and builds trust',
          supportingQuote: {
            text: "Response times dropped by 60%, and our CSAT scores went up by 15 points. But the real win was higher job satisfaction.",
            sessionId: 'int-20241130-004',
            sessionDate: '2024-11-30T11:20:00Z',
          },
          sessionIds: ['int-20241201-001', 'int-20241201-002', 'int-20241130-004'],
        },
      ],
    },
    {
      id: 'cat-recommendations',
      category: 'Implementation Recommendations',
      summary: 'Users want better integration capabilities and more intuitive onboarding experiences.',
      source: 'interview_guide',
      findings: [
        {
          id: 'finding-5',
          insight: 'Starting with low-risk administrative functions allows teams to build confidence before tackling core workflows',
          supportingQuote: {
            text: "Start with administrative functions first - they're lower risk but high impact. Get legal and compliance involved early.",
            sessionId: 'int-20241130-004',
            sessionDate: '2024-11-30T11:20:00Z',
          },
          sessionIds: ['int-20241130-004'],
        },
        {
          id: 'finding-6',
          insight: 'Interactive tutorials are preferred over static documentation for onboarding new users',
          supportingQuote: {
            text: "We bought the tools, but nobody knows how to use them effectively. It's like having a sports car but only driving it in first gear.",
            sessionId: 'int-20241201-001',
            sessionDate: '2024-12-01T14:30:00Z',
          },
          sessionIds: ['int-20241201-001', 'int-20241201-002'],
        },
      ],
    },
  ];

  // Build session date mapping for citations
  const sessionDates: Record<string, string> = {
    'int-20241201-001': '2024-12-01T14:30:00Z',
    'int-20241201-002': '2024-12-01T09:15:00Z',
    'int-20241130-003': '2024-11-30T16:45:00Z',
    'int-20241130-004': '2024-11-30T11:20:00Z',
    'int-20241129-005': '2024-11-29T13:00:00Z',
  };

  // Sessions for Q&A component
  const sessionsForQA = interviews.map(i => ({ id: i.id, date: i.startedAt }));

  useEffect(() => {
    if (interviewerId) {
      loadData();
    }
  }, [interviewerId]);

  const loadData = async () => {
    if (!interviewerId) return;
    
    try {
      const [interviewerData, interviewsData, statsData] = await Promise.all([
        agentsService.getAgent(interviewerId),
        agentsService.getAgentInterviews(interviewerId),
        agentsService.getAgentStats(interviewerId),
      ]);
      
      if (interviewerData) {
        setInterviewer(interviewerData);
        
        // Add mock interviews for demo
        const mockInterviews: InterviewSummary[] = [
          {
            id: 'int-20241201-001',
            agentId: interviewerId,
            startedAt: '2024-12-01T14:30:00Z',
            durationSec: 1280,
            completed: true,
            respondentId: 'sarah.chen@company.com',
            channel: interviewerData.channel,
            feedback: { sessionId: 'int-20241201-001', rating: 'positive', submittedAt: '2024-12-01T15:00:00Z' }
          },
          {
            id: 'int-20241201-002', 
            agentId: interviewerId,
            startedAt: '2024-12-01T09:15:00Z',
            durationSec: 952,
            completed: true,
            respondentId: 'mike.rodriguez@company.com',
            channel: interviewerData.channel,
            feedback: { sessionId: 'int-20241201-002', rating: 'negative', negativeReason: 'Audio quality was poor', submittedAt: '2024-12-01T09:45:00Z' }
          },
          {
            id: 'int-20241130-003',
            agentId: interviewerId,
            startedAt: '2024-11-30T16:45:00Z', 
            durationSec: 445,
            completed: false,
            respondentId: 'emma.johnson@company.com',
            channel: interviewerData.channel
          },
          {
            id: 'int-20241130-004',
            agentId: interviewerId,
            startedAt: '2024-11-30T11:20:00Z',
            durationSec: 1560,
            completed: true,
            respondentId: 'david.kim@company.com',
            channel: interviewerData.channel
            // No feedback yet
          },
          {
            id: 'int-20241129-005',
            agentId: interviewerId,
            startedAt: '2024-11-29T13:00:00Z',
            durationSec: 720,
            completed: false,
            respondentId: 'lisa.wang@company.com',
            channel: interviewerData.channel
          }
        ];
        
        setInterviews(mockInterviews);
        setStats(statsData);
      } else {
        navigate('/app/interviewers');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load interviewer analytics.',
        variant: 'destructive',
      });
      navigate('/app/interviewers');
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = searchQuery === '' || 
      interview.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && interview.completed) ||
      (statusFilter === 'incomplete' && !interview.completed);
    
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewTranscript = (interview: InterviewSummary) => {
    setSelectedTranscript(interview);
    setIsTranscriptOpen(true);
  };

  const generatePPTReport = () => {
    const completedInterviews = interviews.filter(i => i.completed);
    const totalHours = Math.round(interviews.reduce((sum, i) => sum + i.durationSec, 0) / 3600 * 10) / 10;
    const completionRate = Math.round((completedInterviews.length / interviews.length) * 100);
    
    // Get unique profiles/respondents
    const profiles = [...new Set(interviews.map(i => i.respondentId?.split('@')[0] || 'Unknown'))];
    
    const reportData = {
      title: `${interviewer.name} - Interview Analysis Report`,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      metrics: {
        totalInterviews: interviews.length,
        completedInterviews: completedInterviews.length,
        totalHours,
        completionRate,
        profiles: profiles.slice(0, 5), // Show top 5 profiles
        revenue: completedInterviews.length * interviewer.pricePerInterviewUsd,
        avgDuration: formatDuration(stats?.averageDuration || 0),
        topTopics: mockKeyFindings.filter(c => c.source === 'emergent').slice(0, 3).map(c => ({ name: c.category, value: c.sessionCount || 0 }))
      }
    };

    // Create a mock PPT report summary
    const pptContent = `
PowerPoint Report Generated: ${reportData.title}

SLIDE 1: Executive Summary
• We have conducted ${reportData.metrics.totalInterviews} interviews during ${reportData.metrics.totalHours} hours
• Across profiles: ${reportData.metrics.profiles.join(', ')}${reportData.metrics.profiles.length < profiles.length ? '...' : ''}
• Completion rate: ${reportData.metrics.completionRate}%
• Total revenue generated: $${reportData.metrics.revenue}

SLIDE 2: Key Metrics
• Average interview duration: ${reportData.metrics.avgDuration}
• Completed interviews: ${reportData.metrics.completedInterviews}/${reportData.metrics.totalInterviews}
• Performance trend: ${reportData.metrics.completionRate >= 70 ? 'Excellent' : reportData.metrics.completionRate >= 50 ? 'Good' : 'Needs Improvement'}

SLIDE 3: Top Discussion Topics
${reportData.metrics.topTopics.map((topic, i) => `${i + 1}. ${topic.name} (${topic.value} mentions)`).join('\n')}

SLIDE 4: Recommendations
• ${reportData.metrics.completionRate >= 70 ? 'Continue current strategy' : 'Optimize interview flow to improve completion rates'}
• Focus on high-engagement discussion topics
• Consider expanding successful topic areas
    `.trim();

    // In a real implementation, this would generate an actual PowerPoint file
    // For now, we'll show the content and simulate download
    const blob = new Blob([pptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${interviewer.name.replace(/\s+/g, '_')}_Interview_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'PPT Report Generated',
      description: `Interview analysis report for ${interviewer.name} has been downloaded.`,
    });
  };

  const getMockTranscript = (interview: InterviewSummary) => {
    const transcripts = {
      'int-20241201-001': {
        title: 'Customer Experience Interview',
        content: [
          { speaker: 'Agent', text: "Hi Sarah! Thank you for joining me today. I'm excited to learn about your experience with our AI strategy tools. Could you start by telling me a bit about your role and how you currently approach AI implementation?" },
          { speaker: 'Sarah', text: "Hi! I'm a Product Manager at a fintech company. We've been exploring AI integration for about 18 months now, mainly focusing on customer service automation and risk assessment." },
          { speaker: 'Agent', text: "That's fascinating! What's been the biggest challenge you've faced during this AI implementation journey?" },
          { speaker: 'Sarah', text: "Honestly, the biggest hurdle has been getting buy-in from stakeholders. There's a lot of fear around AI replacing jobs, and we've had to be very careful about how we position these tools as augmentation rather than replacement." },
          { speaker: 'Agent', text: "That's a common concern. How have you addressed those fears? What strategies have worked best for you?" },
          { speaker: 'Sarah', text: "We started with small pilot programs that showed clear value without displacing anyone. For example, our AI chatbot handles routine queries, which freed up our human agents to focus on complex issues. The results spoke for themselves - customer satisfaction actually improved." },
          { speaker: 'Agent', text: "That's a smart approach. Can you tell me more about the specific metrics you used to measure success?" },
          { speaker: 'Sarah', text: "We tracked response times, resolution rates, and customer satisfaction scores. Response times dropped by 60%, and our CSAT scores went up by 15 points. But the real win was that our human agents reported higher job satisfaction because they weren't dealing with repetitive tasks anymore." }
        ]
      },
      'int-20241201-002': {
        title: 'Technology Assessment Interview',
        content: [
          { speaker: 'Agent', text: "Hello Mike! Thanks for taking the time to chat with me today. I understand you're involved in AI strategy at your company. Could you walk me through your current AI landscape?" },
          { speaker: 'Mike', text: "Sure thing! I'm a CTO at a mid-size consulting firm. We've been cautiously dipping our toes into AI, mainly using tools like ChatGPT for content creation and some basic automation workflows." },
          { speaker: 'Agent', text: "What's driving your AI adoption? Are there specific business challenges you're trying to solve?" },
          { speaker: 'Mike', text: "The main driver is efficiency. Our consultants spend way too much time on routine tasks - writing proposals, creating reports, doing initial research. If we can automate even 30% of that, it frees them up for high-value client work." },
          { speaker: 'Agent', text: "That makes perfect sense. Have you encountered any resistance to implementing these AI tools?" },
          { speaker: 'Mike', text: "Some pushback from the old guard, definitely. They're worried about quality control and client perception. 'What if the client finds out we used AI?' kind of thing. But the younger consultants are embracing it fully." },
          { speaker: 'Agent', text: "How are you handling that generational divide? Any specific strategies that have worked?" },
          { speaker: 'Mike', text: "Training and transparency have been key. We show everyone how to use AI as a starting point, not a final product. And we're completely transparent with clients about our AI-assisted processes. Most actually appreciate the efficiency gains." }
        ]
      },
      'int-20241130-004': {
        title: 'Strategic Planning Discussion',
        content: [
          { speaker: 'Agent', text: "Hi David! I'm looking forward to our conversation today about AI strategy. Could you tell me about your organization and your role in AI initiatives?" },
          { speaker: 'David', text: "Hello! I'm the Head of Digital Transformation at a healthcare organization. AI is obviously huge in healthcare right now, but we have to be incredibly careful about implementation due to regulatory requirements." },
          { speaker: 'Agent', text: "Healthcare AI certainly comes with unique challenges. What specific areas are you focusing on?" },
          { speaker: 'David', text: "We're looking at diagnostic assistance, patient flow optimization, and administrative automation. But everything has to be HIPAA compliant and clinically validated. It's a slow process, but necessary." },
          { speaker: 'Agent', text: "What's been your biggest success story so far?" },
          { speaker: 'David', text: "Our patient scheduling AI has been a game-changer. It reduced no-shows by 25% and optimized our appointment slots. Patients love the flexibility, and our staff isn't spending hours on phone scheduling." },
          { speaker: 'Agent', text: "That's impressive! What lessons learned would you share with other healthcare organizations starting their AI journey?" },
          { speaker: 'David', text: "Start with administrative functions first - they're lower risk but high impact. Get your legal and compliance teams involved early. And invest heavily in staff training. The technology is only as good as the people using it." }
        ]
      }
    };

    return transcripts[interview.id as keyof typeof transcripts] || {
      title: 'Interview Transcript',
      content: [
        { speaker: 'Agent', text: "Thank you for participating in this interview today. Could you tell me a bit about your background?" },
        { speaker: 'Participant', text: "Of course! I'd be happy to share my experience and thoughts on this topic." },
        { speaker: 'Agent', text: "That's great. What are the main challenges you face in your current role?" },
        { speaker: 'Participant', text: "The biggest challenge is definitely staying up to date with rapidly changing technology while ensuring our solutions remain practical and user-friendly." }
      ]
    };
  };

  // Computed stats for the bar
  const completedCount = interviews.filter(i => i.completed).length;
  const completionRatePercent = interviews.length > 0 
    ? Math.round((completedCount / interviews.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!interviewer) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center">
          <CardTitle className="mb-2">Interviewer not found</CardTitle>
          <CardDescription className="mb-6">
            The requested interviewer could not be found.
          </CardDescription>
          <Link to="/app/interviewers">
            <Button>Back to Interviewers</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/app/interviewers/${interviewer.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviewer
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Insights: {interviewer.name}</h1>
            <p className="text-muted-foreground">
              Cross-session insights and individual interview sessions
            </p>
          </div>
        </div>

      </div>

      {/* Insights Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cross-session">Cross-Session Insights</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Cross-Session Insights Tab (Default) */}
        <TabsContent value="cross-session" className="space-y-4">
          {/* Split Panel Layout */}
          {isMobile ? (
            // Stacked layout for mobile/tablet
            <div className="space-y-6">
              {/* Executive Summary */}
              <CrossSessionSummary summary={mockCrossSessionSummary} />

              {/* Key Findings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Findings</h3>
                <KeyFindingsList 
                  categories={mockKeyFindings} 
                  interviewerId={interviewerId!}
                  sessionDates={sessionDates}
                />
              </div>

              {/* Right Content: Q&A */}
              <div className="min-h-[500px]">
                <CrossSessionQA 
                  interviewerId={interviewerId!}
                  sessions={sessionsForQA}
                />
              </div>
            </div>
          ) : (
            // Side-by-side layout for desktop
            <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-280px)] rounded-lg border">
              {/* Left Panel: Executive Summary + Key Findings */}
              <ResizablePanel defaultSize={60} minSize={40}>
                <ScrollArea className="h-full">
                  <div className="p-4 bg-background rounded-lg space-y-6">
                    {/* Executive Summary */}
                    <CrossSessionSummary summary={mockCrossSessionSummary} />

                    {/* Key Findings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Key Findings</h3>
                      <KeyFindingsList 
                        categories={mockKeyFindings} 
                        interviewerId={interviewerId!}
                        sessionDates={sessionDates}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Right Panel: Q&A */}
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full rounded-lg overflow-hidden bg-muted/30">
                  <CrossSessionQA 
                    interviewerId={interviewerId!}
                    sessions={sessionsForQA}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalInterviews || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.last7Days || 0} in last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats?.completionRate || 0) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.completedInterviews || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(stats?.averageDuration || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per completed interview
                </p>
              </CardContent>
            </Card>

          </div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interviews</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interviews Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interview ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'No interviews match your filters' 
                          : 'No interviews yet'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">
                        {interview.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{formatDate(interview.startedAt)}</TableCell>
                      <TableCell>{formatDuration(interview.durationSec)}</TableCell>
                      <TableCell>
                        <Badge variant={interview.completed ? 'default' : 'secondary'}>
                          {interview.completed ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Incomplete
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/app/interviewers/${interviewerId}/sessions/${interview.id}`)}
                          disabled={!interview.completed}
                        >
                          View Session Details
                        </Button>
                      </TableCell>
                      <TableCell>
                        {interview.completed ? (
                          (() => {
                            const storedFeedback = localStorage.getItem(`session-feedback-${interview.id}`);
                            const feedback = storedFeedback ? JSON.parse(storedFeedback) as SessionFeedbackType : interview.feedback;
                            return feedback?.rating === 'positive' ? (
                              <ThumbsUp className="h-4 w-4 text-emerald-600" />
                            ) : feedback?.rating === 'negative' ? (
                              <ThumbsDown className="h-4 w-4 text-rose-600" />
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            );
                          })()
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Transcript Modal */}
      <Dialog open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTranscript && getMockTranscript(selectedTranscript).title}
            </DialogTitle>
            <DialogDescription>
              Interview conducted on {selectedTranscript && formatDate(selectedTranscript.startedAt)} • 
              Duration: {selectedTranscript && formatDuration(selectedTranscript.durationSec)} • 
              Participant: {selectedTranscript?.respondentId || 'Anonymous'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            {selectedTranscript && getMockTranscript(selectedTranscript).content.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.speaker === 'Agent' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  message.speaker === 'Agent' 
                    ? 'bg-muted' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <div className="font-medium text-sm mb-1 opacity-70">
                    {message.speaker}
                  </div>
                  <div className="text-sm leading-relaxed">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Transcript ID: {selectedTranscript?.id}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                Export to PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}