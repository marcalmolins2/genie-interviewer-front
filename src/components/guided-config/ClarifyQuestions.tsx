import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Target, Users, List, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GapType = 'objective' | 'audience' | 'scope' | 'duration';

export interface ClarificationQuestion {
  id: GapType;
  question: string;
  placeholder: string;
  quickOptions: string[];
  icon: React.ReactNode;
  aiConfidence?: number; // 0-1, if AI partially detected this
}

interface ClarifyQuestionsProps {
  detectedGaps: GapType[];
  answers: Record<string, string>;
  onAnswerChange: (gapId: string, value: string) => void;
  selectedChips: Record<string, string[]>;
  onChipSelect: (gapId: string, chip: string) => void;
}

const CLARIFICATION_QUESTIONS: Record<GapType, Omit<ClarificationQuestion, 'id'>> = {
  objective: {
    question: "What's the main question you're trying to answer?",
    placeholder: "e.g., We want to understand why enterprise customers are churning after the first year...",
    quickOptions: [
      'Understand pain points',
      'Validate product concept',
      'Explore market opportunity',
      'Assess decision process',
      'Gather competitive insights',
    ],
    icon: <Target className="h-5 w-5" />,
  },
  audience: {
    question: 'Who will you be interviewing?',
    placeholder: "e.g., Senior procurement managers at Fortune 500 companies with 5+ years experience...",
    quickOptions: [
      'C-level executives',
      'Product managers',
      'End users / consumers',
      'Technical experts',
      'Procurement / buyers',
      'Industry analysts',
    ],
    icon: <Users className="h-5 w-5" />,
  },
  scope: {
    question: 'What are 2-3 key topics you want to explore?',
    placeholder: "e.g., Pricing sensitivity, feature priorities, switching costs...",
    quickOptions: [
      'Purchase decisions',
      'User experience',
      'Pain points & challenges',
      'Feature priorities',
      'Competitive landscape',
      'Future needs',
    ],
    icon: <List className="h-5 w-5" />,
  },
  duration: {
    question: 'How long should each interview be?',
    placeholder: "Select a duration or type your preference...",
    quickOptions: [
      '15 minutes',
      '20 minutes',
      '30 minutes',
      '45 minutes',
      '60 minutes',
    ],
    icon: <Clock className="h-5 w-5" />,
  },
};

export function ClarifyQuestions({
  detectedGaps,
  answers,
  onAnswerChange,
  selectedChips,
  onChipSelect,
}: ClarifyQuestionsProps) {
  // Only show max 2 questions at a time
  const visibleGaps = detectedGaps.slice(0, 2);

  if (visibleGaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">All set!</h3>
        <p className="text-muted-foreground max-w-md">
          We have everything we need to create your interview setup. Click Continue to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>
          Just {visibleGaps.length === 1 ? 'one quick question' : 'a couple quick questions'} to help us create the perfect setup...
        </span>
      </div>

      {/* Question cards */}
      <div className="space-y-4">
        {visibleGaps.map((gapId) => {
          const questionConfig = CLARIFICATION_QUESTIONS[gapId];
          const answer = answers[gapId] || '';
          const chips = selectedChips[gapId] || [];

          return (
            <QuestionCard
              key={gapId}
              gapId={gapId}
              question={questionConfig.question}
              placeholder={questionConfig.placeholder}
              quickOptions={questionConfig.quickOptions}
              icon={questionConfig.icon}
              answer={answer}
              onAnswerChange={(value) => onAnswerChange(gapId, value)}
              selectedChips={chips}
              onChipSelect={(chip) => onChipSelect(gapId, chip)}
              isDuration={gapId === 'duration'}
            />
          );
        })}
      </div>

      {/* Remaining questions indicator */}
      {detectedGaps.length > 2 && (
        <p className="text-xs text-muted-foreground text-center">
          {detectedGaps.length - 2} more question{detectedGaps.length - 2 > 1 ? 's' : ''} after this
        </p>
      )}
    </div>
  );
}

