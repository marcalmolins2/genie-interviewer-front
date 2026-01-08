import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Quote } from 'lucide-react';
import { SessionCitation } from './SessionCitation';
import { FindingsCategory } from '@/types';
import { cn } from '@/lib/utils';

interface KeyFindingsListProps {
  categories: FindingsCategory[];
  interviewerId: string;
  sessionDates: Record<string, string>;
}

export function KeyFindingsList({ categories, interviewerId, sessionDates }: KeyFindingsListProps) {
  // Track open state for each category, all open by default
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => Object.fromEntries(categories.map(cat => [cat.id, true]))
  );

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Build a global citation number map across all categories
  const buildCitationMap = () => {
    const allSessionIds: string[] = [];
    categories.forEach(cat => {
      cat.findings.forEach(finding => {
        finding.sessionIds.forEach(id => {
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
      {categories.map((category) => {
        const isOpen = openCategories[category.id] ?? true;
        
        return (
          <Collapsible
            key={category.id}
            open={isOpen}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <Card>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-left">{category.category}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {category.findings.length} finding{category.findings.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} 
                  />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed px-0">
                    {category.summary}
                  </p>
                  
                  <div className="space-y-3">
                    {category.findings.map((finding) => (
                      <div 
                        key={finding.id} 
                        className="border rounded-lg p-4 bg-background space-y-3"
                      >
                        {/* Insight Statement */}
                        <p className="text-sm font-medium leading-relaxed">
                          {finding.insight}
                          {finding.sessionIds.length > 0 && (
                            <SessionCitation
                              sessions={getSessionInfo(finding.sessionIds)}
                              displayNumbers={getDisplayNumbers(finding.sessionIds)}
                              className="ml-1"
                            />
                          )}
                        </p>
                        
                        {/* Supporting Quote */}
                        <div className="relative bg-muted/50 rounded-md p-3 border-l-2 border-primary/30">
                          <Quote className="absolute top-2 left-2 h-3 w-3 text-primary/30" />
                          <p className="text-sm italic text-muted-foreground pl-4 leading-relaxed">
                            "{finding.supportingQuote.text}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
