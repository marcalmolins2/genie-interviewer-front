import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stepper } from '@/components/Stepper';
import { ArchetypeCard } from '@/components/ArchetypeCard';
import { ChannelSelector } from '@/components/ChannelSelector';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText, 
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { ARCHETYPES, Channel, Archetype, PRICE_BY_CHANNEL, GuideSchema } from '@/types';
import { agentsService } from '@/services/agents';
import { useToast } from '@/hooks/use-toast';
import { InterviewGuideEditor } from '@/components/InterviewGuideEditor';

interface CreateAgentForm {
  name: string;
  archetype: Archetype | null;
  language: string;
  voiceId: string;
  channel: Channel;
  interviewGuide: string;
  guideStructured: GuideSchema | null;
  knowledgeText: string;
  knowledgeFiles: File[];
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const voices = [
  { value: 'voice-1', label: 'Sarah (Professional)' },
  { value: 'voice-2', label: 'David (Conversational)' },
  { value: 'voice-3', label: 'Emma (Friendly)' },
  { value: 'voice-4', label: 'James (Authoritative)' },
];

const steps = [
  { id: 'archetype', title: 'Choose Archetype', description: 'Select interview type' },
  { id: 'configure', title: 'Configure', description: 'Set up details and content' },
  { id: 'channel', title: 'Channel & Pricing', description: 'Choose contact method' },
  { id: 'review', title: 'Review & Test', description: 'Finalize and test' },
];

export default function CreateAgent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<CreateAgentForm>({
    name: '',
    archetype: null,
    language: 'en',
    voiceId: 'voice-1',
    channel: 'chat',
    interviewGuide: '',
    guideStructured: null,
    knowledgeText: '',
    knowledgeFiles: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateForm = (updates: Partial<CreateAgentForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Archetype
        return form.archetype !== null;
      case 1: // Configure
        return form.name.trim().length >= 3 && 
               (form.guideStructured !== null || form.interviewGuide.trim().length >= 10) &&
               (form.knowledgeText.trim().length > 0 || form.knowledgeFiles.length > 0);
      case 2: // Channel
        return true; // Channel has default value
      case 3: // Review
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
      return validTypes.some(type => file.name.toLowerCase().endsWith(type));
    });
    
    updateForm({ knowledgeFiles: [...form.knowledgeFiles, ...validFiles] });
    
    if (validFiles.length !== files.length) {
      toast({
        title: 'Invalid files',
        description: 'Only PDF, DOC, DOCX, PPT, and PPTX files are allowed.',
        variant: 'destructive',
      });
    }
  };

  const removeFile = (index: number) => {
    updateForm({
      knowledgeFiles: form.knowledgeFiles.filter((_, i) => i !== index)
    });
  };

