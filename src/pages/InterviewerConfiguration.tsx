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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Upload, FileText, X, FolderOpen, Play, Square, Loader2, SkipForward } from "lucide-react";
import { ARCHETYPES, Archetype, ExpertSource, GuideSchema, PROJECT_TYPE_LABELS } from "@/types";
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
  // Step 1: Project & Setup
  selectedProjectId: string | null;
  title: string;
  description: string;
  archetype: Archetype | null;
  expertSource: ExpertSource;
  language: string;
  targetDuration: string;

  // Step 2: Interview Content
  interviewContext: string;
  enableScreener: boolean;
  screenerQuestions: string;
  introductionQuestions: string;
  interviewGuide: string;
  guideStructured: GuideSchema | null;
  knowledgeText: string;
  knowledgeFiles: File[];

  // Step 3: Fine-Tune (all optional)
  voiceId: string;
  name: string;
  introContext: string;
  closeContext: string;
  pronunciationHints: string;
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
  { id: "setup", title: "Project & Setup", description: "Foundation" },
  { id: "content", title: "Interview Content", description: "Research design" },
  { id: "finetune", title: "Fine-Tune", description: "Optional", optional: true },
];

// ============= Validation helpers =============
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
  if (!trimmed) return "";
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
  if (!trimmed) return "Research context is required";
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
  if (!trimmed) return "Screener criteria is required";
  if (trimmed.length < 10) return "Screener criteria must be at least 10 characters";
  if (trimmed.length > 2000) return "Screener text must be shorter than 2,000 characters";
  return "";
};

const validateIntroductionQuestions = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "Warm-up questions are required";
  if (trimmed.length < 10) return "Warm-up questions must be at least 10 characters";
  if (trimmed.length > 2000) return "Warm-up questions must be shorter than 2,000 characters";
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

// ============= Helper components =============
const CharacterCounter = ({ current, max, error }: { current: number; max: number; error?: string }) => (
  <div className="flex justify-between items-center mt-1">
    <span className="text-xs text-destructive">{error}</span>
    <span className={`text-xs ${current > max ? "text-destructive" : "text-muted-foreground"}`}>
      {current}/{max}
    </span>
  </div>
);

const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;
  return <p className="text-xs text-destructive mt-1">{error}</p>;
};

// Archetypes that support a knowledge base
const KB_ARCHETYPES: Archetype[] = ['expert_interview', 'belief_audit', 'customer_interview', 'maturity_assessment'];

