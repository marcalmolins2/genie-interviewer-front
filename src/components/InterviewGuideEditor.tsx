import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  FileText,
  Target
} from 'lucide-react';
import { GuideSchema } from '@/types';

interface InterviewGuideEditorProps {
  guide: GuideSchema | null;
  onChange: (guide: GuideSchema) => void;
}

interface QuestionFormData {
  id: string;
  type: 'open' | 'scale' | 'multi' | 'single' | 'yes_no';
  prompt: string;
  required: boolean;
  options?: string[];
  scale?: { min: number; max: number; labels?: Record<number, string> };
  followUps?: string[];
}

export function InterviewGuideEditor({ guide, onChange }: InterviewGuideEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<{ sectionIndex: number; questionIndex?: number } | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    id: '',
    type: 'open',
    prompt: '',
    required: false
  });

  const defaultGuide: GuideSchema = {
    objectives: ["Gather valuable insights", "Understand key perspectives"],
    sections: []
  };

  const currentGuide = guide || defaultGuide;

  const updateGuide = (updates: Partial<GuideSchema>) => {
    onChange({ ...currentGuide, ...updates });
  };

  const addObjective = () => {
    const newObjectives = [...currentGuide.objectives, "New objective"];
    updateGuide({ objectives: newObjectives });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...currentGuide.objectives];
    newObjectives[index] = value;
    updateGuide({ objectives: newObjectives });
  };

  const removeObjective = (index: number) => {
    const newObjectives = currentGuide.objectives.filter((_, i) => i !== index);
    updateGuide({ objectives: newObjectives });
  };

  const addSection = () => {
    const newSections = [...currentGuide.sections, {
      title: "New Section",
      questions: []
    }];
    updateGuide({ sections: newSections });
  };

  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...currentGuide.sections];
    newSections[index] = { ...newSections[index], title };
    updateGuide({ sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = currentGuide.sections.filter((_, i) => i !== index);
    updateGuide({ sections: newSections });
  };

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  };

  const openQuestionDialog = (sectionIndex: number, questionIndex?: number) => {
    if (questionIndex !== undefined) {
      // Editing existing question
      const question = currentGuide.sections[sectionIndex].questions[questionIndex];
      setQuestionForm({
        id: question.id,
        type: question.type as any,
        prompt: question.prompt,
        required: question.required || false,
        options: question.options || [],
        scale: question.scale,
        followUps: question.followUps || []
      });
    } else {
      // Adding new question
      setQuestionForm({
        id: `q-${Date.now()}`,
        type: 'open',
        prompt: '',
        required: false
      });
    }
    setEditingQuestion({ sectionIndex, questionIndex });
  };

  const saveQuestion = () => {
    if (!editingQuestion || !questionForm.prompt.trim()) return;

    const { sectionIndex, questionIndex } = editingQuestion;
    const newSections = [...currentGuide.sections];
    
    const questionData: any = {
      id: questionForm.id,
      type: questionForm.type === 'yes_no' ? 'single' : questionForm.type,
      prompt: questionForm.prompt,
      required: questionForm.required
    };

    // Add type-specific properties
    if (questionForm.type === 'yes_no') {
      questionData.options = ['Yes', 'No'];
    } else if (questionForm.type === 'multi' || questionForm.type === 'single') {
      if (questionForm.options && questionForm.options.length > 0) {
        questionData.options = questionForm.options;
      }
    } else if (questionForm.type === 'scale' && questionForm.scale) {
      questionData.scale = questionForm.scale;
    }

    if (questionForm.followUps && questionForm.followUps.length > 0) {
      questionData.followUps = questionForm.followUps;
    }

    if (questionIndex !== undefined) {
      // Update existing question
      newSections[sectionIndex].questions[questionIndex] = questionData;
    } else {
      // Add new question
      newSections[sectionIndex].questions.push(questionData);
    }

    updateGuide({ sections: newSections });
    setEditingQuestion(null);
    setQuestionForm({
      id: '',
      type: 'open',
      prompt: '',
      required: false
    });
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...currentGuide.sections];
    newSections[sectionIndex].questions.splice(questionIndex, 1);
    updateGuide({ sections: newSections });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'open': return 'Open Text';
      case 'scale': return 'Scale Rating';
      case 'multi': return 'Multiple Choice';
      case 'single': return 'Single Choice';
      case 'yes_no': return 'Yes/No';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Research Objectives
          </CardTitle>
          <CardDescription>Key goals and outcomes for this interview</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentGuide.objectives.join('\n')}
            onChange={(e) => {
              const objectiveLines = e.target.value
                .split('\n')
                .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
                .filter(line => line.length > 0);
              updateGuide({ objectives: objectiveLines });
            }}
            placeholder="Enter your research objectives, one per line:&#10;• Gather valuable insights&#10;• Understand key perspectives&#10;• Identify pain points"
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Enter each objective on a new line. Bullets (•, -, *) are optional and will be automatically handled.
          </p>
        </CardContent>
      </Card>

      {/* Question Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Question Sections
          </CardTitle>
          <CardDescription>Organize your interview into structured sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentGuide.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                    className="font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                    placeholder="Section title..."
                  />
                  <Badge variant="secondary">
                    {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openQuestionDialog(sectionIndex)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSection(sectionIndex)}
                  >
                    {expandedSections.has(sectionIndex) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSection(sectionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expandedSections.has(sectionIndex) && (
                <div className="p-3 space-y-3 border-t">
                  {section.questions.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No questions yet. Click the + button to add questions.
                    </div>
                  ) : (
                    section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="bg-background p-3 rounded-md border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Q{questionIndex + 1}</Badge>
                              <Badge variant={question.required ? 'destructive' : 'secondary'}>
                                {question.required ? 'Required' : 'Optional'}
                              </Badge>
                              <Badge variant="outline">
                                {getQuestionTypeLabel(question.type)}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mb-2">{question.prompt}</p>
                            
                            {question.type === 'scale' && question.scale && (
                              <p className="text-xs text-muted-foreground">
                                Scale: {question.scale.min} - {question.scale.max}
                              </p>
                            )}
                            
                            {(question.type === 'multi' || question.type === 'single') && question.options && (
                              <p className="text-xs text-muted-foreground">
                                Options: {question.options.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openQuestionDialog(sectionIndex, questionIndex)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuestion(sectionIndex, questionIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          <Button variant="outline" onClick={addSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </CardContent>
      </Card>

      {/* Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion?.questionIndex !== undefined ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
            <DialogDescription>
              Configure the question details and response options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="question-prompt">Question Text *</Label>
              <Textarea
                id="question-prompt"
                value={questionForm.prompt}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter your question..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="question-type">Response Type *</Label>
                <Select 
                  value={questionForm.type} 
                  onValueChange={(value: any) => setQuestionForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md z-50">
                    <SelectItem value="open">Open Text</SelectItem>
                    <SelectItem value="yes_no">Yes/No</SelectItem>
                    <SelectItem value="single">Single Choice</SelectItem>
                    <SelectItem value="multi">Multiple Choice</SelectItem>
                    <SelectItem value="scale">Scale Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="required"
                  checked={questionForm.required}
                  onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, required: checked }))}
                />
                <Label htmlFor="required">Required Question</Label>
              </div>
            </div>

            {questionForm.type === 'multi' || questionForm.type === 'single' ? (
              <div>
                <Label>Answer Options</Label>
                <div className="mt-2 space-y-2">
                  {(questionForm.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(questionForm.options || [])];
                          newOptions[index] = e.target.value;
                          setQuestionForm(prev => ({ ...prev, options: newOptions }));
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = (questionForm.options || []).filter((_, i) => i !== index);
                          setQuestionForm(prev => ({ ...prev, options: newOptions }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [...(questionForm.options || []), ''];
                      setQuestionForm(prev => ({ ...prev, options: newOptions }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            ) : null}

            {questionForm.type === 'scale' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scale-min">Minimum Value</Label>
                  <Input
                    id="scale-min"
                    type="number"
                    value={questionForm.scale?.min || 1}
                    onChange={(e) => {
                      const min = parseInt(e.target.value);
                      setQuestionForm(prev => ({
                        ...prev,
                        scale: { ...prev.scale, min, max: prev.scale?.max || 5 }
                      }));
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="scale-max">Maximum Value</Label>
                  <Input
                    id="scale-max"
                    type="number"
                    value={questionForm.scale?.max || 5}
                    onChange={(e) => {
                      const max = parseInt(e.target.value);
                      setQuestionForm(prev => ({
                        ...prev,
                        scale: { ...prev.scale, min: prev.scale?.min || 1, max }
                      }));
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={saveQuestion} disabled={!questionForm.prompt.trim()}>
              {editingQuestion?.questionIndex !== undefined ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}