import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Search,
  X,
  Crown,
  Edit,
  Eye,
  UserPlus,
  Trash2,
  Check
} from 'lucide-react';
import { InterviewerCollaborator, InterviewerRole, INTERVIEWER_ROLES } from '@/types';
import { interviewersService } from '@/services/interviewers';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface ShareInterviewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewerId: string;
  interviewerName: string;
  collaborators: InterviewerCollaborator[];
  isOwner: boolean;
  onCollaboratorsChange: () => void;
}

interface SearchUser {
  id: string;
  name: string;
  email: string;
  department: string;
}

export function ShareInterviewerDialog({
  open,
  onOpenChange,
  interviewerId,
  interviewerName,
  collaborators,
  isOwner,
  onCollaboratorsChange
}: ShareInterviewerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [invitePermission, setInvitePermission] = useState<InterviewerRole>('viewer');
  const [pendingInvites, setPendingInvites] = useState<Array<SearchUser & { permission: InterviewerRole }>>([]);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedTransferUser, setSelectedTransferUser] = useState<InterviewerCollaborator | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const results = await interviewersService.searchUsers(searchQuery, interviewerId);
        const filtered = results.filter(
          user => !pendingInvites.find(p => p.id === user.id)
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, interviewerId, pendingInvites]);

  const addToPendingInvites = (user: SearchUser) => {
    setPendingInvites(prev => [...prev, { ...user, permission: invitePermission }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removePendingInvite = (userId: string) => {
    setPendingInvites(prev => prev.filter(p => p.id !== userId));
  };

  const updatePendingPermission = (userId: string, permission: InterviewerRole) => {
    setPendingInvites(prev =>
      prev.map(p => p.id === userId ? { ...p, permission } : p)
    );
  };

  const handleInvite = async () => {
    if (pendingInvites.length === 0) return;

    setIsSubmitting(true);
    try {
      for (const invite of pendingInvites) {
        await interviewersService.inviteCollaborator(interviewerId, invite.id, invite.permission);
      }
      
      toast({
        title: 'Invitations Sent',
        description: `Successfully invited ${pendingInvites.length} collaborator${pendingInvites.length !== 1 ? 's' : ''}.`
      });
      
      setPendingInvites([]);
      onCollaboratorsChange();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitations.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermission = async (collaboratorId: string, permission: InterviewerRole) => {
    try {
      await interviewersService.updateCollaboratorPermission(collaboratorId, permission);
      toast({
        title: 'Permission Updated',
        description: 'Collaborator permission has been updated.'
      });
      onCollaboratorsChange();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update permission.',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      await interviewersService.removeCollaborator(collaboratorId);
      toast({
        title: 'Collaborator Removed',
        description: 'Collaborator has been removed from this interviewer.'
      });
      onCollaboratorsChange();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove collaborator.',
        variant: 'destructive'
      });
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedTransferUser) return;

    setIsSubmitting(true);
    try {
      await interviewersService.transferOwnership(interviewerId, selectedTransferUser.userId);
      toast({
        title: 'Ownership Transferred',
        description: `${selectedTransferUser.user.name} is now the owner of this interviewer.`
      });
      setTransferDialogOpen(false);
      setSelectedTransferUser(null);
      onCollaboratorsChange();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to transfer ownership.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const owner = collaborators.find(c => c.permission === 'owner');
  const otherCollaborators = collaborators.filter(c => c.permission !== 'owner');

  const getPermissionIcon = (permission: InterviewerRole) => {
    switch (permission) {
      case 'owner': return <Crown className="h-4 w-4" />;
      case 'editor': return <Edit className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return null;
    }
  };

  const getPermissionColor = (permission: InterviewerRole) => {
    switch (permission) {
      case 'owner': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'editor': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'viewer': return 'bg-slate-500/10 text-slate-600 border-slate-200';
      default: return '';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share "{interviewerName}"</DialogTitle>
            <DialogDescription>
              {isOwner 
                ? 'Manage who can access this interviewer and their permission levels.'
                : 'View who has access to this interviewer.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {owner && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Owner</Label>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50 border-amber-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{owner.user.name}</p>
                      <p className="text-xs text-muted-foreground">{owner.user.email}</p>
                    </div>
                  </div>
                  <Badge className={getPermissionColor('owner')}>
                    Owner
                  </Badge>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Invite Collaborators</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={invitePermission} onValueChange={(v: InterviewerRole) => setInvitePermission(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {searchQuery.length >= 2 && (
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {searching ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => addToPendingInvites(user)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{user.department}</span>
                            <UserPlus className="h-4 w-4 text-primary" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-sm text-muted-foreground text-center">
                        No users found matching "{searchQuery}"
                      </p>
                    )}
                  </div>
                )}

                {pendingInvites.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Pending Invitations ({pendingInvites.length})</Label>
                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-2 bg-background rounded-md border">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {invite.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{invite.name}</p>
                              <p className="text-xs text-muted-foreground">{invite.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={invite.permission} 
                              onValueChange={(v: InterviewerRole) => updatePendingPermission(invite.id, v)}
                            >
                              <SelectTrigger className="h-8 w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removePendingInvite(invite.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={handleInvite}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Send {pendingInvites.length} Invitation{pendingInvites.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {otherCollaborators.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Collaborators ({otherCollaborators.length})</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {otherCollaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {collab.user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{collab.user.name}</p>
                          <p className="text-xs text-muted-foreground">{collab.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner ? (
                          <>
                            <Select 
                              value={collab.permission} 
                              onValueChange={(v: InterviewerRole) => handleUpdatePermission(collab.id, v)}
                            >
                              <SelectTrigger className="h-8 w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveCollaborator(collab.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge className={getPermissionColor(collab.permission)}>
                            {INTERVIEWER_ROLES[collab.permission]?.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Permission Levels</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  {getPermissionIcon('viewer')}
                  <span><strong>Viewer:</strong> {INTERVIEWER_ROLES.viewer.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getPermissionIcon('editor')}
                  <span><strong>Editor:</strong> {INTERVIEWER_ROLES.editor.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getPermissionIcon('owner')}
                  <span><strong>Owner:</strong> {INTERVIEWER_ROLES.owner.description}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Ownership</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer ownership to {selectedTransferUser?.user.name}? 
              You will become an Editor and lose owner privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransferOwnership} disabled={isSubmitting}>
              {isSubmitting ? 'Transferring...' : 'Transfer Ownership'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