export default function InterviewerConfiguration({ mode = 'create' }: InterviewerConfigurationProps) {
  const { selectedProjectId: sidebarProjectId, projects, refreshProjects, isLoadingProjects } = useProjectContext();
  const { interviewerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoadingInterviewer, setIsLoadingInterviewer] = useState(mode === 'edit');
  // Edit mode starts at step 2 (Interview Content); create starts at 0
  const [currentStep, setCurrentStep] = useState(mode === 'edit' ? 1 : 0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(mode === 'edit' ? [0, 1, 2] : []);
  const [form, setForm] = useState<CreateInterviewerForm>({
    selectedProjectId: sidebarProjectId,
    title: "",
    description: "",
    archetype: null,
    expertSource: "internal",
    language: "en",
    targetDuration: "20",
    interviewContext: "",
    enableScreener: false,
    screenerQuestions: "",
    introductionQuestions: "",
    interviewGuide: "",
    guideStructured: null,
    knowledgeText: "",
    knowledgeFiles: [],
    voiceId: "alloy",
    name: "",
    introContext: "",
    closeContext: "",
    pronunciationHints: "",
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

      if (interviewer.status === 'archived') {
        toast({ title: "Cannot edit archived interviewer", variant: "destructive" });
        navigate(`/app/interviewers/${id}`);
        return;
      }

      const textKnowledge = knowledge.find(k => k.type === 'text');

      const loadedForm: CreateInterviewerForm = {
        selectedProjectId: interviewer.projectId || sidebarProjectId || null,
        title: interviewer.title || interviewer.name || '',
        description: interviewer.description || '',
        archetype: interviewer.archetype || null,
        expertSource: (interviewer as any).expertSource || 'internal',
        language: interviewer.language || 'en',
        targetDuration: String(interviewer.targetDuration || 20),
        interviewContext: interviewer.interviewContext || '',
        enableScreener: interviewer.enableScreener || false,
        screenerQuestions: interviewer.screenerQuestions || '',
        introductionQuestions: interviewer.introductionQuestions || '',
        interviewGuide: guide?.rawText || '',
        guideStructured: guide?.structured || null,
        knowledgeText: textKnowledge?.contentText || '',
        knowledgeFiles: [],
        voiceId: interviewer.voiceId || 'alloy',
        name: interviewer.name || '',
        introContext: interviewer.introContext || '',
        closeContext: interviewer.closeContext || '',
        pronunciationHints: (interviewer as any).pronunciationHints || '',
      };

      setForm(loadedForm);
      setInitialForm(loadedForm);
      setCompletedSteps([0, 1, 2]);
      setCurrentStep(1); // Land on Interview Content in edit mode
    } catch (error) {
      toast({ title: "Error loading interviewer", variant: "destructive" });
      navigate('/app/interviewers');
    } finally {
      setIsLoadingInterviewer(false);
    }
  };

  const hasUnsavedChanges = useCallback(() => {
    if (mode === 'edit' && initialForm) {
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
      case "title": error = validateTitle(value); break;
      case "description": error = validateDescription(value); break;
      case "name": error = validateAgentName(value); break;
      case "targetDuration": error = validateTargetDuration(value); break;
      case "interviewContext": error = validateInterviewContext(value); break;
      case "introContext": error = validateIntroContext(value); break;
      case "screenerQuestions": error = validateScreenerQuestions(value); break;
      case "introductionQuestions": error = validateIntroductionQuestions(value); break;
      case "interviewGuide": error = validateInterviewGuide(value); break;
      case "closeContext": error = validateCloseContext(value); break;
      case "knowledgeText": error = validateKnowledgeText(value); break;
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

  // ============= Step validation =============
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return (
          form.selectedProjectId !== null &&
          !validateTitle(form.title) &&
          !validateDescription(form.description) &&
          form.archetype !== null
        );
      case 1: {
        const contextValid = !validateInterviewContext(form.interviewContext);
        const questionsValid = form.enableScreener
          ? !validateScreenerQuestions(form.screenerQuestions)
          : !validateIntroductionQuestions(form.introductionQuestions);
        const guideValid = !validateInterviewGuide(form.interviewGuide);
        const knowledgeValid = !validateKnowledgeText(form.knowledgeText);
        return contextValid && questionsValid && guideValid && knowledgeValid;
      }
      case 2:
        // All optional — always valid
        return true;
      default:
        return true;
    }
  };

  const getValidationMessage = (step: number): string => {
    const missingFields: string[] = [];
    switch (step) {
      case 0: {
        if (!form.selectedProjectId) missingFields.push("Please select a project");
        const titleError = validateTitle(form.title);
        if (titleError) missingFields.push(titleError);
        if (!form.archetype) missingFields.push("Archetype selection is required");
        break;
      }
      case 1: {
        const contextError = validateInterviewContext(form.interviewContext);
        if (contextError) missingFields.push(contextError);
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
    }
    return missingFields.length === 0 ? "" : missingFields[0];
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
    if (completedSteps.includes(stepIndex) || stepIndex <= Math.max(...completedSteps, -1) + 1) {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        setShowValidation(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const saveDraft = async () => {
    if (!form.selectedProjectId) {
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
        name: form.name || form.title,
        title: form.title,
        description: form.description,
        archetype: form.archetype,
        language: form.language,
        voiceId: form.voiceId,
        channel: 'web_link',
        projectId: form.selectedProjectId,
        targetDuration: parseInt(form.targetDuration),
        interviewContext: form.interviewContext,
        introContext: form.introContext,
        enableScreener: form.enableScreener,
        screenerQuestions: form.screenerQuestions,
        introductionQuestions: form.introductionQuestions,
        closeContext: form.closeContext,
        pronunciationHints: form.pronunciationHints,
      } as any);

      if (form.interviewGuide) {
        await agentsService.updateAgentGuide(agent.id, form.interviewGuide, form.guideStructured);
      }

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
        targetDuration: parseInt(form.targetDuration),
        interviewContext: form.interviewContext,
        introContext: form.introContext,
        enableScreener: form.enableScreener,
        screenerQuestions: form.screenerQuestions,
        introductionQuestions: form.introductionQuestions,
        closeContext: form.closeContext,
        pronunciationHints: form.pronunciationHints,
      } as any);

      await agentsService.updateAgentGuide(interviewerId, form.interviewGuide, form.guideStructured);

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

  // ============= Step content rendering =============
  const renderStepContent = () => {
    switch (currentStep) {
      // ─────────────────────────────────────────────
      // Step 1: Project & Setup
      // ─────────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Project & Setup</h2>
              <p className="text-muted-foreground">
                Make the foundational choices that shape your entire interview.
              </p>
            </div>

            {/* Project Selection */}
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Project *</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Which project does this interviewer belong to?
                </p>
              </div>
              {mode === 'edit' ? (
                selectedProject ? (
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
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">Project not found for this interviewer.</p>
                  </div>
                )
              ) : (
                <>
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
                </>
              )}
            </section>

            {/* Title & Description */}
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Interviewer Identity</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Give your interviewer a clear title to identify its purpose.
                </p>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-4">
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
                      className={`mt-1 min-h-[80px] ${fieldErrors.description ? "border-destructive" : ""}`}
                      maxLength={500}
                    />
                    <CharacterCounter current={form.description.length} max={500} error={fieldErrors.description} />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Archetype Selection */}
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Interview Type *</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Choose the archetype that best fits your research goal.
                </p>
              </div>
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
            </section>

            {/* Expert Source — conditional */}
            {form.archetype === 'expert_interview' && (
              <section className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold">Expert Source</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    How are you sourcing experts for this research?
                  </p>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <RadioGroup
                      value={form.expertSource}
                      onValueChange={(value) => updateForm({ expertSource: value as ExpertSource })}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div
                        className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                          form.expertSource === 'internal' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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
                          form.expertSource === 'expert_network' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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
              </section>
            )}

            {/* Language & Duration */}
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Language & Duration</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Language constrains available voice options in Step 3.
                </p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="language">Language *</Label>
                      <Select value={form.language} onValueChange={(value) => updateForm({ language: value })}>
                        <SelectTrigger className="mt-1">
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
                      <Label htmlFor="targetDuration">Target Duration *</Label>
                      <div className="flex items-center gap-2 mt-1">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        );

      // ─────────────────────────────────────────────
      // Step 2: Interview Content
      // ─────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-1">Interview Content</h2>
              <p className="text-muted-foreground">
                Write the research content that defines what your interviewer does in conversations.
              </p>
            </div>

            {/* Section A: Research Context */}
            <section className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 w-5">A</span>
                <div>
                  <h3 className="text-base font-semibold">Research Context *</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    What are you trying to learn? Articulate your research objective before writing specific questions.
                  </p>
                </div>
              </div>
              <Card>
                <CardContent className="pt-6">
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
                    minHeight="220px"
                  />
                  <CharacterCounter
                    current={form.interviewContext.length}
                    max={2000}
                    error={fieldErrors.interviewContext}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Section B: Interview Guide */}
            <section className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 w-5">B</span>
                <div>
                  <h3 className="text-base font-semibold">Interview Guide</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Define the screening approach and write the core interview questions.
                  </p>
                </div>
              </div>

              {/* Screening Mode Picker */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Opening approach *</CardTitle>
                  <CardDescription>
                    How should the interviewer open the conversation?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`text-left border rounded-lg p-4 transition-colors ${
                        form.enableScreener
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => updateForm({ enableScreener: true })}
                    >
                      <p className="font-medium text-sm">Screen participants</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Evaluate whether participants meet specific criteria before the main interview.
                      </p>
                    </button>
                    <button
                      type="button"
                      className={`text-left border rounded-lg p-4 transition-colors ${
                        !form.enableScreener
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => updateForm({ enableScreener: false })}
                    >
                      <p className="font-medium text-sm">Warm-up only</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Open with rapport-building questions before the main interview. No qualification gate.
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Conditional field: screener or warm-up */}
              {form.enableScreener ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Screening criteria *</CardTitle>
                    <CardDescription>
                      Define the criteria used to qualify participants. Participants who don't qualify may be disqualified.
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
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Warm-up questions *</CardTitle>
                    <CardDescription>
                      Opening questions to ease participants into the conversation before the main interview.
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Interview guide *</CardTitle>
                  <CardDescription>
                    The main body of your interview. Structure your questions in sections to explore your research topics in depth.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={form.interviewGuide}
                    onChange={(value) => handleFieldChange("interviewGuide", value)}
                    placeholder="Structure your interview in sections with questions..."
                    minHeight="280px"
                  />
                  <CharacterCounter
                    current={form.interviewGuide.length}
                    max={10000}
                    error={fieldErrors.interviewGuide}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Section C: Knowledge Base — conditional on archetype */}
            {form.archetype && KB_ARCHETYPES.includes(form.archetype) && (
              <section className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 w-5">C</span>
                  <div>
                    <h3 className="text-base font-semibold">Knowledge Base <span className="text-muted-foreground font-normal">(optional)</span></h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Background material the interviewer can draw on during conversations.
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6 space-y-4">
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
              </section>
            )}
          </div>
        );

      // ─────────────────────────────────────────────
      // Step 3: Fine-Tune (all optional)
      // ─────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Fine-Tune Your Interviewer</h2>
              <p className="text-muted-foreground">
                All fields are optional — every one has a sensible default. You can also adjust these after testing.
              </p>
            </div>

            {/* Voice */}
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Voice</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Select a voice for the interviewer. Defaults to Alloy.
                </p>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <Label htmlFor="voice">Voice</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={form.voiceId} onValueChange={(value) => updateForm({ voiceId: value })}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.map((voice) => (
                            <SelectItem key={voice.value} value={voice.value}>
                              <span>{voice.label}</span>
                              <span className="text-muted-foreground ml-2 text-xs">{voice.description}</span>
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
                </CardContent>
              </Card>
            </section>

            {/* Interviewer Name */}
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Interviewer Name</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  A persona name for the interviewer (e.g., "Sam"). Used in greetings.
                </p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="e.g., Sam"
                    className={`mt-1 ${fieldErrors.name ? "border-destructive" : ""}`}
                    maxLength={20}
                  />
                  <CharacterCounter current={form.name.length} max={20} error={fieldErrors.name} />
                </CardContent>
              </Card>
            </section>

            {/* Conversation Flow */}
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Conversation Flow</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Customize how the interviewer opens and closes conversations. Leave empty to use defaults.
                </p>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-5">
                  <div>
                    <Label htmlFor="introContext">Introduction context</Label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                      The interviewer already identifies itself as AI, explains the topic, and asks for consent. This context adds to that default — it doesn't replace it.
                    </p>
                    <Textarea
                      id="introContext"
                      value={form.introContext}
                      onChange={(e) => handleFieldChange("introContext", e.target.value)}
                      placeholder="e.g., Thank you for joining us today. This interview will take about 20 minutes."
                      className={`min-h-[90px] ${fieldErrors.introContext ? "border-destructive" : ""}`}
                      maxLength={600}
                    />
                    <CharacterCounter current={form.introContext.length} max={600} error={fieldErrors.introContext} />
                  </div>
                  <div>
                    <Label htmlFor="closeContext">Closing context</Label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                      What the interviewer says at the end of the conversation.
                    </p>
                    <Textarea
                      id="closeContext"
                      value={form.closeContext}
                      onChange={(e) => handleFieldChange("closeContext", e.target.value)}
                      placeholder="e.g., Thank you for your time. Your feedback will help us improve our services."
                      className={`min-h-[90px] ${fieldErrors.closeContext ? "border-destructive" : ""}`}
                      maxLength={600}
                    />
                    <CharacterCounter current={form.closeContext.length} max={600} error={fieldErrors.closeContext} />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Pronunciation */}
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Pronunciation Reference</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  List terms with non-obvious pronunciation — company names, technical terms, proper nouns.
                </p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <Label htmlFor="pronunciationHints">Pronunciation hints</Label>
                  <Textarea
                    id="pronunciationHints"
                    value={form.pronunciationHints}
                    onChange={(e) => updateForm({ pronunciationHints: e.target.value })}
                    placeholder={"e.g., McKinsey = mak-IN-zee\nAtos = AY-tos\nNovartis = no-VAR-tis"}
                    className="mt-1 min-h-[100px] font-mono text-sm"
                    maxLength={1000}
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">{form.pronunciationHints.length}/1000</span>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  // ============= Loading guard =============
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

  // ============= Header & Footer =============
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
              {mode === 'edit' ? 'Edit Interviewer' : 'Design Your Interview'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'edit'
                ? 'Modify your interviewer configuration'
                : 'Build your research interview in three steps'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const isLastStep = currentStep === steps.length - 1;
  const isOnFinetuneStep = currentStep === 2;

  const footerContent = (
    <div className="container mx-auto px-4 p-4">
      <div className="flex justify-between items-center">
        {/* Left: Previous + Save Draft */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {(mode === 'create' ? form.selectedProjectId : true) && (
            <Button variant="secondary" onClick={saveDraft} disabled={isSavingDraft}>
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>
          )}
        </div>

        {/* Center: step indicator */}
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>

        {/* Right: Next / Skip & Save / Save */}
        <div className="relative flex gap-2">
          {/* Validation tooltip */}
          {!validateStep(currentStep) && showValidation && getValidationMessage(currentStep) && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              {getValidationMessage(currentStep)}
            </div>
          )}

          {/* Edit mode: Save Changes always visible */}
          {mode === 'edit' && (
            <Button
              onClick={handleSubmit}
              disabled={isCreating}
              variant="outline"
            >
              {isCreating ? "Saving..." : "Save Changes"}
            </Button>
          )}

          {/* Skip & Save — only on Step 3 in create mode */}
          {mode === 'create' && isOnFinetuneStep && (
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={isCreating}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip & Save
            </Button>
          )}

          {/* Main action button */}
          {!isLastStep ? (
            <div
              onClick={() => {
                if (!validateStep(currentStep)) setShowValidation(true);
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
                if (!validateStep(currentStep) && !isCreating) setShowValidation(true);
              }}
            >
              <Button
                onClick={handleSubmit}
                disabled={isCreating}
                className={isCreating ? "pointer-events-none" : ""}
              >
                {isCreating
                  ? (mode === 'edit' ? "Saving..." : "Creating...")
                  : (mode === 'edit' ? "Save Changes" : "Save Interviewer")}
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
          <Stepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
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
