import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChannelSelector } from '@/components/ChannelSelector';
import { AgentStatusBadge } from '@/components/AgentStatusBadge';
import { 
  ArrowLeft,
  Save,
  FileText,
  Brain,
  File,
  Plus,
  X,
  Upload,
  Trash2
} from 'lucide-react';
import { Agent, InterviewGuide, KnowledgeAsset, Channel, PRICE_BY_CHANNEL } from '@/types';
import { agentsService } from '@/services/agents';
import { useToast } from '@/hooks/use-toast';
import { InterviewGuideEditor } from '@/components/InterviewGuideEditor';

export default function EditAgent() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [guide, setGuide] = useState<InterviewGuide | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    voiceId: '',
    channel: 'chat' as Channel,
    guideText: '',
    textKnowledge: '',
    newTextAssetTitle: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (agentId) {
      loadAgentData();
    }
  }, [agentId]);

  const loadAgentData = async () => {
    if (!agentId) return;
    
    try {
      const [agentData, guideData, knowledgeData] = await Promise.all([
        agentsService.getAgent(agentId),
        agentsService.getAgentGuide(agentId),
        agentsService.getAgentKnowledge(agentId)
      ]);
      
      if (!agentData) {
        navigate('/app/agents');
        return;
      }

      // Block editing for archived interviewers
      if (agentData.status === 'archived') {
        toast({
          title: 'Cannot Edit',
          description: 'Archived interviewers cannot be edited. Unarchive first to make changes.',
          variant: 'destructive',
        });
        navigate(`/app/agents/${agentId}`);
        return;
      }
      
      setAgent(agentData);
      setGuide(guideData);
      setKnowledge(knowledgeData);
      
      // Populate form
      setFormData({
        name: agentData.name,
        language: agentData.language,
        voiceId: agentData.voiceId || '',
        channel: agentData.channel,
        guideText: guideData?.rawText || '',
        textKnowledge: '',
        newTextAssetTitle: ''
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load interviewer data.',
        variant: 'destructive',
      });
      navigate('/app/agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!agent || !agentId) return;
    
    setSaving(true);
    try {
      const updatedAgent: Partial<Agent> = {
        name: formData.name,
        language: formData.language,
        voiceId: formData.voiceId || undefined,
        channel: formData.channel,
        pricePerInterviewUsd: PRICE_BY_CHANNEL[formData.channel]
      };
      
      await agentsService.updateAgent(agentId, updatedAgent);
      
      if (formData.guideText !== (guide?.rawText || '')) {
        const guideData = guide?.structured || null;
        await agentsService.updateAgentGuide(agentId, formData.guideText, guideData);
      }
      
      toast({
        title: 'Success',
        description: 'Agent updated successfully.',
      });
      
      navigate(`/app/agents/${agentId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update agent.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addTextKnowledge = async () => {
    if (!agentId || !formData.newTextAssetTitle.trim() || !formData.textKnowledge.trim()) return;
    
    try {
      const newAsset = await agentsService.addKnowledgeAsset(agentId, {
        title: formData.newTextAssetTitle,
        type: 'text',
        contentText: formData.textKnowledge
      });
      
      setKnowledge(prev => [...prev, newAsset]);
      setFormData(prev => ({ 
        ...prev, 
        textKnowledge: '', 
        newTextAssetTitle: '' 
      }));
      
      toast({
        title: 'Success',
        description: 'Knowledge asset added.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add knowledge asset.',
        variant: 'destructive',
      });
    }
  };

  const removeKnowledgeAsset = async (assetId: string) => {
    try {
      await agentsService.removeKnowledgeAsset(assetId);
      setKnowledge(prev => prev.filter(asset => asset.id !== assetId));
      
      toast({
        title: 'Success',
        description: 'Knowledge asset removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove knowledge asset.',
        variant: 'destructive',
      });
    }
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

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/app/agents/${agentId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Agent</h1>
            <div className="flex items-center gap-2 mt-1">
              <AgentStatusBadge status={agent.status} />
              <Badge variant="outline">{agent.archetype.replace('_', ' ')}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to={`/app/agents/${agentId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the agent's core configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter agent name"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language *</Label>
                <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md z-50">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="voice">Voice (for calls)</Label>
                <Select value={formData.voiceId} onValueChange={(value) => setFormData(prev => ({ ...prev, voiceId: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md z-50">
                    <SelectItem value="voice-1">Professional Female</SelectItem>
                    <SelectItem value="voice-2">Professional Male</SelectItem>
                    <SelectItem value="voice-3">Friendly Female</SelectItem>
                    <SelectItem value="voice-4">Friendly Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Configuration</CardTitle>
            <CardDescription>How participants will access this agent</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelSelector
              value={formData.channel}
              onChange={(channel) => setFormData(prev => ({ ...prev, channel }))}
            />
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">
                Price per interview: ${PRICE_BY_CHANNEL[formData.channel]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interview Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Interview Guide
            </CardTitle>
            <CardDescription>Define the conversation structure and questions</CardDescription>
          </CardHeader>
          <CardContent>
            <InterviewGuideEditor
              guide={guide?.structured || null}
              onChange={(newGuide) => {
                setFormData(prev => ({ 
                  ...prev, 
                  guideText: newGuide.intro + '\n\n' + 
                    'Objectives:\n' + newGuide.objectives.map(obj => `- ${obj}`).join('\n') + '\n\n' +
                    newGuide.sections.map(section => 
                      `## ${section.title}\n` + 
                      section.questions.map((q, idx) => `${idx + 1}. ${q.prompt}`).join('\n')
                    ).join('\n\n') + '\n\n' + newGuide.closing
                }));
                // Also update guide state for immediate preview
                setGuide(prev => prev ? { 
                  ...prev, 
                  structured: newGuide,
                  validation: { complete: true, issues: [] }
                } : {
                  id: `guide-${Date.now()}`,
                  agentId: agentId!,
                  structured: newGuide,
                  validation: { complete: true, issues: [] }
                });
              }}
            />
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Knowledge Base
            </CardTitle>
            <CardDescription>Manage information and resources for the agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Knowledge Assets */}
            <div>
              <Label className="text-sm font-medium">Current Knowledge Assets</Label>
              <div className="mt-2 space-y-2">
                {knowledge.length > 0 ? (
                  knowledge.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {asset.type === 'file' ? (
                          <File className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{asset.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {asset.type === 'file' && asset.fileName ? (
                              <span>{asset.fileName} • {Math.round((asset.fileSize || 0) / 1024)} KB</span>
                            ) : (
                              'Text content'
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeKnowledgeAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No knowledge assets configured</p>
                )}
              </div>
            </div>

            {/* Add New Text Knowledge */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Add Text Knowledge</Label>
              <div className="mt-2 space-y-3">
                <Input
                  value={formData.newTextAssetTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, newTextAssetTitle: e.target.value }))}
                  placeholder="Asset title"
                />
                <Textarea
                  value={formData.textKnowledge}
                  onChange={(e) => setFormData(prev => ({ ...prev, textKnowledge: e.target.value }))}
                  placeholder="Enter text content..."
                  className="min-h-[100px]"
                />
                <Button
                  onClick={addTextKnowledge}
                  disabled={!formData.newTextAssetTitle.trim() || !formData.textKnowledge.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text Asset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
