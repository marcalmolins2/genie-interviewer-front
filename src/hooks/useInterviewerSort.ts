import { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

// Sort field types
export type SortField = 'name' | 'createdAt' | 'lastInterview' | 'lastModified' | 'archivedAt' | 'deletedAt';
export type SortDirection = 'asc' | 'desc';
export type ViewType = 'overview' | 'archive' | 'trash';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
  icon: typeof ArrowUp;
}

// Interface for items that can be sorted
export interface SortableInterviewer {
  name: string;
  createdAt: string;
  updatedAt?: string;
  lastInterviewDate?: string | null;
  archivedAt?: string | null;
  deletedAt?: string | null;
}

// Base sort options (shared across all views)
const BASE_SORT_OPTIONS: SortOption[] = [
  { field: 'name', direction: 'asc', label: 'Name (A → Z)', icon: ArrowUp },
  { field: 'name', direction: 'desc', label: 'Name (Z → A)', icon: ArrowDown },
  { field: 'createdAt', direction: 'desc', label: 'Created (Newest)', icon: ArrowDown },
  { field: 'createdAt', direction: 'asc', label: 'Created (Oldest)', icon: ArrowUp },
  { field: 'lastInterview', direction: 'desc', label: 'Last Interview (Recent)', icon: ArrowDown },
  { field: 'lastInterview', direction: 'asc', label: 'Last Interview (Oldest)', icon: ArrowUp },
  { field: 'lastModified', direction: 'desc', label: 'Modified (Recent)', icon: ArrowDown },
  { field: 'lastModified', direction: 'asc', label: 'Modified (Oldest)', icon: ArrowUp },
];

// Archive-specific options (Archived Date first)
const ARCHIVE_SORT_OPTIONS: SortOption[] = [
  { field: 'archivedAt', direction: 'desc', label: 'Archived (Recent)', icon: ArrowDown },
  { field: 'archivedAt', direction: 'asc', label: 'Archived (Oldest)', icon: ArrowUp },
  ...BASE_SORT_OPTIONS,
];

// Trash-specific options (Deleted Date first)
const TRASH_SORT_OPTIONS: SortOption[] = [
  { field: 'deletedAt', direction: 'desc', label: 'Deleted (Recent)', icon: ArrowDown },
  { field: 'deletedAt', direction: 'asc', label: 'Deleted (Oldest)', icon: ArrowUp },
  ...BASE_SORT_OPTIONS,
];

// Get sort options for a specific view
const getSortOptionsForView = (viewType: ViewType): SortOption[] => {
  switch (viewType) {
    case 'archive':
      return ARCHIVE_SORT_OPTIONS;
    case 'trash':
      return TRASH_SORT_OPTIONS;
    case 'overview':
    default:
      return BASE_SORT_OPTIONS;
  }
};

// Get default sort settings for a specific view
const getDefaultSort = (viewType: ViewType): { field: SortField; direction: SortDirection } => {
  switch (viewType) {
    case 'archive':
      return { field: 'archivedAt', direction: 'desc' };
    case 'trash':
      return { field: 'deletedAt', direction: 'desc' };
    case 'overview':
    default:
      return { field: 'createdAt', direction: 'desc' };
  }
};

// Get human-readable label for a sort field
export const getSortLabel = (field: SortField): string => {
  switch (field) {
    case 'name': return 'Name';
    case 'createdAt': return 'Created';
    case 'lastInterview': return 'Last Interview';
    case 'lastModified': return 'Modified';
    case 'archivedAt': return 'Archived';
    case 'deletedAt': return 'Deleted';
  }
};

export function useInterviewerSort(viewType: ViewType) {
  const defaultSort = getDefaultSort(viewType);
  const [sortField, setSortField] = useState<SortField>(defaultSort.field);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort.direction);

  const sortOptions = getSortOptionsForView(viewType);

  const sortItems = useCallback(<T extends SortableInterviewer>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'lastInterview': {
          const aDate = a.lastInterviewDate ? new Date(a.lastInterviewDate).getTime() : 0;
          const bDate = b.lastInterviewDate ? new Date(b.lastInterviewDate).getTime() : 0;
          // Push items without interviews to the end when sorting descending
          if (!a.lastInterviewDate && b.lastInterviewDate) return sortDirection === 'desc' ? 1 : -1;
          if (a.lastInterviewDate && !b.lastInterviewDate) return sortDirection === 'desc' ? -1 : 1;
          comparison = aDate - bDate;
          break;
        }
        case 'lastModified': {
          const aModified = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
          const bModified = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
          comparison = aModified - bModified;
          break;
        }
        case 'archivedAt': {
          const aDate = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
          const bDate = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
          comparison = aDate - bDate;
          break;
        }
        case 'deletedAt': {
          const aDate = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
          const bDate = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
          comparison = aDate - bDate;
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    sortOptions,
    sortItems,
    getSortLabel,
  };
}
