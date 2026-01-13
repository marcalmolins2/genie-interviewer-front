import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stepper } from "@/components/Stepper";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { ChannelSelector } from "@/components/ChannelSelector";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Upload, FileText, X, AlertCircle, Edit, FolderOpen, Play, Square, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ARCHETYPES, Channel, Archetype, ExpertSource, PRICE_BY_CHANNEL, GuideSchema, PROJECT_TYPE_LABELS, Project } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { interviewersService, agentsService } from "@/services/interviewers";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ProjectCombobox } from "@/components/ProjectCombobox";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { useProjectContext } from "@/pages/InterviewersLayout";
import { ConfigurationLayout } from "@/components/ConfigurationLayout";
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

interface InterviewerConfigurationProps {
  mode?: 'create' | 'edit';
}

interface CreateInterviewerForm {
  // Step 0: Project Selection
  selectedProjectId: string | null;

  // Step 1: Interviewer Identity & Configuration
  title: string;
  description: string;
  name: string;
  archetype: Archetype | null;
  expertSource: ExpertSource; // Only used when archetype is 'expert_interview'
  language: string;
  voiceId: string;

  // Step 2: Interview Content
  channel: Channel;
  targetDuration: string;
  interviewContext: string;
  introContext: string;
  enableScreener: boolean;
  screenerQuestions: string;
  introductionQuestions: string;
  interviewGuide: string;
  guideStructured: GuideSchema | null;
  closeContext: string;
  knowledgeText: string;
  knowledgeFiles: File[];

  // Step 5: Deploy
  caseCode: string;
}

type FieldErrors = Record<string, string>;

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

const voices = [
  { value: "alloy", label: "Alloy", description: "Neutral, balanced" },
  { value: "ash", label: "Ash", description: "Soft, gentle" },
  { value: "ballad", label: "Ballad", description: "Warm, expressive" },
  { value: "coral", label: "Coral", description: "Clear, articulate" },
  { value: "echo", label: "Echo", description: "Smooth, calm" },
  { value: "sage", label: "Sage", description: "Wise, measured" },
  { value: "shimmer", label: "Shimmer", description: "Bright, energetic" },
  { value: "verse", label: "Verse", description: "Dynamic, engaging" },
];

const steps = [
  { id: "project", title: "Select Project", description: "Choose or create" },
  { id: "interviewer", title: "Configure Interviewer", description: "Identity and archetype" },
  { id: "content", title: "Interview Content", description: "Guide and knowledge" },
  { id: "review", title: "Review", description: "Summary" },
  { id: "test", title: "Test", description: "Try before deploying" },
  { id: "deploy", title: "Deploy", description: "Generate number" },
];

// Validation helper functions
const TITLE_PATTERN = /^[a-zA-Z0-9\s.,\-_'&()]+$/;
const AGENT_NAME_PATTERN = /^[a-zA-Z\s-]*$/;

const validateTitle = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "Interviewer title is required";
  if (trimmed.length < 3) return "Title must be at least 3 characters";
  if (trimmed.length > 80) return "Title must be shorter than 80 characters";
  if (!TITLE_PATTERN.test(trimmed)) return "Title contains invalid characters";
  return "";
};

const validateDescription = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length > 500) return "Description must be shorter than 500 characters";
  return "";
};

const validateAgentName = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return ""; // Optional field
  if (trimmed.length < 2) return "Agent name must be at least 2 characters";
  if (trimmed.length > 20) return "Agent name must be shorter than 20 characters";
  if (!AGENT_NAME_PATTERN.test(trimmed)) return "Agent name can only contain letters, spaces, and dashes";
  return "";
};

const validateTargetDuration = (value: string): string => {
  if (!value.trim()) return "Target interview duration is required";
  const num = Number(value);
  if (isNaN(num)) return "Duration must be a number in minutes";
  if (!Number.isInteger(num)) return "Duration must be a whole number";
  if (num < 3) return "Interviews must be at least 3 minutes";
  if (num > 60) return "Interviews cannot be longer than 60 minutes";
  return "";
};

const validateInterviewContext = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length > 2000) return "Interview context must be shorter than 2000 characters";
  return "";
};

const validateIntroContext = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length > 600) return "Introduction context must be shorter than 600 characters";
  return "";
};

const validateScreenerQuestions = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "Screener / warm-up questions are required";
  if (trimmed.length < 10) return "Screener questions must be at least 10 characters";
  if (trimmed.length > 2000) return "Screener text must be shorter than 2,000 characters";
  return "";
};

