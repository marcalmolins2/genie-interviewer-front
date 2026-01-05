import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { interviewersService } from '@/services/interviewers';
import { Interviewer } from '@/types';
import { InterviewWelcome } from '@/components/interview/InterviewWelcome';
import { InterviewLive } from '@/components/interview/InterviewLive';
import { InterviewComplete } from '@/components/interview/InterviewComplete';
import { InterviewUnavailable } from '@/components/interview/InterviewUnavailable';

type InterviewState = 'loading' | 'unavailable' | 'welcome' | 'live' | 'complete';

export default function PublicInterview() {
  const { linkId } = useParams<{ linkId: string }>();
  const [state, setState] = useState<InterviewState>('loading');
  const [interviewer, setInterviewer] = useState<Interviewer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [interviewDuration, setInterviewDuration] = useState(0);

  useEffect(() => {
    if (linkId) {
      validateLink();
    }
  }, [linkId]);

  const validateLink = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundInterviewer = await interviewersService.getInterviewerByLinkId(linkId!);
    
    if (!foundInterviewer) {
      setErrorMessage('This interview link is invalid or has expired.');
      setState('unavailable');
      return;
    }

    if (foundInterviewer.status !== 'live') {
      setErrorMessage('This interview is currently not accepting participants. Please contact the interviewer.');
      setState('unavailable');
      return;
    }

    setInterviewer(foundInterviewer);
    setState('welcome');
  };

  const handleStartInterview = () => {
    setState('live');
  };

  const handleEndInterview = (duration: number) => {
    setInterviewDuration(duration);
    setState('complete');
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating interview link...</p>
        </div>
      </div>
    );
  }

  if (state === 'unavailable') {
    return <InterviewUnavailable message={errorMessage} />;
  }

  if (state === 'welcome' && interviewer) {
    return (
      <InterviewWelcome 
        agent={interviewer} 
        onStart={handleStartInterview} 
      />
    );
  }

  if (state === 'live' && interviewer) {
    return (
      <InterviewLive 
        agent={interviewer} 
        onEnd={handleEndInterview} 
      />
    );
  }

  if (state === 'complete') {
    return (
      <InterviewComplete 
        duration={interviewDuration}
      />
    );
  }

  return null;
}
