import { useState, useEffect, useMemo } from 'react';
import { Project, PROJECT_TYPE_LABELS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FolderOpen, Plus, Check, ChevronsUpDown, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const RECENT_PROJECTS_KEY = 'genie_recent_project_ids';
const MAX_RECENT = 3;

function getRecentProjectIds(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentProject(projectId: string): void {
  const recent = getRecentProjectIds().filter(id => id !== projectId);
  recent.unshift(projectId);
  localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

interface ProjectComboboxProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
  loading?: boolean;
}

export function ProjectCombobox({
  projects,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
  loading = false,
}: ProjectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Load recent projects on mount
  useEffect(() => {
    setRecentIds(getRecentProjectIds());
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Compute recent projects (only those that still exist)
  const recentProjects = useMemo(() => {
    return recentIds
      .map(id => projects.find(p => p.id === id))
      .filter((p): p is Project => p !== undefined);
  }, [recentIds, projects]);

  // All projects excluding recent ones (to avoid duplicates)
  const otherProjects = useMemo(() => {
    const recentIdSet = new Set(recentIds);
    return projects.filter(p => !recentIdSet.has(p.id));
  }, [projects, recentIds]);

  const handleSelect = (projectId: string) => {
    addRecentProject(projectId);
    setRecentIds(getRecentProjectIds());
    onProjectSelect(projectId);
    setOpen(false);
  };

  const handleCreateProject = () => {
    setOpen(false);
    onCreateProject();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[52px] px-4 py-3"
          disabled={loading && projects.length === 0}
        >
          {loading && projects.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading projects...</span>
            </div>
          ) : selectedProject ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="font-medium truncate">{selectedProject.name}</span>
                <Badge variant="secondary" className="text-xs mt-0.5">
                  {PROJECT_TYPE_LABELS[selectedProject.projectType]}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              <span>Select a project...</span>
            </div>
          )}
          {selectedProject ? (
            <span className="ml-2 text-sm text-primary hover:underline shrink-0">
              Change
            </span>
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">No projects found</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateProject}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Project
                </Button>
              </div>
            </CommandEmpty>

            {/* Recent Projects */}
            {recentProjects.length > 0 && (
              <CommandGroup heading="Recent">
                {recentProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`${project.name} ${project.caseCode || ''}`}
                    onSelect={() => handleSelect(project.id)}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{project.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {PROJECT_TYPE_LABELS[project.projectType]}
                        </Badge>
                        {project.caseCode && (
                          <span className="text-xs text-muted-foreground">{project.caseCode}</span>
                        )}
                      </div>
                    </div>
                    {selectedProjectId === project.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* All Projects */}
            {otherProjects.length > 0 && (
              <CommandGroup heading="All Projects">
                {otherProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`${project.name} ${project.caseCode || ''}`}
                    onSelect={() => handleSelect(project.id)}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                  >
                    <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{project.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {PROJECT_TYPE_LABELS[project.projectType]}
                        </Badge>
                        {project.caseCode && (
                          <span className="text-xs text-muted-foreground">{project.caseCode}</span>
                        )}
                      </div>
                    </div>
                    {selectedProjectId === project.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* No projects at all */}
            {projects.length === 0 && !loading && (
              <div className="py-6 text-center">
                <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No projects yet</p>
              </div>
            )}

            {/* Create New Project action */}
            {projects.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateProject}
                    className="flex items-center gap-3 py-2.5 cursor-pointer text-primary"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Create New Project</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
