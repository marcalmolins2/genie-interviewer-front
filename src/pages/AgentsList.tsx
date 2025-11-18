import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AgentStatusBadge } from '@/components/AgentStatusBadge';
import { Plus, Search, MoreHorizontal, Edit, MessageCircle, Phone, PhoneCall, Users, Archive, Trash2, ChevronRight } from 'lucide-react';
import { Agent, Channel } from '@/types';
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
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadAgents();
  }, []);
  useEffect(() => {
    // Filter agents based on search query
    const filtered = agents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.archetype.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredAgents(filtered);
  }, [agents, searchQuery]);
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
  const handleToggleStatus = async (agent: Agent) => {
    try {
      const updatedAgent = await agentsService.toggleAgentStatus(agent.id);
      setAgents(prev => prev.map(a => a.id === agent.id ? updatedAgent : a));
      toast({
        title: 'Success',
        description: `Agent ${updatedAgent.status === 'live' ? 'resumed' : 'paused'} successfully.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update agent status.',
        variant: 'destructive'
      });
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  if (loading) {
    return <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>;
  }
  return <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Agents</h1>
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
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                      <AgentStatusBadge status={agent.status} />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/agents/${agent.id}/edit`);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: 'Archive',
                            description: 'Archive functionality coming soon.'
                          });
                        }}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: 'Delete',
                            description: 'Delete functionality coming soon.',
                            variant: 'destructive'
                          });
                        }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
              </Card>;
      })}
        </div>}
    </div>;
}