const validateIntroductionQuestions = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "Introduction questions are required";
  if (trimmed.length < 10) return "Introduction questions must be at least 10 characters";
  if (trimmed.length > 2000) return "Introduction questions must be shorter than 2,000 characters";
  return "";
};

const validateInterviewGuide = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "Interview guide is required";
  if (trimmed.length > 10000) return "Interview guide must be shorter than 10,000 characters";
  return "";
};

const validateCloseContext = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length > 600) return "Closing context must be shorter than 600 characters";
  return "";
};

const validateKnowledgeText = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length > 10000) return "Knowledge base text must be shorter than 10,000 characters";
  return "";
};

// Character counter component
const CharacterCounter = ({ current, max, error }: { current: number; max: number; error?: string }) => (
  <div className="flex justify-between items-center mt-1">
    <span className="text-xs text-destructive">{error}</span>
    <span className={`text-xs ${current > max ? "text-destructive" : "text-muted-foreground"}`}>
      {current}/{max}
    </span>
  </div>
);

// Inline error component
const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;
  return <p className="text-xs text-destructive mt-1">{error}</p>;
};

export default function InterviewerConfiguration({ mode = 'create' }: InterviewerConfigurationProps) {
  const { selectedProjectId: sidebarProjectId, projects, refreshProjects, isLoadingProjects } = useProjectContext();
  const { interviewerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoadingInterviewer, setIsLoadingInterviewer] = useState(mode === 'edit');
  const [currentStep, setCurrentStep] = useState(mode === 'edit' ? 3 : 0); // Start on Review step in edit mode
  const [completedSteps, setCompletedSteps] = useState<number[]>(mode === 'edit' ? [0, 1, 2] : []);
  const [form, setForm] = useState<CreateInterviewerForm>({
    selectedProjectId: sidebarProjectId,
    title: "",
    description: "",
    name: "",
    archetype: null,
    expertSource: "internal",
    language: "en",
    voiceId: "alloy",
    channel: "inbound_call",
    targetDuration: "20",
    interviewContext: "",
    introContext: "",
    enableScreener: false,
    screenerQuestions: "",
    introductionQuestions: "",
    interviewGuide: "",
    guideStructured: null,
    closeContext: "",
    knowledgeText: "",
    knowledgeFiles: [],
    caseCode: "",
  });
  const [initialForm, setInitialForm] = useState<CreateInterviewerForm | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Load existing interviewer data in edit mode
  useEffect(() => {
    if (mode === 'edit' && interviewerId) {
      loadExistingInterviewer(interviewerId);
    }
  }, [mode, interviewerId]);

  const loadExistingInterviewer = async (id: string) => {
    setIsLoadingInterviewer(true);
    try {
      const [interviewer, guide, knowledge] = await Promise.all([
        agentsService.getAgent(id),
        agentsService.getAgentGuide(id),
        agentsService.getAgentKnowledge(id)
      ]);

      if (!interviewer) {
        toast({ title: "Interviewer not found", variant: "destructive" });
        navigate('/app/interviewers');
        return;
      }

      // Check for archived status
      if (interviewer.status === 'archived') {
        toast({ title: "Cannot edit archived interviewer", variant: "destructive" });
        navigate(`/app/interviewers/${id}`);
        return;
      }

      const textKnowledge = knowledge.find(k => k.type === 'text');

      // Map interviewer data to form fields
      const loadedForm: CreateInterviewerForm = {
        selectedProjectId: interviewer.projectId || sidebarProjectId || null,
        title: interviewer.title || interviewer.name || '',
        description: interviewer.description || '',
        name: interviewer.name || '',
        archetype: interviewer.archetype || null,
        expertSource: (interviewer as any).expertSource || 'internal',
        language: interviewer.language || 'en',
        voiceId: interviewer.voiceId || 'alloy',
        channel: interviewer.channel || 'inbound_call',
        targetDuration: String(interviewer.targetDuration || 20),
        interviewContext: interviewer.interviewContext || '',
        introContext: interviewer.introContext || '',
        enableScreener: interviewer.enableScreener || false,
        screenerQuestions: interviewer.screenerQuestions || '',
        introductionQuestions: interviewer.introductionQuestions || '',
        interviewGuide: guide?.rawText || '',
        guideStructured: guide?.structured || null,
        closeContext: interviewer.closeContext || '',
        knowledgeText: textKnowledge?.contentText || '',
        knowledgeFiles: [], // Can't restore File objects
        caseCode: interviewer.caseCode || '',
      };

      setForm(loadedForm);
      setInitialForm(loadedForm);

      // Mark all content steps as completed
      setCompletedSteps([0, 1, 2]);
      setCurrentStep(3); // Review step

    } catch (error) {
      toast({ title: "Error loading interviewer", variant: "destructive" });
      navigate('/app/interviewers');
    } finally {
      setIsLoadingInterviewer(false);
    }
  };

  // Check if user has made any changes
  const hasUnsavedChanges = useCallback(() => {
    if (mode === 'edit' && initialForm) {
      // Compare current form with initial loaded form
      return JSON.stringify(form) !== JSON.stringify(initialForm);
    }
    return (
      form.title.trim() !== '' ||
      form.description.trim() !== '' ||
      form.name.trim() !== '' ||
      form.archetype !== null ||
      form.interviewContext.trim() !== '' ||
      form.introContext.trim() !== '' ||
      form.screenerQuestions.trim() !== '' ||
      form.introductionQuestions.trim() !== '' ||
      form.interviewGuide.trim() !== '' ||
      form.closeContext.trim() !== '' ||
      form.knowledgeText.trim() !== '' ||
      form.knowledgeFiles.length > 0
    );
  }, [form, mode, initialForm]);

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowCancelDialog(true);
    } else {
      if (mode === 'edit' && interviewerId) {
        navigate(`/app/interviewers/${interviewerId}`);
      } else {
        navigate('/app/interviewers');
      }
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    if (mode === 'edit' && interviewerId) {
      navigate(`/app/interviewers/${interviewerId}`);
    } else {
      navigate('/app/interviewers');
    }
  };

  // Pre-select project from sidebar if not already selected (only in create mode)
  useEffect(() => {
    if (mode === 'create' && sidebarProjectId && !form.selectedProjectId) {
      setForm((prev) => ({ ...prev, selectedProjectId: sidebarProjectId }));
    }
  }, [sidebarProjectId, mode]);

  const selectedProject = projects.find((p) => p.id === form.selectedProjectId);

  const updateForm = (updates: Partial<CreateInterviewerForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const validateField = useCallback((field: string, value: string) => {
    let error = "";
    switch (field) {
      case "title":
        error = validateTitle(value);
        break;
      case "description":
        error = validateDescription(value);
        break;
      case "name":
        error = validateAgentName(value);
        break;
      case "targetDuration":
        error = validateTargetDuration(value);
        break;
      case "interviewContext":
        error = validateInterviewContext(value);
        break;
      case "introContext":
        error = validateIntroContext(value);
        break;
      case "screenerQuestions":
        error = validateScreenerQuestions(value);
        break;
      case "introductionQuestions":
        error = validateIntroductionQuestions(value);
        break;
      case "interviewGuide":
        error = validateInterviewGuide(value);
        break;
      case "closeContext":
        error = validateCloseContext(value);
        break;
      case "knowledgeText":
        error = validateKnowledgeText(value);
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    updateForm({ [field]: value } as Partial<CreateInterviewerForm>);
    validateField(field, value);
  };

  const previewVoice = (voiceId: string) => {
    window.speechSynthesis.cancel();
    
    const voice = voices.find(v => v.value === voiceId);
    const voiceName = voice?.label || voiceId;
    
    const utterance = new SpeechSynthesisUtterance(
      `Hi, I'm ${voiceName}. I'll be conducting your interview today.`
    );
    
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      const englishVoice = availableVoices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
    }
    
    setPreviewingVoice(voiceId);
    
    utterance.onend = () => setPreviewingVoice(null);
    utterance.onerror = () => setPreviewingVoice(null);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopPreview = () => {
    window.speechSynthesis.cancel();
    setPreviewingVoice(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return form.selectedProjectId !== null;
      case 1:
        return (
          !validateTitle(form.title) &&
          !validateDescription(form.description) &&
          form.archetype !== null &&
          !validateAgentName(form.name)
        );
      case 2: {
        const durationValid = !validateTargetDuration(form.targetDuration);
        const interviewContextValid = !validateInterviewContext(form.interviewContext);
        const introContextValid = !validateIntroContext(form.introContext);
        const questionsValid = form.enableScreener
          ? !validateScreenerQuestions(form.screenerQuestions)
          : !validateIntroductionQuestions(form.introductionQuestions);
        const guideValid = !validateInterviewGuide(form.interviewGuide);
        const closeContextValid = !validateCloseContext(form.closeContext);
        const knowledgeValid = !validateKnowledgeText(form.knowledgeText);
        return (
          durationValid &&
          interviewContextValid &&
          introContextValid &&
          questionsValid &&
          guideValid &&
          closeContextValid &&
          knowledgeValid
        );
      }
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return form.caseCode.trim().length > 0;
      default:
        return true;
    }
  };

  const getValidationMessage = (step: number): string => {
    const missingFields: string[] = [];

    switch (step) {
      case 0: {
        if (!form.selectedProjectId) missingFields.push("Please select a project");
        break;
      }
      case 1: {
        const titleError = validateTitle(form.title);
        const descError = validateDescription(form.description);
        if (titleError) missingFields.push(titleError);
        if (descError) missingFields.push(descError);
        if (!form.archetype) missingFields.push("Archetype selection is required");
        const nameError = validateAgentName(form.name);
        if (nameError) missingFields.push(nameError);
        break;
      }
      case 2: {
        const durationError = validateTargetDuration(form.targetDuration);
        if (durationError) missingFields.push(durationError);

        if (form.enableScreener) {
          const screenerError = validateScreenerQuestions(form.screenerQuestions);
          if (screenerError) missingFields.push(screenerError);
        } else {
          const introQError = validateIntroductionQuestions(form.introductionQuestions);
          if (introQError) missingFields.push(introQError);
        }

        const guideError = validateInterviewGuide(form.interviewGuide);
        if (guideError) missingFields.push(guideError);
        break;
      }
      case 5:
        if (form.caseCode.trim().length === 0) missingFields.push("Case Code is required");
        break;
    }

    if (missingFields.length === 0) return "";
    return missingFields[0]; // Show first error
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
      setShowValidation(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (stepIndex: number) => {
    const allPreviousStepsCompleted =
      stepIndex === 3 && completedSteps.includes(0) && completedSteps.includes(1) && completedSteps.includes(2);

    if ((completedSteps.includes(stepIndex) || allPreviousStepsCompleted) && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      setShowValidation(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveDraft = async () => {
    if (!validateStep(0)) {
      toast({
        title: "Cannot save draft",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingDraft(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem("agent_draft", JSON.stringify({ form, completedSteps, currentStep }));
      toast({ title: "Draft saved", description: "Your progress has been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) =>
      [".pdf", ".doc", ".docx", ".ppt", ".pptx"].some((type) => file.name.toLowerCase().endsWith(type)),
    );
    updateForm({ knowledgeFiles: [...form.knowledgeFiles, ...validFiles] });
  };

  const removeFile = (index: number) => {
    updateForm({ knowledgeFiles: form.knowledgeFiles.filter((_, i) => i !== index) });
  };

  const handleProjectCreated = async (projectId: string) => {
    await refreshProjects();
    updateForm({ selectedProjectId: projectId });
  };

  const createInterviewer = async () => {
    if (!form.archetype || !form.selectedProjectId) return;
    setIsCreating(true);
    try {
      const agent = await agentsService.createAgent({
        projectId: form.selectedProjectId,
        name: form.name || form.title,
        title: form.title,
        description: form.description,
        archetype: form.archetype,
        language: form.language,
        voiceId: form.voiceId,
        channel: form.channel,
        targetDurationMin: parseInt(form.targetDuration),
      });
      
      // Update guide if provided
      if (form.interviewGuide) {
        await agentsService.updateAgentGuide(agent.id, { guideContent: form.interviewGuide });
      }
      
      // Add knowledge if provided
      if (form.knowledgeText) {
        await agentsService.addKnowledgeAsset(agent.id, {
          title: 'Knowledge Base',
          type: 'text',
          contentText: form.knowledgeText,
        });
      }
      
      await agentsService.provisionContact(agent.id);
      toast({ title: "Success!", description: "Your interviewer has been created and is ready to test." });
      navigate(`/app/interviewers/${agent.id}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create interviewer. Please try again.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const updateInterviewer = async () => {
    if (!interviewerId || !form.archetype) return;
    setIsCreating(true);
    try {
      await agentsService.updateAgent(interviewerId, {
        name: form.name || form.title,
        title: form.title,
        description: form.description,
        archetype: form.archetype,
        language: form.language,
        voiceId: form.voiceId,
        channel: form.channel,
        targetDurationMin: parseInt(form.targetDuration),
      });
      
      // Update guide
      await agentsService.updateAgentGuide(interviewerId, { guideContent: form.interviewGuide });
      
      toast({ title: "Success!", description: "Interviewer updated successfully." });
      navigate(`/app/interviewers/${interviewerId}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update interviewer.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'edit') {
      await updateInterviewer();
    } else {
      await createInterviewer();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // In edit mode, show project as read-only
        if (mode === 'edit') {
          if (selectedProject) {
            return (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project</h2>
                  <p className="text-muted-foreground">
                    This interviewer belongs to the following project.
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedProject.name}</p>
                        <Badge variant="secondary" className="mt-1">
                          {PROJECT_TYPE_LABELS[selectedProject.projectType]}
                        </Badge>
                        {selectedProject.caseCode && (
                          <p className="text-xs text-muted-foreground mt-1">{selectedProject.caseCode}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          }
          
          // Project not found in edit mode
          return (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold mb-2">Project</h2>
                <p className="text-muted-foreground">
                  This interviewer belongs to the following project.
                </p>
              </div>
              <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                <p className="text-muted-foreground">Project not found for this interviewer.</p>
              </div>
            </div>
          );
        }
        
        // Create mode - show project selector
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Project</h2>
              <p className="text-muted-foreground">
                Choose which project this interviewer belongs to, or create a new project.
              </p>
            </div>

            <ProjectCombobox
              projects={projects}
              selectedProjectId={form.selectedProjectId}
              onProjectSelect={(id) => updateForm({ selectedProjectId: id })}
              onCreateProject={() => setShowCreateProjectDialog(true)}
              loading={isLoadingProjects}
            />

            <CreateProjectDialog
              open={showCreateProjectDialog}
              onOpenChange={setShowCreateProjectDialog}
              onProjectCreated={handleProjectCreated}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Configure Interviewer</h2>
              <p className="text-muted-foreground">Define your interviewer's identity and select an archetype.</p>
            </div>

            {/* Interviewer Identity */}
            <Card>
              <CardHeader>
                <CardTitle>Interviewer Identity</CardTitle>
                <CardDescription>
                  Give your interviewer a clear title and description to help identify its purpose.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Interviewer Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="e.g., EU Battery Market Expert Interview"
                    className={`mt-1 ${fieldErrors.title ? "border-destructive" : ""}`}
                    maxLength={80}
                  />
                  <CharacterCounter current={form.title.length} max={80} error={fieldErrors.title} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Describe what this interviewer is designed to accomplish..."
                    className={`mt-1 min-h-[100px] ${fieldErrors.description ? "border-destructive" : ""}`}
                    maxLength={500}
                  />
                  <CharacterCounter current={form.description.length} max={500} error={fieldErrors.description} />
                </div>
              </CardContent>
            </Card>

            {/* Archetype Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">What type of interview are you running? *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ARCHETYPES.map((archetype) => (
                  <ArchetypeCard
                    key={archetype.id}
                    archetype={archetype}
                    selected={form.archetype === archetype.id}
                    onSelect={() => updateForm({ 
                      archetype: archetype.id,
                      expertSource: archetype.id === 'expert_interview' ? form.expertSource : 'internal'
                    })}
                  />
                ))}
              </div>
            </div>

            {/* Expert Source Toggle - Only shown for Expert Interview */}
            {form.archetype === 'expert_interview' && (
              <Card>
                <CardHeader>
                  <CardTitle>Expert Source</CardTitle>
                  <CardDescription>
                    How are you sourcing experts? This affects the interview workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={form.expertSource} 
                    onValueChange={(value) => updateForm({ expertSource: value as ExpertSource })}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div 
                      className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                        form.expertSource === 'internal' ? "border-primary bg-primary/10" : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => updateForm({ expertSource: 'internal' })}
                    >
                      <RadioGroupItem value="internal" id="internal" className="mt-1" />
                      <Label htmlFor="internal" className="cursor-pointer flex-1">
                        <span className="font-medium">Direct / Internal</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Experts you've identified directly or within your organization
                        </p>
                      </Label>
                    </div>
                    <div 
                      className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                        form.expertSource === 'expert_network' ? "border-primary bg-primary/10" : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => updateForm({ expertSource: 'expert_network' })}
                    >
                      <RadioGroupItem value="expert_network" id="expert_network" className="mt-1" />
                      <Label htmlFor="expert_network" className="cursor-pointer flex-1">
                        <span className="font-medium">Expert Network</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Third-party sourced (e.g., GLG, AlphaSights, Guidepoint)
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Agent Persona */}
            <Card>
              <CardHeader>
                <CardTitle>Interviewer Persona</CardTitle>
                <CardDescription>Configure the interviewer's name, language, and voice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Language *</Label>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voice">Voice (for calls)</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={form.voiceId} onValueChange={(value) => updateForm({ voiceId: value })}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.map((voice) => (
                            <SelectItem key={voice.value} value={voice.value}>
                              <span>{voice.label}</span>
                              <span className="text-muted-foreground ml-2 text-xs">
                                {voice.description}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (previewingVoice === form.voiceId) {
                            stopPreview();
                          } else {
                            previewVoice(form.voiceId);
                          }
                        }}
                        title={previewingVoice === form.voiceId ? "Stop preview" : "Preview voice"}
                      >
                        {previewingVoice === form.voiceId ? (
                          <Square className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Preview uses browser TTS. Actual interviews use OpenAI voices.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="name">Interviewer Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder="e.g., Sam"
                      className={`mt-1 ${fieldErrors.name ? "border-destructive" : ""}`}
                      maxLength={20}
                    />
                    <CharacterCounter current={form.name.length} max={20} error={fieldErrors.name} />
                  </div>
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

            {/* Interview Context */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Context</CardTitle>
                <CardDescription>
                  Define the broader purpose, goals and scope of your interview. Describe the purpose of the interview
                  for your case, who the respondents are, and your key 2-4 research objectives. You can also add details
                  on what the interviewer should probe for in each topic area.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={form.interviewContext}
                  onChange={(value) => handleFieldChange("interviewContext", value)}
                  placeholder={`Example

Purpose: These interviews will inform our client's market entry strategy for the European renewable energy sector. Insights will shape recommendations on target segments, partnership models, and competitive positioning.

Respondents: Senior executives and technical leaders from wind and solar energy companies

Key Research Goals:
• Map the competitive landscape and identify emerging players disrupting traditional market dynamics
• Understand regulatory and policy factors driving investment decisions across key European markets
• Identify technology trends that will reshape cost structures over the next 5 years`}
                  minHeight="260px"
                />
                <CharacterCounter
                  current={form.interviewContext.length}
                  max={2000}
                  error={fieldErrors.interviewContext}
                />
              </CardContent>
            </Card>

            {/* Target Duration */}
            <Card>
              <CardHeader>
                <CardTitle>Target Interview Duration *</CardTitle>
                <CardDescription>Estimated time for completing the interview (3-60 minutes)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="targetDuration"
                    value={form.targetDuration}
                    onChange={(e) => handleFieldChange("targetDuration", e.target.value)}
                    placeholder="20"
                    className={`w-24 ${fieldErrors.targetDuration ? "border-destructive" : ""}`}
                    min={3}
                    max={60}
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
                <FieldError error={fieldErrors.targetDuration} />
              </CardContent>
            </Card>

            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
                <CardDescription>
                  Opening message and context. The agent uses this to greet participants, explain the interview purpose,
                  and set expectations. Leave empty to use default.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="introContext"
                  value={form.introContext}
                  onChange={(e) => handleFieldChange("introContext", e.target.value)}
                  placeholder="Example: Thank you for joining us today. This interview will take about 20 minutes. We'll be discussing your experience with our product and gathering feedback to improve our services."
                  className={`min-h-[100px] ${fieldErrors.introContext ? "border-destructive" : ""}`}
                  maxLength={600}
                />
                <CharacterCounter current={form.introContext.length} max={600} error={fieldErrors.introContext} />
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
                  <CardTitle>Screener Questions *</CardTitle>
                  <CardDescription>
                    Questions asked at the start to qualify participants. Use these to filter out unqualified
                    respondents before the main interview begins.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={form.screenerQuestions}
                    onChange={(value) => handleFieldChange("screenerQuestions", value)}
                    placeholder="Example: Are you over 18 years old? Have you used our product in the last 6 months?"
                  />
                  <CharacterCounter
                    current={form.screenerQuestions.length}
                    max={2000}
                    error={fieldErrors.screenerQuestions}
                  />
                </CardContent>
              </Card>
            )}

            {/* Introduction Questions (conditional - only if no screener) */}
            {!form.enableScreener && (
              <Card>
                <CardHeader>
                  <CardTitle>Introduction Questions *</CardTitle>
                  <CardDescription>
                    Warm-up questions to build rapport and ease into the interview. These are asked after the
                    introduction when no screener is used.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={form.introductionQuestions}
                    onChange={(value) => handleFieldChange("introductionQuestions", value)}
                    placeholder="Example: Tell me a bit about yourself and your role. How long have you been in this industry?"
                  />
                  <CharacterCounter
                    current={form.introductionQuestions.length}
                    max={2000}
                    error={fieldErrors.introductionQuestions}
                  />
                </CardContent>
              </Card>
            )}

            {/* Interview Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Guide *</CardTitle>
                <CardDescription>
                  The main body of your interview. Structure your questions in sections to explore your research topics
                  in depth.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={form.interviewGuide}
                  onChange={(value) => handleFieldChange("interviewGuide", value)}
                  placeholder="Structure your interview in sections with questions..."
                />
                <CharacterCounter current={form.interviewGuide.length} max={10000} error={fieldErrors.interviewGuide} />
              </CardContent>
            </Card>

            {/* Closing Context */}
            <Card>
              <CardHeader>
                <CardTitle>Closing</CardTitle>
                <CardDescription>
                  Final remarks and next steps. Thank participants and explain what happens after the interview
                  concludes. Leave empty to use default.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="closeContext"
                  value={form.closeContext}
                  onChange={(e) => handleFieldChange("closeContext", e.target.value)}
                  placeholder="Example: Thank you for your time and valuable insights. Your feedback will help us improve our product. You'll receive a summary via email within 48 hours, and we may reach out for follow-up questions."
                  className={`min-h-[100px] ${fieldErrors.closeContext ? "border-destructive" : ""}`}
                  maxLength={600}
                />
                <CharacterCounter current={form.closeContext.length} max={600} error={fieldErrors.closeContext} />
              </CardContent>
            </Card>

            {/* Knowledge Base */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  Background information and documents the agent can reference during the interview to provide context
                  or answer questions (optional).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="knowledgeText">Text Knowledge</Label>
                  <Textarea
                    id="knowledgeText"
                    value={form.knowledgeText}
                    onChange={(e) => handleFieldChange("knowledgeText", e.target.value)}
                    placeholder="Add background information, product details, company context, etc."
                    className={`mt-1 min-h-[120px] ${fieldErrors.knowledgeText ? "border-destructive" : ""}`}
                    maxLength={10000}
                  />
                  <CharacterCounter current={form.knowledgeText.length} max={10000} error={fieldErrors.knowledgeText} />
                </div>
                <div>
                  <Label>Upload Files</Label>
                  <div className="mt-2">
                    <Button variant="outline" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
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
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
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
        );

      case 3:
        const archetype = ARCHETYPES.find((a) => a.id === form.archetype);
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Configuration</h2>
              <p className="text-muted-foreground">Review all details before testing.</p>
            </div>

            {/* Project Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Project</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => goToStep(0)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                {selectedProject && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedProject.name}</p>
                      <Badge variant="secondary" className="mt-1">
                        {PROJECT_TYPE_LABELS[selectedProject.projectType]}
                      </Badge>
                      {selectedProject.caseCode && (
                        <p className="text-xs text-muted-foreground mt-1">{selectedProject.caseCode}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interviewer Configuration Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Interviewer Configuration</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => goToStep(1)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-medium">{form.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{form.description || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Archetype</Label>
                  <p className="font-medium">
                    {archetype?.title}
                    {form.archetype === 'expert_interview' && (
                      <Badge variant="outline" className="ml-2">
                        {form.expertSource === 'expert_network' ? 'Expert Network' : 'Direct/Internal'}
                      </Badge>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Agent Name</Label>
                  <p className="font-medium">{form.name || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Language</Label>
                  <p className="font-medium">{languages.find((l) => l.value === form.language)?.label}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Voice</Label>
                  <p className="font-medium">{voices.find((v) => v.value === form.voiceId)?.label}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Interview Content</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => goToStep(2)} className="gap-2">
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
                  <Label className="text-muted-foreground">Interview Context</Label>
                  <p className="font-medium">
                    {form.interviewContext
                      ? `${form.interviewContext.replace(/<[^>]*>/g, "").substring(0, 100)}${form.interviewContext.length > 100 ? "..." : ""}`
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Intro Context</Label>
                  <p className="font-medium">{form.introContext || "Using default"}</p>
                </div>
                {form.enableScreener && (
                  <div>
                    <Label className="text-muted-foreground">Screener Questions</Label>
                    <div 
                      className="font-medium prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5"
                      dangerouslySetInnerHTML={{ __html: form.screenerQuestions || "Not provided" }}
                    />
                  </div>
                )}
                {!form.enableScreener && form.introductionQuestions && (
                  <div>
                    <Label className="text-muted-foreground">Introduction Questions</Label>
                    <div 
                      className="font-medium prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5"
                      dangerouslySetInnerHTML={{ __html: form.introductionQuestions }}
                    />
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Interview Guide</Label>
                  <div 
                    className="font-medium prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:my-1"
                    dangerouslySetInnerHTML={{ __html: form.interviewGuide || "Not provided" }}
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Close Context</Label>
                  <p className="font-medium">{form.closeContext || "Using default"}</p>
                </div>
                {(form.knowledgeText || form.knowledgeFiles.length > 0) && (
                  <div>
                    <Label className="text-muted-foreground">Knowledge Base</Label>
                    {form.knowledgeText && (
                      <p className="font-medium">
                        {form.knowledgeText.substring(0, 100)}
                        {form.knowledgeText.length > 100 ? "..." : ""}
                      </p>
                    )}
                    {form.knowledgeFiles.length > 0 && (
                      <ul className="list-disc pl-4 mt-2">
                        {form.knowledgeFiles.map((file, index) => (
                          <li key={index} className="text-sm">
                            {file.name}
                          </li>
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
              <p className="text-muted-foreground">Try out your interviewer before launching.</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="bg-muted/50 p-8 rounded-lg border text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Test Interface Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    For now, proceed to deploy and test from the agent overview page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Deploy Your Interviewer</h2>
              <p className="text-muted-foreground">Select the medium and generate your phone number.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Select Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <ChannelSelector value={form.channel} onChange={(channel) => updateForm({ channel })} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg border text-center">
                  <p className="text-3xl font-bold">${PRICE_BY_CHANNEL[form.channel]}</p>
                  <p className="text-sm text-muted-foreground mt-1">per interview</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="caseCode">Case Code *</Label>
                  <Input
                    id="caseCode"
                    value={form.caseCode}
                    onChange={(e) => updateForm({ caseCode: e.target.value })}
                    placeholder="e.g., BCG-2024-0001"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading spinner while loading interviewer data in edit mode
  // Also wait for projects to load so we can resolve selectedProject
  const isLoading = isLoadingInterviewer || (mode === 'edit' && isLoadingProjects);
  
  if (isLoading) {
    return (
      <ConfigurationLayout 
        header={
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/app/interviewers')}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Interviewer</h1>
                <p className="text-muted-foreground text-sm">Loading interviewer configuration...</p>
              </div>
            </div>
          </div>
        } 
        footer={<div className="container mx-auto px-4 p-4" />}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ConfigurationLayout>
    );
  }

  const headerContent = (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'edit' ? 'Edit Interviewer' : 'Create New Interviewer'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'edit' 
                ? 'Review and modify your interviewer configuration' 
                : 'Follow the steps to configure and deploy your interview agent'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <div className="container mx-auto px-4 p-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {mode === 'create' && completedSteps.includes(0) && (
            <Button variant="secondary" onClick={saveDraft} disabled={isSavingDraft}>
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
        <div className="relative">
          {!validateStep(currentStep) && showValidation && getValidationMessage(currentStep) && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              {getValidationMessage(currentStep)}
            </div>
          )}
          {currentStep < steps.length - 1 ? (
            <div
              onClick={() => {
                if (!validateStep(currentStep)) {
                  setShowValidation(true);
                }
              }}
            >
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={!validateStep(currentStep) ? "pointer-events-none" : ""}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => {
                if (!validateStep(currentStep) && !isCreating) {
                  setShowValidation(true);
                }
              }}
            >
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isCreating}
                className={!validateStep(currentStep) || isCreating ? "pointer-events-none" : ""}
              >
                {isCreating 
                  ? (mode === 'edit' ? "Saving..." : "Creating...") 
                  : (mode === 'edit' ? "Save Changes" : "Publish")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ConfigurationLayout header={headerContent} footer={footerContent}>
        <div className="container mx-auto px-4 py-8">
          <Stepper steps={steps} currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />
        </div>
        <div className="container mx-auto px-4 pb-20">{renderStepContent()}</div>
      </ConfigurationLayout>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved progress. Are you sure you want to leave? Your changes will be lost.
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
    </>
  );
}
