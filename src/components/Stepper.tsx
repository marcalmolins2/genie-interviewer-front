import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav className={cn('mb-8', className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          
          return (
            <li key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary bg-background',
                  isUpcoming && 'border-muted-foreground/30 text-muted-foreground'
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="ml-3">
                  <p className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary',
                    isUpcoming && 'text-muted-foreground'
                  )}>
                    {step.title}
                  </p>
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