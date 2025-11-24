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
import { Switch } from '@/components/ui/switch';
import { ARCHETYPES, Channel, Archetype, PRICE_BY_CHANNEL, GuideSchema } from '@/types';
import { agentsService } from '@/services/agents';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/RichTextEditor';


interface CreateAgentForm {
  projectTitle: string;
  projectDescription: string;
  engagementType: string;
  name: string;
  archetype: Archetype | null;
  language: string;
  voiceId: string;
  channel: Channel;
  targetDuration: string;
  introContext: string;
  enableScreener: boolean;
  screenerQuestions: string;
  introductionQuestions: string;
  interviewGuide: string;
  guideStructured: GuideSchema | null;
  closeContext: string;
  knowledgeText: string;
  knowledgeFiles: File[];
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
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [form, setForm] = useState<CreateAgentForm>({
    projectTitle: '',
    projectDescription: '',
    engagementType: 'client-work',
    name: '',
    archetype: null,
    language: 'en',
    voiceId: 'voice-1',
    channel: 'inbound_call',
    targetDuration: '20',
    introContext: '',
    enableScreener: false,
    screenerQuestions: '',
    introductionQuestions: '',
    interviewGuide: '',
    guideStructured: null,
    closeContext: '',
    knowledgeText: '',
    knowledgeFiles: [],
    caseCode: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateForm = (updates: Partial<CreateAgentForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: return form.projectTitle.trim().length >= 3 && form.projectDescription.trim().length >= 10;
      case 1: return form.archetype !== null && form.name.trim().length >= 3;
      case 2: return form.interviewGuide.trim().length >= 10;
      case 3: return true;
      case 4: return true;
      case 5: return form.caseCode.trim().length > 0;
      default: return true;
    }
  };

  const getValidationMessage = (step: number): string => {
    const missingFields: string[] = [];
    
    switch (step) {
      case 0:
        if (form.projectTitle.trim().length < 3) missingFields.push('Project Title (min 3 characters)');
        if (form.projectDescription.trim().length < 10) missingFields.push('Project Description (min 10 characters)');
        break;
      case 1:
        if (!form.archetype) missingFields.push('Archetype');
        if (form.name.trim().length < 3) missingFields.push('Agent Name (min 3 characters)');
        break;
      case 2:
        if (!form.guideStructured && form.interviewGuide.trim().length < 10) {
          missingFields.push('Interview Guide (min 10 characters)');
        }
        if (form.knowledgeText.trim().length === 0 && form.knowledgeFiles.length === 0) {
          missingFields.push('Knowledge Base (add text or files)');
        }
        break;
      case 5:
        if (form.caseCode.trim().length === 0) missingFields.push('Case Code');
        break;
    }
    
    if (missingFields.length === 0) return '';
    return `Required: ${missingFields.join(', ')}`;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
      setShowValidation(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const goToStep = (stepIndex: number) => {
    // Can only go to completed steps or the next uncompleted step
    const maxAllowedStep = Math.max(...completedSteps, 0) + 1;
    if (stepIndex <= maxAllowedStep && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      setShowValidation(false);
    }
  };

  const saveDraft = async () => {
    if (!validateStep(0)) {
      toast({ 
        title: 'Cannot save draft', 
        description: 'Please complete the project details first.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsSavingDraft(true);
    try {
      // Simulate saving draft - in real implementation, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('agent_draft', JSON.stringify({ form, completedSteps, currentStep }));
      toast({ title: 'Draft saved', description: 'Your progress has been saved.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save draft.', variant: 'destructive' });
    } finally {
      setIsSavingDraft(false);
    }
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
              <h2 className="text-2xl font-bold mb-2">Interview Content Configuration</h2>
              <p className="text-muted-foreground">Configure the interview flow, questions, and knowledge base.</p>
            </div>
            
            {/* Target Duration */}
            <Card>
              <CardHeader>
                <CardTitle>Target Interview Duration</CardTitle>
                <CardDescription>
                  Estimated time for completing the interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="targetDuration"
                    value={form.targetDuration}
                    onChange={(e) => updateForm({ targetDuration: e.target.value })}
                    placeholder="20"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </CardContent>
            </Card>

            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
                <CardDescription>
                  Opening message and context. The agent uses this to greet participants, explain the interview purpose, and set expectations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="introContext"
                  value={form.introContext}
                  onChange={(e) => updateForm({ introContext: e.target.value })}
                  placeholder="Example: Thank you for joining us today. This interview will take about 20 minutes. We'll be discussing your experience with our product and gathering feedback to improve our services."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
            
            {/* Enable Screener */}
            <Card>
              <CardHeader>
                <CardTitle>Enable Screener</CardTitle>
                <CardDescription>
                  Pre-qualify participants before the main interview to ensure they meet your criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableScreener"
                    checked={form.enableScreener}
                    onCheckedChange={(checked) => updateForm({ enableScreener: checked })}
                  />
                  <Label htmlFor="enableScreener" className="cursor-pointer">
                    Use screener questions
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Screener Questions (conditional) */}
            {form.enableScreener && (
              <Card>
                <CardHeader>
                  <CardTitle>Screener Questions</CardTitle>
                  <CardDescription>
                    Questions asked at the start to qualify participants. Use these to filter out unqualified respondents before the main interview begins.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={form.screenerQuestions}
                    onChange={(value) => updateForm({ screenerQuestions: value })}
                    placeholder="Example: Are you over 18 years old? Have you used our product in the last 6 months?"
                  />
                </CardContent>
              </Card>
            )}

            {/* Introduction Questions (conditional - only if no screener) */}
            {!form.enableScreener && (
              <Card>
                <CardHeader>
                  <CardTitle>Introduction Questions</CardTitle>
                  <CardDescription>
                    Warm-up questions to build rapport and ease into the interview. These are asked after the introduction when no screener is used.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={form.introductionQuestions}
                    onChange={(value) => updateForm({ introductionQuestions: value })}
                    placeholder="Example: Tell me a bit about yourself and your role. How long have you been in this industry?"
                  />
                </CardContent>
              </Card>
            )}

            {/* Interview Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Guide *</CardTitle>
                <CardDescription>
                  The main body of your interview. Structure your questions in sections to explore your research topics in depth.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={form.interviewGuide}
                  onChange={(value) => updateForm({ interviewGuide: value })}
                  placeholder="Structure your interview in sections with questions..."
                />
              </CardContent>
            </Card>

            {/* Closing Context */}
            <Card>
              <CardHeader>
                <CardTitle>Closing</CardTitle>
                <CardDescription>
                  Final remarks and next steps. Thank participants and explain what happens after the interview concludes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="closeContext"
                  value={form.closeContext}
                  onChange={(e) => updateForm({ closeContext: e.target.value })}
                  placeholder="Example: Thank you for your time and valuable insights. Your feedback will help us improve our product. You'll receive a summary via email within 48 hours, and we may reach out for follow-up questions."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Knowledge Base */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  Background information and documents the agent can reference during the interview to provide context or answer questions (optional).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="knowledgeText">Text Knowledge</Label>
                  <Textarea
                    id="knowledgeText"
                    value={form.knowledgeText}
                    onChange={(e) => updateForm({ knowledgeText: e.target.value })}
                    placeholder="Add background information, product details, company context, etc."
                    className="mt-1 min-h-[120px]"
                  />
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Project Details</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => goToStep(0)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Interviewer Configuration</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => goToStep(1)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Interview Content</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => goToStep(2)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Target Duration</Label>
                  <p className="font-medium">{form.targetDuration} minutes</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Intro Context</Label>
                  <p className="font-medium">{form.introContext || 'Not provided'}</p>
                </div>
                {form.enableScreener && (
                  <div>
                    <Label className="text-muted-foreground">Screener Questions</Label>
                    <p className="font-medium">{form.screenerQuestions.substring(0, 100)}{form.screenerQuestions.length > 100 ? '...' : ''}</p>
                  </div>
                )}
                {!form.enableScreener && form.introductionQuestions && (
                  <div>
                    <Label className="text-muted-foreground">Introduction Questions</Label>
                    <p className="font-medium">{form.introductionQuestions.substring(0, 100)}{form.introductionQuestions.length > 100 ? '...' : ''}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Interview Guide</Label>
                  <p className="font-medium">{form.interviewGuide.substring(0, 100)}{form.interviewGuide.length > 100 ? '...' : ''}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Close Context</Label>
                  <p className="font-medium">{form.closeContext || 'Not provided'}</p>
                </div>
                {(form.knowledgeText || form.knowledgeFiles.length > 0) && (
                  <div>
                    <Label className="text-muted-foreground">Knowledge Base</Label>
                    {form.knowledgeText && (
                      <p className="font-medium">{form.knowledgeText.substring(0, 100)}{form.knowledgeText.length > 100 ? '...' : ''}</p>
                    )}
                    {form.knowledgeFiles.length > 0 && (
                      <ul className="list-disc pl-4 mt-2">
                        {form.knowledgeFiles.map((file, index) => (
                          <li key={index} className="text-sm">{file.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
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
        <Stepper 
          steps={steps} 
          currentStep={currentStep} 
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
      </div>
      <div className="container mx-auto px-4 pb-32">{renderStepContent()}</div>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                <ArrowLeft className="h-4 w-4 mr-2" />Previous
              </Button>
              {completedSteps.includes(0) && (
                <Button 
                  variant="secondary" 
                  onClick={saveDraft} 
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</div>
            <div className="relative">
              {!validateStep(currentStep) && showValidation && getValidationMessage(currentStep) && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                  {getValidationMessage(currentStep)}
                </div>
              )}
              {currentStep < steps.length - 1 ? (
                <div onClick={() => {
                  if (!validateStep(currentStep)) {
                    setShowValidation(true);
                  }
                }}>
                  <Button 
                    onClick={nextStep} 
                    disabled={!validateStep(currentStep)}
                    className={!validateStep(currentStep) ? 'pointer-events-none' : ''}
                  >
                    Next<ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div onClick={() => {
                  if (!validateStep(currentStep) && !isCreating) {
                    setShowValidation(true);
                  }
                }}>
                  <Button 
                    onClick={createAgent} 
                    disabled={!validateStep(currentStep) || isCreating}
                    className={!validateStep(currentStep) || isCreating ? 'pointer-events-none' : ''}
                  >
                    {isCreating ? 'Creating...' : 'Generate Phone Number'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
