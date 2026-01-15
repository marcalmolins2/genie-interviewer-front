import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Stepper } from '@/components/Stepper';
import { ProjectCombobox } from '@/components/ProjectCombobox';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { useProjectContext } from '@/pages/InterviewersLayout';
import { Archetype, Channel, GuideSchema } from '@/types';

// Step definitions for content flow
const CONTENT_STEPS = [
  { id: 'describe', title: 'Describe' },
  { id: 'clarify', title: 'Clarify' },
  { id: 'brief', title: 'Research Brief' },
  { id: 'guide', title: 'Interview Guide' },
];

// State interface for guided configuration
interface GuidedConfigState {
  // Tab state
  activeTab: 'content' | 'settings';
  
  // Content flow
  currentStep: number; // 0 = describe, 1 = clarify, 2 = brief, 3 = guide
  completedSteps: number[];
  needsClarification: boolean;
  
  // Step data
  contextDump: string;
  uploadedDocuments: File[];
  followUpAnswers: Record<string, string>;
  interviewContext: string;
  introduction: string;
  interviewGuide: GuideSchema | null;
  closingContext: string;
  
  // Settings (AI-drafted + user edits)
  settings: {
    projectId: string | null;
    title: string;
    description: string;
    archetype: Archetype;
    archetypeConfidence: number;
    targetDuration: number;
    name: string;
    language: string;
    voiceId: string;
    channel: Channel;
  };
  settingsReviewed: boolean;
}

const initialState: GuidedConfigState = {
  activeTab: 'content',
  currentStep: 0,
  completedSteps: [],
  needsClarification: false,
  contextDump: '',
  uploadedDocuments: [],
  followUpAnswers: {},
  interviewContext: '',
  introduction: '',
  interviewGuide: null,
  closingContext: '',
  settings: {
    projectId: null,
    title: '',
    description: '',
    archetype: 'expert_interview',
    archetypeConfidence: 0,
    targetDuration: 30,
    name: 'Alex',
    language: 'en-US',
    voiceId: '',
    channel: 'web_link',
  },
  settingsReviewed: false,
};

