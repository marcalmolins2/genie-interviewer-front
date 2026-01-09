import { Project, PROJECT_TYPE_LABELS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Plus, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
  loading?: boolean;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
  loading = false,
}: ProjectSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No projects yet. Create your first project to get started.</p>
        </div>
        <Card
          className="cursor-pointer border-dashed border-2 hover:border-primary hover:bg-muted/50 transition-colors"
          onClick={onCreateProject}
        >
          <CardContent className="flex items-center justify-center gap-2 py-6">
            <Plus className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary">Create New Project</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => {
        const isSelected = selectedProjectId === project.id;
        return (
          <Card
            key={project.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected 
                ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                : "hover:border-muted-foreground/50"
            )}
            onClick={() => onProjectSelect(project.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    isSelected ? "bg-primary/10" : "bg-muted"
                  )}>
                    <FolderOpen className={cn(
                      "h-5 w-5",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{project.name}</h4>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {PROJECT_TYPE_LABELS[project.projectType]}
                    </Badge>
                    {project.caseCode && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.caseCode}
                      </p>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <div className="shrink-0 p-1 bg-primary rounded-full">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Create New Project Card */}
      <Card
        className="cursor-pointer border-dashed border-2 hover:border-primary hover:bg-muted/50 transition-colors"
        onClick={onCreateProject}
      >
        <CardContent className="flex items-center justify-center gap-2 h-full min-h-[100px] py-6">
          <Plus className="h-5 w-5 text-primary" />
          <span className="font-medium text-primary">Create New Project</span>
        </CardContent>
      </Card>
    </div>
  );
}
