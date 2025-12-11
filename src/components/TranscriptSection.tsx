import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptSection as TranscriptSectionType } from '@/types';

interface TranscriptSectionProps {
  section: TranscriptSectionType;
  searchQuery?: string;
  defaultOpen?: boolean;
  viewMode?: 'clean' | 'original';
}

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {part}
      </mark>
    ) : part
  );
};

export function TranscriptSection({ section, searchQuery = '', defaultOpen = true, viewMode = 'clean' }: TranscriptSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const hasMatch = searchQuery && (
    section.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.answer.bulletPoints.some(bp => bp.toLowerCase().includes(searchQuery.toLowerCase())) ||
    section.answer.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.answer.rawText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasCleanContent = section.answer.summary || section.answer.bulletPoints.length > 0;
  const hasOriginalContent = !!section.answer.rawText;

  return (
    <div 
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        hasMatch && "ring-2 ring-primary/50 border-primary/30",
        "bg-card"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex-shrink-0 mt-0.5">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">
            {highlightText(section.question, searchQuery)}
          </p>
          
          {!isOpen && section.answer.summary && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {highlightText(section.answer.summary, searchQuery)}
            </p>
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 pl-11 space-y-3">
          {viewMode === 'clean' ? (
            hasCleanContent ? (
              <>
                {section.answer.summary && (
                  <p className="text-sm font-medium text-foreground">
                    {highlightText(section.answer.summary, searchQuery)}
                  </p>
                )}
                
                {section.answer.bulletPoints.length > 0 && (
                  <ul className="space-y-1.5 list-disc list-inside marker:text-primary">
                    {section.answer.bulletPoints.map((point, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {highlightText(point, searchQuery)}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Clean transcript not available for this section.
              </p>
            )
          ) : (
            hasOriginalContent ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {highlightText(section.answer.rawText!, searchQuery)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Original transcript not available for this section.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
