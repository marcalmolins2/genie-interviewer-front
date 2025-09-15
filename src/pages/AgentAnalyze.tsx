import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  ArrowLeft,
  BarChart3,
  Clock,
  Users,
  MessageSquare,
  Search,
  Filter,
  Download,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileSliders
} from 'lucide-react';
import { Agent, InterviewSummary } from '@/types';
import { agentsService } from '@/services/agents';
import { useToast } from '@/hooks/use-toast';

// Mock chart component for demo
const SimpleBarChart = ({ data, title }: { data: any[], title: string }) => (
  <div className="space-y-4">
    <h4 className="font-medium">{title}</h4>
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-20 text-sm text-muted-foreground">{item.name}</div>
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm font-medium">{item.value}</div>
        </div>
      ))}
    </div>
  </div>
);

export default function AgentAnalyze() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [insightQuery, setInsightQuery] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState<InterviewSummary | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (agentId) {
      loadData();
    }
  }, [agentId]);

  const loadData = async () => {
    if (!agentId) return;
    
    try {
      const [agentData, interviewsData, statsData] = await Promise.all([
        agentsService.getAgent(agentId),
        agentsService.getAgentInterviews(agentId),
        agentsService.getAgentStats(agentId),
      ]);
      
      if (agentData) {
        setAgent(agentData);
        
        // Add mock interviews for demo
        const mockInterviews: InterviewSummary[] = [
          {
            id: 'int-20241201-001',
            agentId: agentId,
            startedAt: '2024-12-01T14:30:00Z',
            durationSec: 1280,
            completed: true,
            respondentId: 'sarah.chen@company.com',
            channel: agentData.channel
          },
          {
            id: 'int-20241201-002', 
            agentId: agentId,
            startedAt: '2024-12-01T09:15:00Z',
            durationSec: 952,
            completed: true,
            respondentId: 'mike.rodriguez@company.com',
            channel: agentData.channel
          },
          {
            id: 'int-20241130-003',
            agentId: agentId,
            startedAt: '2024-11-30T16:45:00Z', 
            durationSec: 445,
            completed: false,
            respondentId: 'emma.johnson@company.com',
            channel: agentData.channel
          },
          {
            id: 'int-20241130-004',
            agentId: agentId,
            startedAt: '2024-11-30T11:20:00Z',
            durationSec: 1560,
            completed: true,
            respondentId: 'david.kim@company.com',
            channel: agentData.channel
          },
          {
            id: 'int-20241129-005',
            agentId: agentId,
            startedAt: '2024-11-29T13:00:00Z',
            durationSec: 720,
            completed: false,
            respondentId: 'lisa.wang@company.com',
            channel: agentData.channel
          }
        ];
        
        setInterviews(mockInterviews);
        setStats(statsData);
      } else {
        navigate('/app/agents');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load agent analytics.',
        variant: 'destructive',
      });
      navigate('/app/agents');
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = searchQuery === '' || 
      interview.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.respondentId?.toLowerCase().includes(searchQuery.toLowerCase());
    
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
      title: `${agent.name} - Interview Analysis Report`,
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
        revenue: completedInterviews.length * agent.pricePerInterviewUsd,
        avgDuration: formatDuration(stats?.averageDuration || 0),
        topTopics: topicsDiscussed.slice(0, 3)
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
• Focus on peak performance hours (${completionByHour.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'})
• Consider expanding successful topic areas
    `.trim();

    // In a real implementation, this would generate an actual PowerPoint file
    // For now, we'll show the content and simulate download
    const blob = new Blob([pptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}_Interview_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'PPT Report Generated',
      description: `Interview analysis report for ${agent.name} has been downloaded.`,
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

  // Mock data for charts
  const completionByHour = [
    { name: '09:00', value: 8 },
    { name: '10:00', value: 12 },
    { name: '11:00', value: 15 },
    { name: '14:00', value: 22 },
    { name: '15:00', value: 18 },
    { name: '16:00', value: 14 },
  ];

  const topicsDiscussed = [
    { name: 'Product Features', value: 45 },
    { name: 'Pricing', value: 32 },
    { name: 'Support', value: 28 },
    { name: 'Competition', value: 22 },
    { name: 'Future Needs', value: 18 },
  ];

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center">
          <CardTitle className="mb-2">Agent not found</CardTitle>
          <CardDescription className="mb-6">
            The requested agent could not be found.
          </CardDescription>
          <Link to="/app/agents">
            <Button>Back to Agents</Button>
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
          <Button variant="ghost" onClick={() => navigate(`/app/agents/${agent.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agent
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Analytics: {agent.name}</h1>
            <p className="text-muted-foreground">
              Insights and performance metrics for your agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={generatePPTReport}>
            <FileSliders className="h-4 w-4 mr-2" />
            Generate PPT Report
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(stats?.completedInterviews || 0) * agent.pricePerInterviewUsd}
                </div>
                <p className="text-xs text-muted-foreground">
                  From completed interviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion by Hour</CardTitle>
                <CardDescription>When interviews are most successful</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={completionByHour} title="" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Discussion Topics</CardTitle>
                <CardDescription>Most frequently mentioned themes</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={topicsDiscussed} title="" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transcripts Tab */}
        <TabsContent value="transcripts" className="space-y-4">
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
                  <TableHead>Respondent</TableHead>
                  <TableHead>Actions</TableHead>
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
                        {interview.respondentId || 'Anonymous'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTranscript(interview)}
                          disabled={!interview.completed}
                        >
                          View Transcript
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* Ask a Question */}
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>
                Generate custom insights from your interview data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={insightQuery}
                  onChange={(e) => setInsightQuery(e.target.value)}
                  placeholder="e.g., What are the main pain points mentioned by users?"
                  className="flex-1"
                />
                <Button disabled={!insightQuery.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Ask
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Try asking about sentiment, topics, user feedback, or specific themes
              </div>
            </CardContent>
          </Card>

          {/* Predefined Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Overall emotional tone of interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Positive</span>
                    <Badge className="bg-success/10 text-success border-success/20">68%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Neutral</span>
                    <Badge variant="secondary">22%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Negative</span>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">10%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Themes</CardTitle>
                <CardDescription>Most discussed topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge>Product Quality</Badge>
                  <Badge>Customer Service</Badge>
                  <Badge>Pricing Concerns</Badge>
                  <Badge>Feature Requests</Badge>
                  <Badge>User Experience</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drop-off Points</CardTitle>
                <CardDescription>Where interviews commonly end early</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">Question 3 (Demographics)</div>
                    <div className="text-muted-foreground">15% drop-off rate</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Question 7 (Pricing)</div>
                    <div className="text-muted-foreground">8% drop-off rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>AI-generated suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                    <div>Reduce demographics questions to improve completion rate</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                    <div>Schedule more interviews during 2-4 PM for better engagement</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                    <div>Follow up on pricing concerns with targeted questions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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