  const createAgent = async () => {
    if (!form.archetype) return;
    
    setIsCreating(true);
    try {
      const agent = await agentsService.createAgent({
        name: form.name,
        archetype: form.archetype,
        language: form.language,
        voiceId: form.voiceId,
        channel: form.channel,
      });

      // Provision contact info
      await agentsService.provisionContact(agent.id);

      toast({
        title: 'Success!',
        description: 'Your agent has been created and is ready to test.',
      });

      navigate(`/app/agents/${agent.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create agent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Archetype Selection
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Your Interview Archetype</h2>
              <p className="text-muted-foreground">
                Select the type of interview that best matches your research goals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ARCHETYPES.map((archetype) => (
                <ArchetypeCard
                  key={archetype.id}
                  archetype={archetype}
                  selected={form.archetype === archetype.id}
                  onSelect={() => updateForm({ archetype: archetype.id })}
                />
              ))}
            </div>
          </div>
        );

      case 1: // Configuration
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Configure Your Agent</h2>
              <p className="text-muted-foreground">
                Set up the details, interview guide, and knowledge base for your agent.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agent Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Agent Details</CardTitle>
                  <CardDescription>Basic information about your agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Agent Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => updateForm({ name: e.target.value })}
                      placeholder="e.g., EU Battery Expert Deep-Dive"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={form.language} onValueChange={(value) => updateForm({ language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="voice">Voice (for calls)</Label>
                    <Select value={form.voiceId} onValueChange={(value) => updateForm({ voiceId: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.value} value={voice.value}>
                            {voice.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Interview Guide */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Interview Guide *</CardTitle>
                  <CardDescription>Design the conversation structure and questions for your agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <InterviewGuideEditor
                    guide={form.guideStructured}
                    onChange={(guide) => {
                      updateForm({ 
                        guideStructured: guide,
                        interviewGuide: guide.intro + '\n\n' + 
                          'Objectives:\n' + guide.objectives.map(obj => `- ${obj}`).join('\n') + '\n\n' +
                          guide.sections.map(section => 
                            `## ${section.title}\n` + 
                            section.questions.map((q, idx) => `${idx + 1}. ${q.prompt}`).join('\n')
                          ).join('\n\n') + '\n\n' + guide.closing
                      });
                    }}
                  />
                </CardContent>
              </Card>

              {/* Knowledge Base */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>Provide context and information for your agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Text Knowledge */}
                  <div>
                    <Label htmlFor="knowledge-text">Background Information</Label>
                    <Textarea
                      id="knowledge-text"
                      value={form.knowledgeText}
                      onChange={(e) => updateForm({ knowledgeText: e.target.value })}
                      placeholder="Enter background information, context, or specific knowledge your agent should have..."
                      className="min-h-[120px] mt-1"
                    />
                  </div>

                  {/* File Uploads */}
                  <div>
                    <Label>Document Upload</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 cursor-pointer transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload documents
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, DOC, DOCX, PPT, PPTX
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* File List */}
                    {form.knowledgeFiles.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {form.knowledgeFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(file.size / 1024)}KB
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2: // Channel & Pricing
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Contact Method & Pricing</h2>
              <p className="text-muted-foreground">
                Select how participants will interact with your agent.
              </p>
            </div>

            <ChannelSelector
              value={form.channel}
              onChange={(channel) => updateForm({ channel })}
            />

            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
                <CardDescription>Usage-based pricing with no setup fees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-lg">
                  <span>Price per completed interview:</span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    ${PRICE_BY_CHANNEL[form.channel]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3: // Review & Test
        const archetype = ARCHETYPES.find(a => a.id === form.archetype);
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Create Agent</h2>
              <p className="text-muted-foreground">
                Review your configuration and create your agent.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Agent Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{form.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Archetype</Label>
                    <p className="font-medium">{archetype?.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Language</Label>
                    <p className="font-medium">
                      {languages.find(l => l.value === form.language)?.label}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Channel</Label>
                    <p className="font-medium capitalize">
                      {form.channel.replace('_', ' ')} (${PRICE_BY_CHANNEL[form.channel]}/interview)
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Interview Guide</Label>
                  {form.guideStructured ? (
                    <div className="text-sm bg-muted p-3 rounded mt-1 space-y-2">
                      <p><strong>Introduction:</strong> {form.guideStructured.intro.substring(0, 100)}...</p>
                      <p><strong>Objectives:</strong> {form.guideStructured.objectives.length} defined</p>
                      <p><strong>Sections:</strong> {form.guideStructured.sections.length} question sections</p>
                    </div>
                  ) : (
                    <p className="text-sm bg-muted p-3 rounded mt-1 text-muted-foreground">
                      No structured guide configured yet
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground">Knowledge Base</Label>
                  <div className="space-y-2 mt-1">
                    {form.knowledgeText && (
                      <p className="text-sm">✓ Background information provided</p>
                    )}
                    {form.knowledgeFiles.length > 0 && (
                      <p className="text-sm">✓ {form.knowledgeFiles.length} document(s) uploaded</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-4 bg-info/10 border border-info/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-info" />
              <p className="text-sm">
                After creation, your agent will be in "Ready to Test" status. 
                Contact credentials will be generated automatically.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/app/agents')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Agent</h1>
          <p className="text-muted-foreground">Set up a new AI interview agent</p>
        </div>
      </div>

      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

      {/* Step Content */}
      <div className="mb-8 pb-24">
        {renderStepContent()}
      </div>

      {/* Floating Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between py-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={createAgent}
                  disabled={!validateStep(currentStep) || isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Agent
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}