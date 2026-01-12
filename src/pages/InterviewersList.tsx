import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { InterviewerStatusBadge } from '@/components/InterviewerStatusBadge';
import { Plus, Search, MoreHorizontal, Edit, Phone, Globe, Users, Archive as ArchiveIcon, Trash2, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Agent, Channel, AgentStatus, Project, PROJECT_TYPE_LABELS } from '@/types';
import { interviewersService, agentsService } from '@/services/interviewers';
import { useToast } from '@/hooks/use-toast';
import { useProjectContext } from './InterviewersLayout';
import { cn } from '@/lib/utils';
import { useInterviewerSort } from '@/hooks/useInterviewerSort';
import { InterviewerSortDropdown } from '@/components/InterviewerSortDropdown';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const channelIcons: Record<Channel, typeof Phone> = {
  inbound_call: Phone,
  web_link: Globe
};

interface InterviewerWithProject extends Agent {
  project?: Project;
  lastInterviewDate?: string | null;
}

// Smart button that routes based on feature flag availability
function NewInterviewerButton() {
  const assistedEnabled = useFeatureFlag('ASSISTED_CONFIGURATION');
  const manualEnabled = useFeatureFlag('MANUAL_CONFIGURATION');
  
  // Determine the target route based on flags
  const getTargetRoute = () => {
    if (assistedEnabled && manualEnabled) {
      // Both enabled: show selector
      return '/app/interviewers/new';
    } else if (assistedEnabled) {
      // Only assisted enabled
      return '/app/interviewers/new/assisted';
    } else if (manualEnabled) {
      // Only manual enabled: go directly to manual
      return '/app/interviewers/new/manual';
    }
    // Fallback (shouldn't happen - at least one should be enabled)
    return '/app/interviewers/new';
  };

  return (
    <Link to={getTargetRoute()}>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        New Interviewer
      </Button>
    </Link>
  );
}

