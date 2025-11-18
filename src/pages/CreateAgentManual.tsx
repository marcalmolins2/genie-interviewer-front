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
import { ArrowLeft, ArrowRight, Upload, FileText, X, Check, AlertCircle, Edit } from 'lucide-react';
import { ARCHETYPES, Channel, Archetype, PRICE_BY_CHANNEL, GuideSchema } from '@/types';
import { agentsService } from '@/services/agents';
import { useToast } from '@/hooks/use-toast';
import { InterviewGuideEditor } from '@/components/InterviewGuideEditor';

interface CreateAgentForm {
  projectTitle: string;
  projectDescription: string;
  engagementType: string;
  name: string;
  archetype: Archetype | null;
  language: string;
  voiceId: string;
  channel: Channel;
  interviewGuide: string;
  guideStructured: GuideSchema | null;
  knowledgeText: string;
  knowledgeFiles: File[];
  introContext: string;
  closeContext: string;
  caseCode: string;
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

const engagementTypes = [
  { value: 'client-work', label: 'Client Work' },
  { value: 'internal', label: 'Internal' },
  { value: 'research', label: 'Research' },
];

const steps = [
  { id: 'project', title: 'Project details', description: 'Basic information' },
  { id: 'interviewer', title: 'Configure interviewer', description: 'Archetype and voice' },
  { id: 'content', title: 'Interview Content', description: 'Guide and knowledge' },
  { id: 'review', title: 'Review', description: 'Summary' },
  { id: 'test', title: 'Test', description: 'Try before deploying' },
  { id: 'deploy', title: 'Deploy', description: 'Generate number' },
];

export default function CreateAgent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<CreateAgentForm>({
    projectTitle: '',
    projectDescription: '',
    engagementType: 'client-work',
    name: '',
    archetype: null,
    language: 'en',
    voiceId: 'voice-1',
    channel: 'inbound_call',
    interviewGuide: '',
    guideStructured: null,
    knowledgeText: '',
    knowledgeFiles: [],
    introContext: '',
    closeContext: '',
    caseCode: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateForm = (updates: Partial<CreateAgentForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: return form.projectTitle.trim().length >= 3 && form.projectDescription.trim().length >= 10;
      case 1: return form.archetype !== null && form.name.trim().length >= 3;
      case 2: return (form.guideStructured !== null || form.interviewGuide.trim().length >= 10) &&
                     (form.knowledgeText.trim().length > 0 || form.knowledgeFiles.length > 0);
      case 3: return true;
      case 4: return true;
      case 5: return form.caseCode.trim().length > 0;
      default: return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      ['.pdf', '.doc', '.docx', '.ppt', '.pptx'].some(type => file.name.toLowerCase().endsWith(type))
    );
    updateForm({ knowledgeFiles: [...form.knowledgeFiles, ...validFiles] });
  };

  const removeFile = (index: number) => {
    updateForm({ knowledgeFiles: form.knowledgeFiles.filter((_, i) => i !== index) });
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
      await agentsService.provisionContact(agent.id);
      toast({ title: 'Success!', description: 'Your agent has been created and is ready to test.' });
      navigate(`/app/agents/${agent.id}`);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create agent. Please try again.', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Project Details</h2>
              <p className="text-muted-foreground">Provide basic information about your interview project.</p>
            </div>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input id="projectTitle" value={form.projectTitle} onChange={(e) => updateForm({ projectTitle: e.target.value })} placeholder="e.g., EU Battery Market Research 2024" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="projectDescription">Project Description *</Label>
                  <Textarea id="projectDescription" value={form.projectDescription} onChange={(e) => updateForm({ projectDescription: e.target.value })} placeholder="Describe the purpose and scope of this project..." className="mt-1 min-h-[100px]" />
                </div>
                <div>
                  <Label htmlFor="engagementType">Engagement Type</Label>
                  <Select value={form.engagementType} onValueChange={(value) => updateForm({ engagementType: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {engagementTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Configure Interviewer</h2>
              <p className="text-muted-foreground">Select the interview archetype and configure the agent's voice and language.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Choose Archetype *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ARCHETYPES.map((archetype) => (
                  <ArchetypeCard key={archetype.id} archetype={archetype} selected={form.archetype === archetype.id} onSelect={() => updateForm({ archetype: archetype.id })} />
                ))}
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>Configure the agent's name, language, and voice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => updateForm({ name: e.target.value })} placeholder="e.g., Sam" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={form.language} onValueChange={(value) => updateForm({ language: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (<SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="voice">Voice (for calls)</Label>
                  <Select value={form.voiceId} onValueChange={(value) => updateForm({ voiceId: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (<SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Interview Content</h2>
              <p className="text-muted-foreground">Configure the interview guide and knowledge base.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Context Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="introContext">Intro Context</Label>
                  <Textarea id="introContext" value={form.introContext} onChange={(e) => updateForm({ introContext: e.target.value })} placeholder="Introduction context..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="closeContext">Close Context</Label>
                  <Textarea id="closeContext" value={form.closeContext} onChange={(e) => updateForm({ closeContext: e.target.value })} placeholder="Closing context..." className="mt-1" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Interview Guide *</CardTitle>
              </CardHeader>
              <CardContent>
                <InterviewGuideEditor guide={form.guideStructured} onChange={(guide) => updateForm({ guideStructured: guide })} />
                <div className="mt-4">
                  <Label htmlFor="interviewGuide">Or paste a text guide</Label>
                  <Textarea id="interviewGuide" value={form.interviewGuide} onChange={(e) => updateForm({ interviewGuide: e.target.value })} placeholder="Paste your interview guide..." className="mt-1 min-h-[150px]" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="knowledgeText">Text Knowledge</Label>
                  <Textarea id="knowledgeText" value={form.knowledgeText} onChange={(e) => updateForm({ knowledgeText: e.target.value })} placeholder="Add background information..." className="mt-1 min-h-[120px]" />
                </div>
                <div>
                  <Label>Upload Files</Label>
                  <div className="mt-2">
                    <Button variant="outline" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                        <input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </Button>
                  </div>
                  {form.knowledgeFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {form.knowledgeFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        const archetype = ARCHETYPES.find(a => a.id === form.archetype);
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Configuration</h2>
              <p className="text-muted-foreground">Review all details before testing.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Project Title</Label>
                  <p className="font-medium">{form.projectTitle}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Project Description</Label>
                  <p className="font-medium">{form.projectDescription}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Engagement Type</Label>
                  <p className="font-medium">{form.engagementType}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interviewer Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Archetype</Label>
                  <p className="font-medium">{archetype?.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Agent Name</Label>
                  <p className="font-medium">{form.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Language</Label>
                  <p className="font-medium">{languages.find(l => l.value === form.language)?.label}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Voice</Label>
                  <p className="font-medium">{voices.find(v => v.value === form.voiceId)?.label}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Intro Context</Label>
                  <p className="font-medium">{form.introContext}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Close Context</Label>
                  <p className="font-medium">{form.closeContext}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Interview Guide</Label>
                  <p className="font-medium">{form.interviewGuide.substring(0, 100)}...</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Knowledge Base</Label>
                  <p className="font-medium">{form.knowledgeText.substring(0, 100)}...</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Uploaded Files</Label>
                  <ul className="list-disc pl-4">
                    {form.knowledgeFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Test Your Configuration</h2>
              <p className="text-muted-foreground">Try out your agent before launching.</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="bg-muted/50 p-8 rounded-lg border text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Test Interface Coming Soon</p>
                  <p className="text-sm text-muted-foreground">For now, proceed to deploy and test from the agent overview page.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Deploy Your Agent</h2>
              <p className="text-muted-foreground">Select the medium and generate your phone number.</p>
            </div>
            <Card>
              <CardHeader><CardTitle>Select Channel</CardTitle></CardHeader>
              <CardContent>
                <ChannelSelector value={form.channel} onChange={(channel) => updateForm({ channel })} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg border text-center">
                  <p className="text-3xl font-bold">${PRICE_BY_CHANNEL[form.channel]}</p>
                  <p className="text-sm text-muted-foreground mt-1">per interview</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="caseCode">Case Code *</Label>
                  <Input id="caseCode" value={form.caseCode} onChange={(e) => updateForm({ caseCode: e.target.value })} placeholder="e.g., BCG-2024-0001" className="mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Create New Agent</h1>
          <p className="text-muted-foreground mt-1">Follow the steps to configure and deploy your interview agent</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>
      <div className="container mx-auto px-4 pb-32">{renderStepContent()}</div>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />Previous
          </Button>
          <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</div>
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} disabled={!validateStep(currentStep)}>Next<ArrowRight className="h-4 w-4 ml-2" /></Button>
          ) : (
            <Button onClick={createAgent} disabled={!validateStep(currentStep) || isCreating}>
              {isCreating ? 'Creating...' : 'Generate Phone Number'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
