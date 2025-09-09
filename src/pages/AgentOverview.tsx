import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AgentStatusBadge } from '@/components/AgentStatusBadge';
import { 
  ArrowLeft,
  Edit,
  Play,
  Pause,
  BarChart3,
  Share,
  Copy,
  Phone,
  MessageCircle,
  Users,
  Calendar,
  Zap,
  Rocket,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Agent } from '@/types';
import { agentsService } from '@/services/agents';
import { useToast } from '@/hooks/use-toast';

export default function AgentOverview() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [caseCode, setCaseCode] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (agentId) {
      loadAgent();
      loadStats();
    }
  }, [agentId]);

  const loadAgent = async () => {
    if (!agentId) return;
    
    try {
      const data = await agentsService.getAgent(agentId);
      if (data) {
        setAgent(data);
      } else {
        navigate('/app/agents');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load agent details.',
        variant: 'destructive',
      });
      navigate('/app/agents');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!agentId) return;
    
    try {
      const data = await agentsService.getAgentStats(agentId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!agent) return;
    
    try {
      const updatedAgent = await agentsService.toggleAgentStatus(agent.id);
      setAgent(updatedAgent);
      
      toast({
        title: 'Success',
        description: `Agent ${updatedAgent.status === 'live' ? 'resumed' : 'paused'} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update agent status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeploy = async () => {
    if (!agent || !caseCode.trim()) return;
    
    setIsDeploying(true);
    try {
      await agentsService.deployAgent(agent.id, caseCode);
      setAgent(prev => prev ? { ...prev, status: 'live' } : null);
      setDeployDialogOpen(false);
      setCaseCode('');
      
      toast({
        title: 'Success',
        description: 'Agent deployed successfully and is now live!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deploy agent.',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard.`,
    });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/app/agents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <AgentStatusBadge status={agent.status} />
              <Badge variant="outline">
                {agent.archetype.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {agent.language.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          {agent.status === 'ready_to_test' && (
            <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Deploy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy Agent</DialogTitle>
                  <DialogDescription>
                    Enter your BCG case code to deploy this agent to production.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="case-code">Case Code *</Label>
                    <Input
                      id="case-code"
                      value={caseCode}
                      onChange={(e) => setCaseCode(e.target.value)}
                      placeholder="e.g., BCG-LUMEN-2024-001"
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeployDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeploy}
                    disabled={!caseCode.trim() || isDeploying}
                  >
                    {isDeploying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy to Production
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {(agent.status === 'live' || agent.status === 'paused') && (
            <Button
              variant={agent.status === 'live' ? 'outline' : 'default'}
              size="sm"
              onClick={handleToggleStatus}
            >
              {agent.status === 'live' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          )}
          
          <Link to={`/app/agents/${agent.id}/analyze`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </Link>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {agent.channel === 'chat' ? (
                  <MessageCircle className="h-5 w-5" />
                ) : (
                  <Phone className="h-5 w-5" />
                )}
                Contact Information
              </CardTitle>
              <CardDescription>
                How participants access your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent.credentialsReady ? (
                <>
                  {agent.contact.phoneNumber && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Phone Number</Label>
                        <p className="text-lg font-mono">{agent.contact.phoneNumber}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(agent.contact.phoneNumber!, 'Phone number')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {agent.contact.chatUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1 min-w-0">
                          <Label className="text-sm font-medium">Chat URL</Label>
                          <p className="text-sm font-mono truncate">{agent.contact.chatUrl}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(agent.contact.chatUrl!, 'Chat URL')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(agent.contact.chatUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {agent.contact.chatPassword && (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Password</Label>
                            <p className="text-lg font-mono">{agent.contact.chatPassword}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(agent.contact.chatPassword!, 'Password')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Generating contact credentials...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Key events in your agent's lifecycle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Agent Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(agent.createdAt)}
                    </p>
                  </div>
                </div>
                
                {agent.credentialsReady && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Contact Info Generated</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.channel === 'chat' ? 'Chat URL' : 'Phone number'} provisioned
                      </p>
                    </div>
                  </div>
                )}
                
                {agent.status === 'live' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Deployed to Production</p>
                      <p className="text-sm text-muted-foreground">
                        Agent is now accepting interviews
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{agent.interviewsCount}</div>
                  <div className="text-xs text-muted-foreground">Total Interviews</div>
                </div>
                
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">${agent.pricePerInterviewUsd}</div>
                  <div className="text-xs text-muted-foreground">Per Interview</div>
                </div>
              </div>
              
              {stats && (
                <>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-success">{stats.last7Days}</div>
                    <div className="text-xs text-muted-foreground">Last 7 Days</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-info">
                      {Math.round(stats.completionRate * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Completion Rate</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Channel</span>
                <span className="text-sm capitalize">
                  {agent.channel.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="text-sm">{agent.language.toUpperCase()}</span>
              </div>
              
              {agent.voiceId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Voice</span>
                  <span className="text-sm">{agent.voiceId}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(agent.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/app/agents/${agent.id}/analyze`} className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Share Access
              </Button>
              
              <Button variant="outline" className="w-full justify-start gap-2">
                <Zap className="h-4 w-4" />
                Test Agent
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}