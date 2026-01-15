import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lightbulb,
  Plus,
  Eye,
  Check,
  X,
  Wand2,
  AlertCircle,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Suggestion {
  id: string;
  type: 'improvement' | 'addition' | 'warning' | 'coverage';
  title: string;
  description: string;
  action?: string; // Suggested text to add/replace
}

export interface PreviewChange {
  original: string;
  updated: string;
  summary: string;
}

interface AIRefinementSidebarProps {
  // Current content being edited
  currentContent: string;
  contentType: 'research-brief' | 'interview-guide';
  
  // Suggestions
  suggestions: Suggestion[];
  onApplySuggestion: (suggestion: Suggestion) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  onRefreshSuggestions: () => void;
  isLoadingSuggestions?: boolean;
  
  // Add context functionality
  onAddContext: (context: string) => Promise<PreviewChange | null>;
  onApplyContextChanges: (changes: PreviewChange) => void;
  
  // Selection improvement
  selectedText?: string;
  onImproveSelection: (text: string) => Promise<string | null>;
  onApplyImprovement: (improvedText: string) => void;
  
  // Coverage check
  coveredTopics?: string[];
  missingTopics?: string[];
}

export function AIRefinementSidebar({
  currentContent,
  contentType,
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  onRefreshSuggestions,
  isLoadingSuggestions = false,
  onAddContext,
  onApplyContextChanges,
  selectedText,
  onImproveSelection,
  onApplyImprovement,
  coveredTopics = [],
  missingTopics = [],
}: AIRefinementSidebarProps) {
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewChanges, setPreviewChanges] = useState<PreviewChange | null>(null);
  
  const [isImprovingSelection, setIsImprovingSelection] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);

  // Handle generating preview from additional context
  const handleGeneratePreview = useCallback(async () => {
    if (!additionalContext.trim()) return;
    
    setIsGeneratingPreview(true);
    try {
      const changes = await onAddContext(additionalContext);
      if (changes) {
        setPreviewChanges(changes);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [additionalContext, onAddContext]);

  // Handle applying the previewed changes
  const handleApplyChanges = useCallback(() => {
    if (previewChanges) {
      onApplyContextChanges(previewChanges);
      setPreviewChanges(null);
      setAdditionalContext('');
    }
  }, [previewChanges, onApplyContextChanges]);

  // Handle canceling preview
  const handleCancelPreview = useCallback(() => {
    setPreviewChanges(null);
  }, []);

  // Handle improving selected text
  const handleImproveSelection = useCallback(async () => {
    if (!selectedText) return;
    
    setIsImprovingSelection(true);
    try {
      const improved = await onImproveSelection(selectedText);
      if (improved) {
        setImprovedText(improved);
      }
    } catch (error) {
      console.error('Failed to improve selection:', error);
    } finally {
      setIsImprovingSelection(false);
    }
  }, [selectedText, onImproveSelection]);

  // Apply improved text
  const handleApplyImprovement = useCallback(() => {
    if (improvedText) {
      onApplyImprovement(improvedText);
      setImprovedText(null);
    }
  }, [improvedText, onApplyImprovement]);

  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'improvement':
        return <Wand2 className="h-4 w-4 text-primary" />;
      case 'addition':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'coverage':
        return <Check className="h-4 w-4 text-blue-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          AI Refinement
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefreshSuggestions}
          disabled={isLoadingSuggestions}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={cn("h-4 w-4", isLoadingSuggestions && "animate-spin")} />
        </Button>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-4 pb-4">
          {/* Selected Text Improvement */}
          {selectedText && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Improve Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border italic">
                  "{selectedText.length > 100 ? selectedText.slice(0, 100) + '...' : selectedText}"
                </div>
                
                {improvedText ? (
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Suggested improvement:</div>
                    <div className="text-xs bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-2 rounded">
                      {improvedText}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={handleApplyImprovement}>
                        <Check className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setImprovedText(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleImproveSelection}
                    disabled={isImprovingSelection}
                  >
                    {isImprovingSelection ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Improving...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3 mr-2" />
                        Improve this text
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Suggestions Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Suggestions
                {suggestions.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {suggestions.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : suggestions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No suggestions at the moment. Content looks good!
                </p>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="group p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {getSuggestionIcon(suggestion.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{suggestion.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs flex-1"
                          onClick={() => onApplySuggestion(suggestion)}
                        >
                          Apply
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => onDismissSuggestion(suggestion.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Add Context Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-500" />
                Add Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {previewChanges ? (
                // Preview mode
                <div className="space-y-3">
                  <div className="text-xs font-medium">Preview Changes:</div>
                  <div className="text-xs text-muted-foreground">
                    {previewChanges.summary}
                  </div>
                  <div className="max-h-32 overflow-auto rounded border bg-muted/30 p-2">
                    <div className="text-xs whitespace-pre-wrap">
                      {/* Show a diff-like view */}
                      <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
                        {previewChanges.updated.slice(0, 200)}
                        {previewChanges.updated.length > 200 && '...'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleApplyChanges}>
                      <Check className="h-3 w-3 mr-1" />
                      Apply Changes
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelPreview}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Input mode
                <>
                  <Textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="I forgot to mention that we also need to cover pricing discussions..."
                    className="min-h-[80px] text-sm resize-none"
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    variant="outline"
                    onClick={handleGeneratePreview}
                    disabled={!additionalContext.trim() || isGeneratingPreview}
                  >
                    {isGeneratingPreview ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-2" />
                        Preview Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Coverage Check */}
          {(coveredTopics.length > 0 || missingTopics.length > 0) && (
            <>
              <Separator />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    Topic Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coveredTopics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Covered
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {coveredTopics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                            className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          >
                            <Check className="h-2.5 w-2.5 mr-1" />
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {missingTopics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Consider adding
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {missingTopics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            className="text-xs border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400"
                          >
                            <Plus className="h-2.5 w-2.5 mr-1" />
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
