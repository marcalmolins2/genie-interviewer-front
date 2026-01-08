import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionCitation } from './SessionCitation';

interface InsightBullet {
  text: string;
  sessionIds: string[];
}

export interface InsightCategory {
  id: string;
  category: string;
  summary: string;
  insights: InsightBullet[];
}

interface KeyInsightsListProps {
  categories: InsightCategory[];
  interviewerId: string;
  sessionDates: Record<string, string>; // sessionId -> date mapping
}

export function KeyInsightsList({ categories, interviewerId, sessionDates }: KeyInsightsListProps) {
  // Build a global citation number map across all categories
  const buildCitationMap = () => {
    const allSessionIds: string[] = [];
    categories.forEach(cat => {
      cat.insights.forEach(insight => {
        insight.sessionIds.forEach(id => {
          if (!allSessionIds.includes(id)) {
            allSessionIds.push(id);
          }
        });
      });
    });
    return allSessionIds;
  };

  const allSessionIds = buildCitationMap();

  const getSessionInfo = (sessionIds: string[]) => {
    return sessionIds.map(id => ({
      id,
      date: sessionDates[id] || new Date().toISOString(),
      interviewerId,
    }));
  };

  const getDisplayNumbers = (sessionIds: string[]) => {
    return sessionIds.map(id => allSessionIds.indexOf(id) + 1);
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{category.category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.summary}
            </p>
            <ul className="space-y-2">
              {category.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span className="flex-1">
                    {insight.text}
                    {insight.sessionIds.length > 0 && (
                      <SessionCitation
                        sessions={getSessionInfo(insight.sessionIds)}
                        displayNumbers={getDisplayNumbers(insight.sessionIds)}
                        className="ml-1"
                      />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