export default function InterviewersList() {
  const [interviewers, setInterviewers] = useState<InterviewerWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<AgentStatus[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string | null>(null);
  const { sortField, sortDirection, setSortField, setSortDirection, sortOptions, sortItems, getSortLabel } = useInterviewerSort('overview');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedProjectId, projects } = useProjectContext();

  useEffect(() => {
    loadInterviewers();
  }, []);

  const loadInterviewers = async () => {
    try {
      const data = await agentsService.getAgents();
      // Attach project info and last interview date to interviewers
      const interviewersWithProjects = await Promise.all(data.map(async (interviewer) => {
        // Get sessions for this interviewer to find last interview date
        const interviews = await agentsService.getAgentInterviews(interviewer.id);
        const liveInterviews = interviews.filter(i => i.completed && i.conversationType === 'live');
        const lastInterview = liveInterviews.sort((a, b) => 
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        )[0];
        
        return {
          ...interviewer,
          project: projects.find(p => {
            // Map mock agents to mock projects for demo
            if (['agent-genai-strategy', 'agent-1'].includes(interviewer.id)) return p.id === 'project-1';
            if (['agent-2', 'agent-3'].includes(interviewer.id)) return p.id === 'project-2';
            if (['agent-4', 'agent-web-link'].includes(interviewer.id)) return p.id === 'project-3';
            return false;
          }),
          lastInterviewDate: lastInterview?.startedAt || null
        };
      }));
      setInterviewers(interviewersWithProjects);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load interviewers. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Re-attach projects when projects change
  useEffect(() => {
    if (projects.length > 0 && interviewers.length > 0) {
      setInterviewers(prev => prev.map(interviewer => ({
        ...interviewer,
        project: projects.find(p => {
          if (['agent-genai-strategy', 'agent-1'].includes(interviewer.id)) return p.id === 'project-1';
          if (['agent-2', 'agent-3'].includes(interviewer.id)) return p.id === 'project-2';
          if (['agent-4', 'agent-web-link'].includes(interviewer.id)) return p.id === 'project-3';
          return false;
        })
      })));
    }
  }, [projects]);

  // Base interviewers count (before search/filters, respects project selection)
  const baseInterviewers = useMemo(() => {
    if (selectedProjectId) {
      return interviewers.filter(i => i.project?.id === selectedProjectId);
    }
    return interviewers;
  }, [interviewers, selectedProjectId]);

  const filteredInterviewers = useMemo(() => {
    let filtered = interviewers.filter(interviewer => 
      interviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      interviewer.archetype.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by selected project
    if (selectedProjectId) {
      filtered = filtered.filter(i => i.project?.id === selectedProjectId);
    }

    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(interviewer => selectedStatuses.includes(interviewer.status));
    }

    // Apply channel filter
    if (selectedChannels.length > 0) {
      filtered = filtered.filter(interviewer => selectedChannels.includes(interviewer.channel));
    }

    // Apply archetype filter
    if (selectedArchetypes.length > 0) {
      filtered = filtered.filter(interviewer => selectedArchetypes.includes(interviewer.archetype));
    }

    // Apply project filter (only when viewing all interviewers, not when a specific project is selected)
    if (!selectedProjectId && selectedProjects.length > 0) {
      filtered = filtered.filter(interviewer => 
        interviewer.project?.id && selectedProjects.includes(interviewer.project.id)
      );
    }

    // Apply sorting using hook
    return sortItems(filtered);
  }, [interviewers, searchQuery, selectedStatuses, selectedChannels, selectedArchetypes, selectedProjectId, selectedProjects, sortField, sortDirection, sortItems]);


  const handleActivate = async (interviewer: Agent) => {
    try {
      const updatedInterviewer = await agentsService.activateAgent(interviewer.id);
      setInterviewers(prev => prev.map(i => i.id === interviewer.id ? { ...i, ...updatedInterviewer } : i));
      toast({
        title: 'Success',
        description: 'Interviewer activated successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate interviewer.',
        variant: 'destructive'
      });
    }
  };

  const handleMoveToTrash = async (interviewerId: string) => {
    try {
      await agentsService.moveToTrash(interviewerId);
      toast({
        title: 'Interviewer moved to trash',
        description: 'The interviewer will be permanently deleted after 30 days.'
      });
      loadInterviewers();
    } catch (error) {
      if (error instanceof Error && error.message === 'ACTIVE_CALL_IN_PROGRESS') {
        toast({
          title: 'Cannot move to trash',
          description: 'This interviewer has an active call in progress.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to move interviewer to trash.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleArchive = async () => {
    if (!selectedInterviewerId) return;
    
    try {
      await agentsService.archiveAgent(selectedInterviewerId);
      toast({ description: 'Archived' });
      setArchiveDialogOpen(false);
      setSelectedInterviewerId(null);
      loadInterviewers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive interviewer.',
        variant: 'destructive'
      });
    }
  };

  const openArchiveDialog = (interviewerId: string) => {
    setSelectedInterviewerId(interviewerId);
    setArchiveDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  const renderInterviewerCard = (interviewer: InterviewerWithProject) => {
    const ChannelIcon = channelIcons[interviewer.channel as Channel];
    return (
      <Card 
        key={interviewer.id} 
        className="hover:shadow-lg hover:border-primary/30 hover:bg-accent/5 transition-all duration-200 border-border/20 bg-card cursor-pointer group" 
        onClick={() => navigate(`/app/interviewers/${interviewer.id}`)}
      >
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {interviewer.name}
                </h3>
              </div>
              <InterviewerStatusBadge status={interviewer.status} />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  navigate(`/app/interviewers/${interviewer.id}/edit`);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  openArchiveDialog(interviewer.id);
                }}>
                  <ArchiveIcon className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={e => {
                    e.stopPropagation();
                    handleMoveToTrash(interviewer.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {interviewer.archetype.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <ChannelIcon className="h-3 w-3" />
              {interviewer.channel.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{interviewer.interviewsCount || 0} sessions</span>
            <span>Created {formatDate(interviewer.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {selectedProject ? selectedProject.name : 'Overview'}
          </h1>
          <p className="text-muted-foreground">
            {selectedProject ? (
              <span className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedProject.caseCode}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {PROJECT_TYPE_LABELS[selectedProject.projectType]}
                </Badge>
              </span>
            ) : (
              'Manage your interviewers and view performance'
            )}
          </p>
        </div>
        
        <NewInterviewerButton />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search interviewers..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-10" 
          />
        </div>
        
        <div className="flex gap-2">
          {/* Sort dropdown */}
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
                {(selectedStatuses.length > 0 || selectedChannels.length > 0 || selectedArchetypes.length > 0 || selectedProjects.length > 0) && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {selectedStatuses.length + selectedChannels.length + selectedArchetypes.length + selectedProjects.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filters</h4>
                  {(selectedStatuses.length > 0 || selectedChannels.length > 0 || selectedArchetypes.length > 0 || selectedProjects.length > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => {
                        setSelectedStatuses([]);
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
                  {/* Status Filter */}
                  <AccordionItem value="status" className="border-0">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-2">
                        <span className="text-sm font-medium">Status</span>
                        {selectedStatuses.length > 0 && (
                          <Badge variant="secondary" className="ml-2 px-1.5 min-w-5 h-5 text-xs">
                            {selectedStatuses.length}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <div className="space-y-2 pt-2">
                        {(['live', 'suspended', 'ready_to_test', 'finished'] as AgentStatus[]).map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={(checked) => {
                                setSelectedStatuses(
                                  checked
                                    ? [...selectedStatuses, status]
                                    : selectedStatuses.filter((s) => s !== status)
                                );
                              }}
                            />
                            <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                              {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

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
                              id={`channel-${channel}`}
                              checked={selectedChannels.includes(channel)}
                              onCheckedChange={(checked) => {
                                setSelectedChannels(
                                  checked
                                    ? [...selectedChannels, channel]
                                    : selectedChannels.filter((c) => c !== channel)
                                );
                              }}
                            />
                            <Label htmlFor={`channel-${channel}`} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                              {React.createElement(channelIcons[channel], { className: "h-4 w-4" })}
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
                      <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                        {['expert_deep_dive', 'client_stakeholder', 'customer_user', 'rapid_survey', 'diagnostic', 'investigative', 'panel_moderator'].map((archetype) => (
                          <div key={archetype} className="flex items-center space-x-2">
                            <Checkbox
                              id={`archetype-${archetype}`}
                              checked={selectedArchetypes.includes(archetype)}
                              onCheckedChange={(checked) => {
                                setSelectedArchetypes(
                                  checked
                                    ? [...selectedArchetypes, archetype]
                                    : selectedArchetypes.filter((a) => a !== archetype)
                                );
                              }}
                            />
                            <Label htmlFor={`archetype-${archetype}`} className="text-sm font-normal cursor-pointer">
                              {archetype.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Project Filter - only show when viewing all interviewers */}
                  {!selectedProjectId && (
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
                        <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                          {projects.map((project) => (
                            <div key={project.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`project-${project.id}`}
                                checked={selectedProjects.includes(project.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedProjects(
                                    checked
                                      ? [...selectedProjects, project.id]
                                      : selectedProjects.filter((p) => p !== project.id)
                                  );
                                }}
                              />
                              <Label htmlFor={`project-${project.id}`} className="text-sm font-normal cursor-pointer">
                                {project.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredInterviewers.length === baseInterviewers.length ? (
          <span>{baseInterviewers.length} interviewer{baseInterviewers.length !== 1 ? 's' : ''}</span>
        ) : (
          <span>Showing {filteredInterviewers.length} of {baseInterviewers.length} interviewer{baseInterviewers.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Interviewers */}
      {filteredInterviewers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">
            {searchQuery ? 'No interviewers found' : 'No interviewers yet'}
          </CardTitle>
          <CardDescription className="mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : selectedProject 
                ? `Create your first interviewer in ${selectedProject.name}` 
                : 'Create your first interviewer to get started'}
          </CardDescription>
          {!searchQuery && (
            <Link to="/app/interviewers/new/assisted">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Interviewer
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterviewers.map(renderInterviewerCard)}
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive interviewer</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the interviewer from your overview and disable new calls
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
