import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TranscriptSearchProps {
  onSearch: (query: string) => void;
  matchCount?: number;
  placeholder?: string;
}

export function TranscriptSearch({ onSearch, matchCount, placeholder = "Search transcript..." }: TranscriptSearchProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(query);
    }, 200);
    
    return () => clearTimeout(debounce);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {query && matchCount !== undefined && (
        <Badge variant="secondary" className="whitespace-nowrap">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
        </Badge>
      )}
    </div>
  );
}