interface QuestionCardProps {
  gapId: string;
  question: string;
  placeholder: string;
  quickOptions: string[];
  icon: React.ReactNode;
  answer: string;
  onAnswerChange: (value: string) => void;
  selectedChips: string[];
  onChipSelect: (chip: string) => void;
  isDuration?: boolean;
}

function QuestionCard({
  gapId,
  question,
  placeholder,
  quickOptions,
  icon,
  answer,
  onAnswerChange,
  selectedChips,
  onChipSelect,
  isDuration,
}: QuestionCardProps) {
  const [showTextInput, setShowTextInput] = useState(false);

  const handleChipClick = (chip: string) => {
    if (isDuration) {
      // Duration is single-select, replace answer entirely
      onAnswerChange(chip);
      onChipSelect(chip);
    } else {
      // Multi-select for other questions
      onChipSelect(chip);
      // Update answer based on selected chips
      const newChips = selectedChips.includes(chip)
        ? selectedChips.filter((c) => c !== chip)
        : [...selectedChips, chip];
      
      // Combine chips with any custom text
      const customText = answer
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !quickOptions.includes(s))
        .join(', ');
      
      const combined = [...newChips, customText].filter(Boolean).join(', ');
      onAnswerChange(combined);
    }
  };

  const isChipSelected = (chip: string) => {
    if (isDuration) {
      return answer === chip;
    }
    return selectedChips.includes(chip);
  };

  return (
    <Card className="border-2 transition-colors hover:border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg font-medium">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick select chips */}
        <div className="flex flex-wrap gap-2">
          {quickOptions.map((option) => (
            <Badge
              key={option}
              variant={isChipSelected(option) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer px-3 py-1.5 text-sm font-normal transition-all hover:scale-105',
                isChipSelected(option)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary/10 hover:border-primary'
              )}
              onClick={() => handleChipClick(option)}
            >
              {option}
              {isChipSelected(option) && (
                <Check className="ml-1.5 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>

        {/* Custom input toggle and field */}
        {!isDuration && (
          <>
            {!showTextInput ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowTextInput(true)}
              >
                + Add custom answer
              </Button>
            ) : (
              <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[80px] resize-none"
                autoFocus
              />
            )}
          </>
        )}

        {/* For duration, show the custom input more subtly */}
        {isDuration && (
          <div className="pt-2 border-t">
            <input
              type="text"
              value={!quickOptions.includes(answer) ? answer : ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Or type a custom duration..."
              className="w-full text-sm px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Utility function to detect gaps from context dump
export function detectGaps(contextDump: string): GapType[] {
  const gaps: GapType[] = [];
  const text = contextDump.toLowerCase();

  // Check for objective/research question
  const objectivePatterns = [
    'understand', 'learn', 'discover', 'find out', 'explore',
    'research', 'investigate', 'goal', 'objective', 'question',
    'why', 'how', 'what drives', 'motivation',
  ];
  const hasObjective = objectivePatterns.some((p) => text.includes(p));
  if (!hasObjective && text.length > 20) {
    gaps.push('objective');
  }

  // Check for audience/who
  const audiencePatterns = [
    'interview', 'talk to', 'speak with', 'respondent', 'participant',
    'customer', 'user', 'expert', 'manager', 'executive', 'developer',
    'who', 'people', 'audience', 'target',
  ];
  const hasAudience = audiencePatterns.some((p) => text.includes(p));
  if (!hasAudience && text.length > 20) {
    gaps.push('audience');
  }

  // Check for scope/topics
  const scopePatterns = [
    'topic', 'area', 'subject', 'theme', 'cover', 'discuss',
    'focus', 'explore', 'about', 'regarding', 'concerning',
  ];
  const hasScope = scopePatterns.some((p) => text.includes(p));
  if (!hasScope && text.length > 50) {
    gaps.push('scope');
  }

  // Check for duration
  const durationPatterns = [
    'minute', 'hour', 'long', 'duration', 'time', 'length',
    '15', '20', '30', '45', '60',
  ];
  const hasDuration = durationPatterns.some((p) => text.includes(p));
  if (!hasDuration) {
    gaps.push('duration');
  }

  return gaps;
}