export default function CreateInterviewerGuided() {
  const navigate = useNavigate();
  const { projects, selectedProjectId, refreshProjects } = useProjectContext();
  const [state, setState] = useState<GuidedConfigState>({
    ...initialState,
    settings: {
      ...initialState.settings,
      projectId: selectedProjectId,
    },
  });
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Determine visible steps (hide clarify if not needed)
  const visibleSteps = state.needsClarification 
    ? CONTENT_STEPS 
    : CONTENT_STEPS.filter(s => s.id !== 'clarify');

  // Map internal step index to visible step index
  const getVisibleStepIndex = useCallback((internalStep: number) => {
    if (!state.needsClarification && internalStep > 0) {
      return internalStep - 1;
    }
    return internalStep;
  }, [state.needsClarification]);

  const handleTabChange = (value: string) => {
    setState(prev => ({ ...prev, activeTab: value as 'content' | 'settings' }));
  };

  const handleProjectChange = (projectId: string) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, projectId },
    }));
  };

  const handleProjectCreated = (projectId: string) => {
    refreshProjects();
    handleProjectChange(projectId);
    setShowCreateProject(false);
  };

  const handleCancel = () => {
    navigate('/app/interviewers');
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft save to localStorage
    console.log('Saving draft...');
  };

  const handlePrevious = () => {
    if (state.currentStep > 0) {
      const prevStep = state.currentStep - 1;
      // Skip clarify step if not needed
      if (!state.needsClarification && prevStep === 1) {
        setState(prev => ({ ...prev, currentStep: 0 }));
      } else {
        setState(prev => ({ ...prev, currentStep: prevStep }));
      }
    }
  };

  const handleNext = () => {
    const maxStep = 3;
    if (state.currentStep < maxStep) {
      let nextStep = state.currentStep + 1;
      // Skip clarify step if not needed
      if (!state.needsClarification && nextStep === 1) {
        nextStep = 2;
      }
      setState(prev => ({
        ...prev,
        currentStep: nextStep,
        completedSteps: prev.completedSteps.includes(prev.currentStep)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStep],
      }));
    } else {
      // Final step - check if settings need review
      if (!state.settingsReviewed) {
        setState(prev => ({ ...prev, activeTab: 'settings' }));
      } else {
        navigate('/app/interviewers/new/guided/review');
      }
    }
  };

  const canGoNext = () => {
    switch (state.currentStep) {
      case 0: return state.contextDump.trim().length > 0;
      case 1: return true; // Clarify step - optional answers
      case 2: return state.interviewContext.trim().length > 0;
      case 3: return state.interviewGuide !== null;
      default: return false;
    }
  };

  const getNextButtonText = () => {
    if (state.currentStep === 3) {
      return state.settingsReviewed ? 'Continue to Review' : 'Review Settings';
    }
    return 'Continue';
  };

  // Check if settings tab needs attention
  const settingsNeedsAttention = !state.settingsReviewed || !state.settings.title;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Project:</span>
              <div className="w-64">
                <ProjectCombobox
                  projects={projects}
                  selectedProjectId={state.settings.projectId}
                  onProjectSelect={handleProjectChange}
                  onCreateProject={() => setShowCreateProject(true)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs 
          value={state.activeTab} 
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col"
        >
          <div className="border-b px-6 py-2">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="content" className="relative">
                📝 Content
                {state.completedSteps.length > 0 && state.activeTab !== 'content' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="relative">
                ⚙️ Settings
                {settingsNeedsAttention && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content" className="flex-1 flex flex-col overflow-hidden m-0">
            {/* Stepper */}
            <div className="px-6 py-4 border-b bg-muted/30">
              <Stepper
                steps={visibleSteps}
                currentStep={getVisibleStepIndex(state.currentStep)}
                completedSteps={state.completedSteps.map(s => getVisibleStepIndex(s))}
                className="max-w-2xl mx-auto"
              />
            </div>

            {/* Step Content with optional Sidebar */}
            <div className="flex-1 overflow-auto">
              <div className="flex h-full">
                {/* Main Content Area */}
                <div className={`flex-1 p-6 ${state.currentStep >= 2 ? 'pr-0' : ''}`}>
                  {state.currentStep === 0 && (
                    <div className="max-w-2xl mx-auto">
                      <h2 className="text-2xl font-semibold mb-2">Describe Your Interview</h2>
                      <p className="text-muted-foreground mb-6">
                        Tell us about your research goals, target audience, and what you want to learn.
                      </p>
                      {/* TODO: Replace with ContextDumpInput component */}
                      <textarea
                        value={state.contextDump}
                        onChange={(e) => setState(prev => ({ ...prev, contextDump: e.target.value }))}
                        placeholder={`Tell us about your interview...

• What do you want to learn? (your main research question)
• Who will you interview? (role, industry, experience)
• Key topics to explore
• How long should each interview be?

You can also upload research briefs, interview guides, or background documents.`}
                        className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}

                  {state.currentStep === 1 && (
                    <div className="max-w-2xl mx-auto">
                      <h2 className="text-2xl font-semibold mb-2">Quick Clarifications</h2>
                      <p className="text-muted-foreground mb-6">
                        Just a couple questions to help us create the perfect interview setup.
                      </p>
                      {/* TODO: Replace with ClarifyQuestions component */}
                      <div className="text-center text-muted-foreground py-12">
                        Clarification questions will appear here if needed.
                      </div>
                    </div>
                  )}

                  {state.currentStep === 2 && (
                    <div className="max-w-2xl">
                      <h2 className="text-2xl font-semibold mb-2">Research Brief</h2>
                      <p className="text-muted-foreground mb-6">
                        Review and refine the research context for your interview.
                      </p>
                      {/* TODO: Replace with ResearchBriefEditor component */}
                      <textarea
                        value={state.interviewContext}
                        onChange={(e) => setState(prev => ({ ...prev, interviewContext: e.target.value }))}
                        placeholder="Your research brief will appear here after processing..."
                        className="w-full min-h-[400px] p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}

                  {state.currentStep === 3 && (
                    <div className="max-w-2xl">
                      <h2 className="text-2xl font-semibold mb-2">Interview Guide</h2>
                      <p className="text-muted-foreground mb-6">
                        Review and customize the interview flow.
                      </p>
                      {/* TODO: Replace with GuidedGuideEditor component */}
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Introduction</label>
                          <textarea
                            value={state.introduction}
                            onChange={(e) => setState(prev => ({ ...prev, introduction: e.target.value }))}
                            placeholder="Introduction text..."
                            className="w-full min-h-[100px] p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Guide Sections</label>
                          <div className="border rounded-lg p-4 text-center text-muted-foreground">
                            Guide sections editor will appear here.
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Closing</label>
                          <textarea
                            value={state.closingContext}
                            onChange={(e) => setState(prev => ({ ...prev, closingContext: e.target.value }))}
                            placeholder="Closing context..."
                            className="w-full min-h-[100px] p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Refinement Sidebar (Steps 2-3 only) */}
                {state.currentStep >= 2 && (
                  <div className="w-80 border-l bg-muted/20 p-4 overflow-auto">
                    <h3 className="font-medium mb-4">AI Refinement</h3>
                    {/* TODO: Replace with AIRefinementSidebar component */}
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-background border">
                        <h4 className="text-sm font-medium mb-2">💡 Suggestions</h4>
                        <p className="text-xs text-muted-foreground">
                          AI suggestions will appear here.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border">
                        <h4 className="text-sm font-medium mb-2">📝 Add Context</h4>
                        <textarea
                          placeholder="Add additional context..."
                          className="w-full text-sm p-2 rounded border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
                        />
                        <Button size="sm" className="w-full mt-2" variant="outline">
                          Preview Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-auto m-0 p-6">
            {/* TODO: Replace with GuidedSettingsPanel component */}
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Settings</h2>
                <p className="text-muted-foreground">
                  Configure your interviewer details and deployment options.
                </p>
              </div>

              <div className="space-y-6">
                <section className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Info</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={state.settings.title}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, title: e.target.value },
                          settingsReviewed: true,
                        }))}
                        placeholder="e.g., Battery Supplier Expert Interviews"
                        className="w-full p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Description</label>
                      <textarea
                        value={state.settings.description}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, description: e.target.value },
                          settingsReviewed: true,
                        }))}
                        placeholder="Brief description of this interviewer's purpose..."
                        className="w-full p-2 rounded-md border bg-background resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-medium">Interview Format</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Archetype</label>
                      <select
                        value={state.settings.archetype}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, archetype: e.target.value as Archetype },
                          settingsReviewed: true,
                        }))}
                        className="w-full p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="expert_interview">Expert Interview</option>
                        <option value="customer_interview">Customer Interview</option>
                        <option value="belief_audit">Belief Audit</option>
                        <option value="maturity_assessment">Maturity Assessment</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Duration</label>
                      <select
                        value={state.settings.targetDuration}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, targetDuration: parseInt(e.target.value) },
                          settingsReviewed: true,
                        }))}
                        className="w-full p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={20}>20 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-medium">Agent Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Interviewer Name</label>
                      <input
                        type="text"
                        value={state.settings.name}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, name: e.target.value },
                          settingsReviewed: true,
                        }))}
                        placeholder="e.g., Alex"
                        className="w-full p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Language</label>
                        <select
                          value={state.settings.language}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            settings: { ...prev.settings, language: e.target.value },
                            settingsReviewed: true,
                          }))}
                          className="w-full p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="de-DE">German</option>
                          <option value="fr-FR">French</option>
                          <option value="es-ES">Spanish</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Voice</label>
                        <select
                          value={state.settings.voiceId}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            settings: { ...prev.settings, voiceId: e.target.value },
                            settingsReviewed: true,
                          }))}
                          className="w-full p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Default</option>
                          <option value="alloy">Alloy</option>
                          <option value="echo">Echo</option>
                          <option value="fable">Fable</option>
                          <option value="onyx">Onyx</option>
                          <option value="nova">Nova</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-medium">Deployment</h3>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Channel</label>
                    <select
                      value={state.settings.channel}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, channel: e.target.value as Channel },
                        settingsReviewed: true,
                      }))}
                      className="w-full p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="web_link">Web Link</option>
                      <option value="inbound_call">Inbound Call</option>
                    </select>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          {state.activeTab === 'content' && state.currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          )}
          {state.activeTab === 'content' && (
            <Button onClick={handleNext} disabled={!canGoNext()}>
              {getNextButtonText()}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {state.activeTab === 'settings' && (
            <Button onClick={() => navigate('/app/interviewers/new/guided/review')}>
              Continue to Review
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </footer>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
