import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/types';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { LiveTranscript, TranscriptMessage } from './LiveTranscript';
import { cn } from '@/lib/utils';

interface InterviewLiveProps {
  agent: Agent;
  onEnd: (duration: number) => void;
}

// Mock interview questions based on interviewer type
const mockQuestions = [
  "Hello! Thank you for joining this interview. Before we begin, could you briefly introduce yourself and your role?",
  "That's great context. Now, thinking about your day-to-day work, what are the biggest challenges you face?",
  "Interesting perspective. Can you tell me more about how you currently address those challenges?",
  "I see. Looking ahead, what improvements or changes would make the biggest difference for you?",
  "Thank you for sharing that. Is there anything else you'd like to add before we wrap up?"
];

const mockResponses = [
  "I'm a project manager with about 5 years of experience in the tech industry.",
  "The biggest challenge is definitely coordinating across multiple teams with different priorities and timelines.",
  "We use a combination of weekly syncs, shared documentation, and project management tools to stay aligned.",
  "Better real-time visibility into project status and automated progress tracking would be game-changers.",
  "I think the key is finding tools that integrate well with our existing workflows rather than adding more complexity."
];

export function InterviewLive({ agent, onEnd }: InterviewLiveProps) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for interview duration
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start the mock interview flow
  useEffect(() => {
    // Initial AI greeting
    const greetingTimer = setTimeout(() => {
      addAiMessage(mockQuestions[0]);
    }, 1500);

    return () => clearTimeout(greetingTimer);
  }, []);

  // Progress the mock conversation
  useEffect(() => {
    if (currentQuestionIndex > 0 && currentQuestionIndex < mockQuestions.length) {
      // Simulate user response after AI question
      const userResponseTimer = setTimeout(() => {
        addUserMessage(mockResponses[currentQuestionIndex - 1]);
        
        // Then AI asks next question
        const nextQuestionTimer = setTimeout(() => {
          if (currentQuestionIndex < mockQuestions.length) {
            addAiMessage(mockQuestions[currentQuestionIndex]);
          }
        }, 2000);
        
        questionTimerRef.current = nextQuestionTimer;
      }, 3000);

      return () => {
        clearTimeout(userResponseTimer);
        if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
      };
    }
  }, [currentQuestionIndex]);

  const addAiMessage = (content: string) => {
    setIsAiSpeaking(true);
    
    // Simulate typing effect
    setMessages(prev => [...prev, {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
    }]);

    // Simulate speaking duration
    setTimeout(() => {
      setIsAiSpeaking(false);
      setCurrentQuestionIndex(prev => prev + 1);
    }, 2000);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }]);
  };

  const toggleMic = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setIsSpeaking(false);
    }
  };

  const handleEndInterview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
    onEnd(duration);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate random speaking when mic is on
  useEffect(() => {
    if (isRecording && !isAiSpeaking) {
      const speakingInterval = setInterval(() => {
        setIsSpeaking(prev => !prev);
      }, 500 + Math.random() * 1000);

      return () => clearInterval(speakingInterval);
    } else {
      setIsSpeaking(false);
    }
  }, [isRecording, isAiSpeaking]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">Interview in progress</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono text-lg">{formatDuration(duration)}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={handleEndInterview}>
              <PhoneOff className="h-4 w-4 mr-2" />
              End Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        {/* Transcript Panel */}
        <div className="flex-1 border-r">
          <LiveTranscript messages={messages} isAiSpeaking={isAiSpeaking} />
        </div>

        {/* Voice Controls Panel */}
        <div className="w-80 p-6 flex flex-col items-center justify-center bg-muted/30">
          <div className="text-center space-y-6">
            {/* Speaking Indicator */}
            <div className="space-y-2">
              {isAiSpeaking ? (
                <>
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/40 flex items-center justify-center animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">AI is speaking...</p>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleMic}
                    className={cn(
                      'w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all',
                      isRecording 
                        ? isSpeaking 
                          ? 'bg-primary ring-4 ring-primary/30 ring-offset-4 ring-offset-background' 
                          : 'bg-primary hover:bg-primary/90'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {isRecording ? (
                      <Mic className="h-10 w-10 text-primary-foreground" />
                    ) : (
                      <MicOff className="h-10 w-10 text-muted-foreground" />
                    )}
                  </button>
                  <p className="text-sm text-muted-foreground">
                    {isRecording 
                      ? isSpeaking 
                        ? 'Listening...' 
                        : 'Tap to mute' 
                      : 'Tap to unmute'
                    }
                  </p>
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground max-w-[200px]">
              <p>Speak naturally. The AI will listen and respond to your answers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
