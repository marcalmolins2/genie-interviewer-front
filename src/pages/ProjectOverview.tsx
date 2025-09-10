import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Bot, Calendar, Settings, UserPlus, MoreVertical, Play, Pause, BarChart3, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Project, Agent } from '@/types';
import { projectsService } from '@/services/projects';
import { agentsService } from '@/services/agents';
import { AgentStatusBadge } from '@/components/AgentStatusBadge';
import { ArchetypeCard } from '@/components/ArchetypeCard';
import { ARCHETYPES } from '@/types';

const ProjectOverview = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      const [projectData, agentsData] = await Promise.all([
        projectsService.getProject(projectId),
        agentsService.getAgents() // Filter by projectId in real implementation
      ]);

      if (!projectData) {
        navigate('/app/projects');
        return;
      }

      setProject(projectData);
      setProjectName(projectData.name);
      setProjectDescription(projectData.description || '');
      // Filter agents by projectId (in real implementation, this would be done server-side)
      setAgents(agentsData.filter(agent => agent.projectId === projectId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAgentStatus = async (agentId: string) => {
    try {
      await agentsService.toggleAgentStatus(agentId);
      loadProjectData(); // Reload to get updated status
      toast({
        title: "Success",
        description: "Agent status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !projectId) return;

    try {
      await projectsService.addMember(projectId, newMemberEmail, newMemberRole);
      loadProjectData(); // Reload to get updated member list
      setAddMemberOpen(false);
      setNewMemberEmail('');
      setNewMemberRole('member');
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProject = async () => {
    if (!projectId || !projectName.trim()) return;

    try {
      await projectsService.updateProject(projectId, {
        name: projectName,
        description: projectDescription
      });
      loadProjectData(); // Reload to get updated project data
      setSettingsOpen(false);
      toast({
        title: "Success", 
        description: "Project updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link to="/app/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Invite a new member to join this project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select value={newMemberRole} onValueChange={(value: 'admin' | 'member') => setNewMemberRole(value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={!newMemberEmail.trim()}>
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Project Settings</DialogTitle>
                <DialogDescription>
                  Update project information and settings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="project-description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Optional description"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProject} disabled={!projectName.trim()}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button asChild>
            <Link to={`/app/projects/${project.id}/agents/new`}>
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Link>
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{project.agentsCount}</p>
              <p className="text-sm text-muted-foreground">Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{project.members.length}</p>
              <p className="text-sm text-muted-foreground">Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Play className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{agents.filter(a => a.status === 'live').length}</p>
              <p className="text-sm text-muted-foreground">Live Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatDate(project.createdAt)}</p>
              <p className="text-sm text-muted-foreground">Created</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Joined {formatDate(member.joinedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agents */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Interview Agents</span>
              </CardTitle>
              <Button asChild size="sm">
                <Link to={`/app/projects/${project.id}/agents/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Agent
                </Link>
              </Button>
            </div>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first interview agent to start collecting insights
              </p>
              <Button asChild>
                <Link to={`/app/projects/${project.id}/agents/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Agent
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => {
                const archetype = ARCHETYPES.find(a => a.id === agent.archetype);
                return (
                  <Card key={agent.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            <Link 
                              to={`/app/projects/${project.id}/agents/${agent.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {agent.name}
                            </Link>
                          </CardTitle>
                          <AgentStatusBadge status={agent.status} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/app/projects/${project.id}/agents/${agent.id}/edit`}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleAgentStatus(agent.id)}>
                              {agent.status === 'live' || agent.status === 'ready_to_test' ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/app/projects/${project.id}/agents/${agent.id}/analyze`}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analyze
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {archetype && (
                        <ArchetypeCard
                          archetype={archetype}
                          variant="compact"
                        />
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Channel</span>
                        <Badge variant="outline" className="capitalize">
                          {agent.channel.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium">${agent.pricePerInterviewUsd}/interview</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Interviews</span>
                        <span>{agent.interviewsCount}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Created {formatDate(agent.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverview;