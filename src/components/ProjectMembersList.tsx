import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProjectMembership, ProjectRole, PROJECT_ROLES, User } from '@/types';
import { projectsService } from '@/services/projects';
import { useProjectPermission } from '@/hooks/useProjectPermission';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectMembersListProps {
  projectId: string;
}

export function ProjectMembersList({ projectId }: ProjectMembersListProps) {
  const [members, setMembers] = useState<(ProjectMembership & { user?: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('viewer');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();
  const { isOwner, canManageMembers } = useProjectPermission(projectId);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await projectsService.searchUsers(searchQuery);
        // Filter out existing members
        const memberIds = members.map(m => m.userId);
        setSearchResults(results.filter(u => !memberIds.includes(u.id)));
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, members]);

  const loadMembers = async () => {
    try {
      const data = await projectsService.getProjectMembers(projectId);
      setMembers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load members.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (user: User) => {
    try {
      await projectsService.addProjectMember(projectId, user.id, selectedRole);
      toast({
        title: 'Member added',
        description: `${user.name} has been added to the project.`,
      });
      setSearchQuery('');
      setSearchResults([]);
      setShowInvite(false);
      loadMembers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member.',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: string, role: ProjectRole) => {
    try {
      await projectsService.updateMemberRole(projectId, userId, role);
      setMembers(prev => 
        prev.map(m => m.userId === userId ? { ...m, role } : m)
      );
      toast({
        description: 'Role updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role.',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;
    
    setIsRemoving(true);
    try {
      await projectsService.removeMember(projectId, memberToRemove);
      toast({
        description: 'Member removed.',
      });
      setMemberToRemove(null);
      loadMembers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member.',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canManageMembers && (
        <div className="space-y-3">
          {showInvite ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as ProjectRole)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PROJECT_ROLES) as ProjectRole[]).map((role) => (
                      <SelectItem key={role} value={role}>
                        {PROJECT_ROLES[role].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {searchResults.length > 0 && (
                <ScrollArea className="h-[150px] border rounded-md">
                  <div className="p-2 space-y-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleInvite(user)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {isSearching && (
                <div className="text-center py-3 text-sm text-muted-foreground">
                  Searching...
                </div>
              )}

              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-3 text-sm text-muted-foreground">
                  No users found
                </div>
              )}

              <Button variant="outline" size="sm" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowInvite(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>
      )}

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-md border bg-card"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {member.user ? getInitials(member.user.name) : '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {member.user?.name || 'Unknown User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {member.user?.email}
              </p>
            </div>

            {canManageMembers && member.role !== 'owner' ? (
              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(v) => handleRoleChange(member.userId, v as ProjectRole)}
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['editor', 'viewer'] as ProjectRole[]).map((role) => (
                      <SelectItem key={role} value={role}>
                        {PROJECT_ROLES[role].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setMemberToRemove(member.userId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Badge variant="secondary">
                {PROJECT_ROLES[member.role].label}
              </Badge>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              This person will lose access to all interviewers in this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isRemoving}>
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
