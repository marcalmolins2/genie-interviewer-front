import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { SessionFeedback as SessionFeedbackType } from '@/types';

interface SessionFeedbackProps {
  sessionId: string;
  currentFeedback?: SessionFeedbackType | null;
  onFeedbackSubmit?: (feedback: SessionFeedbackType) => void;
  compact?: boolean;
}

export function SessionFeedback({
  sessionId,
  currentFeedback,
  onFeedbackSubmit,
  compact = false,
}: SessionFeedbackProps) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(
    currentFeedback?.rating ?? null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [negativeReason, setNegativeReason] = useState(currentFeedback?.negativeReason ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleThumbsUp = () => {
    const newRating: 'positive' = 'positive';
    setRating(newRating);
    submitFeedback(newRating);
  };

  const handleThumbsDown = () => {
    setRating('negative');
    setIsDialogOpen(true);
  };

  const submitFeedback = async (
    feedbackRating: 'positive' | 'negative',
    reason?: string
  ) => {
    setIsSubmitting(true);
    
    const feedback: SessionFeedbackType = {
      sessionId,
      rating: feedbackRating,
      negativeReason: reason,
      submittedAt: new Date().toISOString(),
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    onFeedbackSubmit?.(feedback);
    setIsSubmitting(false);

    toast({
      title: 'Feedback submitted',
      description: feedbackRating === 'positive' 
        ? 'Thank you for your positive feedback!' 
        : 'Thank you for your feedback. We will review your comments.',
    });
  };

  const handleSubmitNegativeFeedback = async () => {
    if (!negativeReason.trim()) return;
    await submitFeedback('negative', negativeReason);
    setIsDialogOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // If dialog is closed without submitting, reset rating
      if (!currentFeedback?.rating) {
        setRating(null);
      }
      setNegativeReason(currentFeedback?.negativeReason ?? '');
    }
    setIsDialogOpen(open);
  };

  return (
    <>
      <div className={cn('flex items-center gap-2', compact ? 'gap-1' : 'gap-2')}>
        {!compact && (
          <span className="text-sm text-muted-foreground mr-1">Rate this session:</span>
        )}
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'transition-colors',
            rating === 'positive'
              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900'
              : 'text-muted-foreground hover:text-emerald-600'
          )}
          onClick={handleThumbsUp}
          disabled={isSubmitting}
        >
          <ThumbsUp className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
        </Button>
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'transition-colors',
            rating === 'negative'
              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900'
              : 'text-muted-foreground hover:text-rose-600'
          )}
          onClick={handleThumbsDown}
          disabled={isSubmitting}
        >
          <ThumbsDown className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>What could have been better?</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve the interview quality.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={negativeReason}
            onChange={(e) => setNegativeReason(e.target.value)}
            placeholder="Please describe the issue you experienced..."
            className="min-h-[120px]"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right">
            {negativeReason.length}/500
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogClose(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNegativeFeedback}
              disabled={!negativeReason.trim() || isSubmitting}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
