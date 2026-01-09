import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, RotateCcw, Archive as ArchiveIcon, Eye, Copy, Trash2, Search, Filter, Phone, Globe, FolderOpen } from "lucide-react";
import { Agent, Channel, Project } from "@/types";
import { agentsService } from "@/services/interviewers";
import { toast } from "@/hooks/use-toast";
import { InterviewerStatusBadge } from "@/components/InterviewerStatusBadge";
import { useProjectContext } from "./InterviewersLayout";
import { useInterviewerSort } from "@/hooks/useInterviewerSort";
import { InterviewerSortDropdown } from "@/components/InterviewerSortDropdown";

interface ArchivedInterviewerWithLastDate extends Agent {
  lastInterviewDate?: string | null;
  project?: Project;
}

const channelIcons: Record<Channel, typeof Phone> = {
  inbound_call: Phone,
  web_link: Globe
};

const InterviewersArchive = () => {
  const navigate = useNavigate();
  const { projects } = useProjectContext();
  const [interviewers, setInterviewers] = useState<ArchivedInterviewerWithLastDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Sorting
  const { sortField, sortDirection, setSortField, setSortDirection, sortOptions, sortItems, getSortLabel } = useInterviewerSort('archive');

  const loadArchivedInterviewers = async () => {
    try {
      setLoading(true);
      const data = await agentsService.getArchivedAgents();
      
      // Fetch last interview dates for each interviewer
      const interviewersWithDates = await Promise.all(
        data.map(async (interviewer) => {
          const lastDate = await agentsService.getLastInterviewDate(interviewer.id);
          return { 
            ...interviewer, 
            lastInterviewDate: lastDate,
            project: projects.find(p => {
              if (['agent-genai-strategy', 'agent-1'].includes(interviewer.id)) return p.id === 'project-1';
              if (['agent-2', 'agent-3'].includes(interviewer.id)) return p.id === 'project-2';
              if (['agent-4', 'agent-web-link'].includes(interviewer.id)) return p.id === 'project-3';
              return false;
            })
          };
        })
      );
      
      setInterviewers(interviewersWithDates);
    } catch (error) {
      console.error("Failed to load archived interviewers:", error);
      toast({
        title: "Error",
        description: "Failed to load archived interviewers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchivedInterviewers();
  }, [projects]);

  // Get unique archetypes from interviewers
  const availableArchetypes = useMemo(() => {
    return [...new Set(interviewers.map(i => i.archetype))];
  }, [interviewers]);

  // Get unique projects from interviewers
  const availableProjects = useMemo(() => {
    return projects.filter(p => interviewers.some(i => i.project?.id === p.id));
  }, [interviewers, projects]);

  const filteredInterviewers = useMemo(() => {
    let filtered = interviewers.filter(interviewer =>
      interviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interviewer.archetype.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedChannels.length > 0) {
      filtered = filtered.filter(i => selectedChannels.includes(i.channel));
    }
    if (selectedArchetypes.length > 0) {
      filtered = filtered.filter(i => selectedArchetypes.includes(i.archetype));
    }
    if (selectedProjects.length > 0) {
      filtered = filtered.filter(i => i.project?.id && selectedProjects.includes(i.project.id));
    }

    // Apply sorting
    return sortItems(filtered);
  }, [interviewers, searchQuery, selectedChannels, selectedArchetypes, selectedProjects, sortField, sortDirection, sortItems]);

  const activeFilterCount = selectedChannels.length + selectedArchetypes.length + selectedProjects.length;

  const handleUnarchive = async () => {
    if (!selectedInterviewerId) return;
    
    try {
      await agentsService.unarchiveAgent(selectedInterviewerId);
      toast({
        description: "Unarchived",
      });
      setUnarchiveDialogOpen(false);
      setSelectedInterviewerId(null);
      loadArchivedInterviewers();
    } catch (error) {
      console.error("Failed to unarchive interviewer:", error);
      toast({
        title: "Error",
        description: "Failed to unarchive interviewer",
        variant: "destructive",
      });
    }
  };

  const openUnarchiveDialog = (interviewerId: string) => {
    setSelectedInterviewerId(interviewerId);
    setUnarchiveDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Archive</h1>
        <p className="text-muted-foreground mt-1">
          Archived interviewers are hidden from your active list
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <InterviewerSortDropdown
            sortField={sortField}
            sortDirection={sortDirection}
            sortOptions={sortOptions}
            onSortChange={(field, direction) => {
              setSortField(field);
              setSortDirection(direction);
            }}
            getSortLabel={getSortLabel}
          />

          <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => {
                      setSelectedChannels([]);
                      setSelectedArchetypes([]);
                      setSelectedProjects([]);
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <Separator />

              <Accordion type="multiple" className="w-full">
                {/* Channel Filter */}
                <AccordionItem value="channel" className="border-0">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-sm font-medium">Channel</span>
                      {selectedChannels.length > 0 && (
                        <Badge variant="secondary" className="ml-2 px-1.5 min-w-5 h-5 text-xs">
                          {selectedChannels.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="space-y-2 pt-2">
                      {(['inbound_call', 'web_link'] as Channel[]).map((channel) => (
                        <div key={channel} className="flex items-center space-x-2">
                          <Checkbox
                            id={`archive-channel-${channel}`}
                            checked={selectedChannels.includes(channel)}
                            onCheckedChange={(checked) => {
                              setSelectedChannels(
                                checked
                                  ? [...selectedChannels, channel]
                                  : selectedChannels.filter((c) => c !== channel)
                              );
                            }}
                          />
                          <Label htmlFor={`archive-channel-${channel}`} className="text-sm font-normal cursor-pointer">
                            {channel.replace('_', ' ').charAt(0).toUpperCase() + channel.replace('_', ' ').slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Archetype Filter */}
                <AccordionItem value="archetype" className="border-0">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-sm font-medium">Archetype</span>
                      {selectedArchetypes.length > 0 && (
                        <Badge variant="secondary" className="ml-2 px-1.5 min-w-5 h-5 text-xs">
                          {selectedArchetypes.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="space-y-2 pt-2">
                      {availableArchetypes.map((archetype) => (
                        <div key={archetype} className="flex items-center space-x-2">
                          <Checkbox
                            id={`archive-archetype-${archetype}`}
                            checked={selectedArchetypes.includes(archetype)}
                            onCheckedChange={(checked) => {
                              setSelectedArchetypes(
                                checked
                                  ? [...selectedArchetypes, archetype]
                                  : selectedArchetypes.filter((a) => a !== archetype)
                              );
                            }}
                          />
                          <Label htmlFor={`archive-archetype-${archetype}`} className="text-sm font-normal cursor-pointer">
                            {archetype.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Project Filter */}
                <AccordionItem value="project" className="border-0">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-sm font-medium">Project</span>
                      {selectedProjects.length > 0 && (
                        <Badge variant="secondary" className="ml-2 px-1.5 min-w-5 h-5 text-xs">
                          {selectedProjects.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="space-y-2 pt-2">
                      {availableProjects.map((project) => (
                        <div key={project.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`archive-project-${project.id}`}
                            checked={selectedProjects.includes(project.id)}
                            onCheckedChange={(checked) => {
                              setSelectedProjects(
                                checked
                                  ? [...selectedProjects, project.id]
                                  : selectedProjects.filter((p) => p !== project.id)
                              );
                            }}
                          />
                          <Label htmlFor={`archive-project-${project.id}`} className="text-sm font-normal cursor-pointer">
                            {project.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </PopoverContent>
        </Popover>
        </div>
      </div>

      {interviewers.length === 0 ? (
        <Card className="p-12 text-center">
          <ArchiveIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No archived interviewers</h3>
          <p className="text-muted-foreground">
            Interviewers you archive will appear here
          </p>
        </Card>
      ) : filteredInterviewers.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInterviewers.map((interviewer) => {
            const ChannelIcon = channelIcons[interviewer.channel as Channel];
            return (
              <Card key={interviewer.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">{interviewer.name}</h3>
                      <InterviewerStatusBadge status={interviewer.status} />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {interviewer.archetype.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <ChannelIcon className="h-3 w-3" />
                        {interviewer.channel.replace('_', ' ')}
                      </Badge>
                      {interviewer.project && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <FolderOpen className="w-3 h-3" />
                          {interviewer.project.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Sessions: {interviewer.interviewsCount}</span>
                      {interviewer.lastInterviewDate && (
                        <>
                          <span>•</span>
                          <span>Last interview: {formatDate(interviewer.lastInterviewDate)}</span>
                        </>
                      )}
                      {interviewer.archivedAt && (
                        <>
                          <span>•</span>
                          <span>Archived: {formatDate(interviewer.archivedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUnarchiveDialog(interviewer.id)}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Unarchive
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/interviewers/${interviewer.id}`)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement duplicate functionality
                        toast({
                          description: "Duplicate functionality coming soon",
                        });
                      }}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await agentsService.moveToTrash(interviewer.id);
                          toast({
                            description: "Moved to trash",
                          });
                          loadArchivedInterviewers();
                        } catch (error) {
                          if (error instanceof Error && error.message === 'ACTIVE_CALL_IN_PROGRESS') {
                            toast({
                              title: "Cannot move to trash",
                              description: "This interviewer has an active call in progress. Please wait until the call ends before moving to trash.",
                              variant: "destructive",
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: "Failed to delete interviewer",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Unarchive Confirmation Dialog */}
      <AlertDialog open={unarchiveDialogOpen} onOpenChange={setUnarchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unarchive interviewer</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the interviewer in Paused state
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnarchive}>Unarchive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InterviewersArchive;