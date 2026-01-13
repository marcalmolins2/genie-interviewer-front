import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { interviewersService, agentsService } from '@/services/interviewers';
import { Agent, Interviewer, Channel, PRICE_BY_CHANNEL } from '@/types';
import { InterviewWelcome } from '@/components/interview/InterviewWelcome';
import { InterviewLive } from '@/components/interview/InterviewLive';
import { InterviewComplete } from '@/components/interview/InterviewComplete';
import { InterviewUnavailable } from '@/components/interview/InterviewUnavailable';

type InterviewState = 'loading' | 'unavailable' | 'welcome' | 'live' | 'complete';

// Helper to convert Interviewer to legacy Agent format
function toAgent(interviewer: Interviewer): Agent {
  return {
    id: interviewer.id,
    name: interviewer.name,
    title: interviewer.title,
    description: interviewer.description,
    archetype: interviewer.archetype,
    createdAt: interviewer.createdAt,
    updatedAt: interviewer.updatedAt,
    status: interviewer.status,
    language: interviewer.language,
    voiceId: interviewer.voiceId,
    channel: interviewer.channel,
    interviewsCount: interviewer.sessionsCount || 0,
    pricePerInterviewUsd: PRICE_BY_CHANNEL[interviewer.channel] || 50,
    contact: interviewer.contact,
    credentialsReady: interviewer.credentialsReady,
    projectId: interviewer.projectId,
    targetDuration: interviewer.targetDurationMin,
  };
}

export default function PublicInterview() {
  const { linkId } = useParams<{ linkId: string }>();
  const [state, setState] = useState<InterviewState>('loading');
  const [interviewer, setInterviewer] = useState<Agent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [interviewDuration, setInterviewDuration] = useState(0);

  useEffect(() => {
    if (linkId) {
      validateLink();
    }
  }, [linkId]);

  const validateLink = async () => {
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundInterviewer = await interviewersService.getAgentByLinkId(linkId!);
    
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

    setInterviewer(toAgent(foundInterviewer));
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
