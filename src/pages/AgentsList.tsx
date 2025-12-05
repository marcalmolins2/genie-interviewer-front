import { useState, useEffect } from 'react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AgentStatusBadge } from '@/components/AgentStatusBadge';
import { Plus, Search, MoreHorizontal, Edit, MessageCircle, Phone, PhoneCall, Users, Archive as ArchiveIcon, Trash2, ChevronRight, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Agent, Channel, AgentStatus } from '@/types';
import { agentsService } from '@/services/agents';
import { useToast } from '@/hooks/use-toast';
const channelIcons = {
  chat: MessageCircle,
  inbound_call: Phone,
  outbound_call: PhoneCall
};
export default function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<AgentStatus[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>([]);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadAgents();
  }, []);
  useEffect(() => {
    // Filter agents based on search query and filters
    let filtered = agents.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      agent.archetype.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(agent => selectedStatuses.includes(agent.status));
    }

    // Apply channel filter
    if (selectedChannels.length > 0) {
      filtered = filtered.filter(agent => selectedChannels.includes(agent.channel));
    }

    // Apply archetype filter
    if (selectedArchetypes.length > 0) {
      filtered = filtered.filter(agent => selectedArchetypes.includes(agent.archetype));
    }

    setFilteredAgents(filtered);
  }, [agents, searchQuery, selectedStatuses, selectedChannels, selectedArchetypes]);
  const loadAgents = async () => {
    try {
      const data = await agentsService.getAgents();
      setAgents(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load agents. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleActivate = async (agent: Agent) => {
    try {
      const updatedAgent = await agentsService.activateAgent(agent.id);
      setAgents(prev => prev.map(a => a.id === agent.id ? updatedAgent : a));
      toast({
        title: 'Success',
        description: 'Agent activated successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate agent.',
        variant: 'destructive'
      });
    }
  };

  const handleMoveToTrash = async (agentId: string) => {
    try {
      await agentsService.moveToTrash(agentId);
      toast({
        title: 'Agent moved to trash',
        description: 'The agent will be permanently deleted after 30 days.'
      });
      loadAgents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move agent to trash.',
        variant: 'destructive'
      });
    }
  };

  const handleArchive = async () => {
    if (!selectedAgentId) return;
    
    try {
      await agentsService.archiveAgent(selectedAgentId);
      toast({
        description: 'Archived'
      });
      setArchiveDialogOpen(false);
      setSelectedAgentId(null);
      loadAgents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive agent.',
        variant: 'destructive'
      });
    }
  };

  const openArchiveDialog = (agentId: string) => {
    setSelectedAgentId(agentId);
    setArchiveDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            Manage your interview agents and view performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/app/agents/new/assisted">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search agents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        
        <div className="flex gap-2">
          {/* Single Filter Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {(selectedStatuses.length > 0 || selectedChannels.length > 0 || selectedArchetypes.length > 0) && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {selectedStatuses.length + selectedChannels.length + selectedArchetypes.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filters</h4>
                  {(selectedStatuses.length > 0 || selectedChannels.length > 0 || selectedArchetypes.length > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => {
                        setSelectedStatuses([]);
                        setSelectedChannels([]);
                        setSelectedArchetypes([]);
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
                            <Label
                              htmlFor={`status-${status}`}
                              className="text-sm font-normal cursor-pointer"
                            >
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
                        {(['chat', 'inbound_call', 'outbound_call'] as Channel[]).map((channel) => (
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
                            <Label
                              htmlFor={`channel-${channel}`}
                              className="text-sm font-normal cursor-pointer flex items-center gap-2"
                            >
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
                            <Label
                              htmlFor={`archetype-${archetype}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {archetype.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? <Card className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">
            {searchQuery ? 'No agents found' : 'No agents yet'}
          </CardTitle>
          <CardDescription className="mb-6">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first interview agent to get started'}
          </CardDescription>
          {!searchQuery && <Link to="/app/agents/new/assisted">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Agent
              </Button>
            </Link>}
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map(agent => {
        const ChannelIcon = channelIcons[agent.channel as Channel];
        return <Card key={agent.id} className="hover:shadow-lg hover:border-primary/30 hover:bg-accent/5 transition-all duration-200 border-border/20 bg-card cursor-pointer group" onClick={() => navigate(`/app/agents/${agent.id}`)}>
                <CardHeader className="space-y-4 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {agent.name}
                        </h3>
                        
                      </div>
                      <AgentStatusBadge status={agent.status} />
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
                    navigate(`/app/agents/${agent.id}/edit`);
                  }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={e => {
                    e.stopPropagation();
                    openArchiveDialog(agent.id);
                  }}>
                          <ArchiveIcon className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={async e => {
                    e.stopPropagation();
                    try {
                      await agentsService.moveToTrash(agent.id);
                      toast({
                        title: 'Moved to trash',
                        description: 'Agent moved to trash. It will be permanently deleted in 30 days.'
                      });
                      loadAgents();
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: 'Failed to move agent to trash',
                        variant: 'destructive'
                      });
                    }
                  }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Move to Trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Phone No</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Archetype</span>
                      </div>
                      <span className="text-sm text-foreground/80 uppercase tracking-wide">
                        {agent.archetype.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 pb-6">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all" onClick={e => {
              e.stopPropagation();
              navigate(`/app/agents/${agent.id}`);
            }}>
                    View Details
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>;
      })}
        </div>}

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
    </div>;
}