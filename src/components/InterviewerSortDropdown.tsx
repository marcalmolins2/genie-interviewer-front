import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUp, ArrowDown, ChevronDown, Check } from 'lucide-react';
import { SortField, SortDirection, SortOption } from '@/hooks/useInterviewerSort';

interface InterviewerSortDropdownProps {
  sortField: SortField;
  sortDirection: SortDirection;
  sortOptions: SortOption[];
  onSortChange: (field: SortField, direction: SortDirection) => void;
  getSortLabel: (field: SortField) => string;
}

export function InterviewerSortDropdown({
  sortField,
  sortDirection,
  sortOptions,
  onSortChange,
  getSortLabel,
}: InterviewerSortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Sort:</span> {getSortLabel(sortField)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-popover">
        {sortOptions.map((option, index) => {
          const isSelected = sortField === option.field && sortDirection === option.direction;
          const Icon = option.icon;
          // Add separator after each pair of options (asc/desc for same field)
          const showSeparator = index % 2 === 1 && index < sortOptions.length - 1;
          
          return (
            <React.Fragment key={`${option.field}-${option.direction}`}>
              <DropdownMenuItem
                onClick={() => onSortChange(option.field, option.direction)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {option.label}
                </span>
                {isSelected && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              {showSeparator && <DropdownMenuSeparator />}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
