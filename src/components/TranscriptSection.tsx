import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptSection as TranscriptSectionType } from '@/types';

interface TranscriptSectionProps {
  section: TranscriptSectionType;
  searchQuery?: string;
  defaultOpen?: boolean;
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

export function TranscriptSection({ section, searchQuery = '', defaultOpen = true }: TranscriptSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const hasMatch = searchQuery && (
    section.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.answer.bulletPoints.some(bp => bp.toLowerCase().includes(searchQuery.toLowerCase())) ||
    section.answer.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-medium text-foreground">
              {highlightText(section.question, searchQuery)}
            </p>
            {section.timestamp && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {section.timestamp}
              </span>
            )}
          </div>
          
          {!isOpen && section.answer.summary && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {highlightText(section.answer.summary, searchQuery)}
            </p>
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 pl-11 space-y-3">
          {section.answer.summary && (
            <p className="text-sm font-medium text-foreground">
              {highlightText(section.answer.summary, searchQuery)}
            </p>
          )}
          
          <ul className="space-y-1.5">
            {section.answer.bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                <span>{highlightText(point, searchQuery)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
