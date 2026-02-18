import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, completedSteps = [], onStepClick, className }: StepperProps) {
  return (
    <nav className={cn('mb-8', className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep && !isCompleted;
          const isClickable = isCompleted || (onStepClick && index <= Math.max(...completedSteps, 0) + 1);
          
          return (
            <li key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center justify-center w-8 h-8 shrink-0 aspect-square rounded-full border-2 transition-colors',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary bg-background',
                    isUpcoming && 'border-muted-foreground/30 text-muted-foreground',
                    isClickable && 'cursor-pointer hover:border-primary/70',
                    !isClickable && 'cursor-not-allowed'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                
                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      isUpcoming && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                    {step.optional && (
                      <span className="text-xs text-muted-foreground font-normal border border-muted-foreground/30 rounded-full px-1.5 py-0.5 leading-none">
                        Optional
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-4 transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}