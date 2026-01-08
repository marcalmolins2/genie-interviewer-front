import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TopicFinding } from '@/types';

interface SessionTopicFindingsProps {
  findings?: TopicFinding[];
}

export function SessionTopicFindings({ findings }: SessionTopicFindingsProps) {
  // Initialize all topics as open by default
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>(() => {
    if (!findings) return {};
    return findings.reduce((acc, f) => ({ ...acc, [f.id]: true }), {});
  });

  const toggleTopic = (id: string) => {
    setOpenTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!findings || findings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm">Topic findings not available for this session.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground px-1">Topic Findings</h3>
      
      {findings.map((finding) => (
        <Collapsible
          key={finding.id}
          open={openTopics[finding.id]}
          onOpenChange={() => toggleTopic(finding.id)}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <button className="w-full text-left">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <h4 className="font-medium">{finding.topicName}</h4>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                      openTopics[finding.id] && "rotate-180"
                    )}
                  />
                </CardContent>
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="px-4 pb-4 pt-0 space-y-4">
                <p className="text-sm text-muted-foreground">{finding.summary}</p>
                
                {finding.keyInsights.length > 0 && (
                  <ul className="space-y-1.5">
                    {finding.keyInsights.map((insight, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {finding.supportingQuote && (
                  <div className="border-l-2 border-muted pl-4 py-2 bg-muted/30 rounded-r">
                    <div className="flex items-start gap-2">
                      <Quote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm italic text-muted-foreground">
                        "{finding.supportingQuote.text}"
                      </p>
                    </div>
                    {finding.supportingQuote.timestamp && (
                      <p className="text-xs text-muted-foreground mt-2 ml-6">
                        @ {finding.supportingQuote.timestamp}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}
