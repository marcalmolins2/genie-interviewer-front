import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, RotateCcw, Archive as ArchiveIcon, Eye, Copy, Trash2 } from "lucide-react";
import { Agent } from "@/types";
import { agentsService } from "@/services/agents";
import { toast } from "@/hooks/use-toast";
import { AgentStatusBadge } from "@/components/AgentStatusBadge";

interface ArchivedInterviewerWithLastDate extends Agent {
  lastInterviewDate?: string | null;
}

const AgentsArchive = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<ArchivedInterviewerWithLastDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const loadArchivedAgents = async () => {
    try {
      setLoading(true);
      const data = await agentsService.getArchivedAgents();
      
      // Fetch last interview dates for each agent
      const agentsWithDates = await Promise.all(
        data.map(async (agent) => {
          const lastDate = await agentsService.getLastInterviewDate(agent.id);
          return { ...agent, lastInterviewDate: lastDate };
        })
      );
      
      setAgents(agentsWithDates);
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
    loadArchivedAgents();
  }, []);

  const handleUnarchive = async () => {
    if (!selectedAgentId) return;
    
    try {
      await agentsService.unarchiveAgent(selectedAgentId);
      toast({
        description: "Unarchived",
      });
      setUnarchiveDialogOpen(false);
      setSelectedAgentId(null);
      loadArchivedAgents();
    } catch (error) {
      console.error("Failed to unarchive interviewer:", error);
      toast({
        title: "Error",
        description: "Failed to unarchive interviewer",
        variant: "destructive",
      });
    }
  };

  const openUnarchiveDialog = (agentId: string) => {
    setSelectedAgentId(agentId);
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

      {agents.length === 0 ? (
        <Card className="p-12 text-center">
          <ArchiveIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No archived interviewers</h3>
          <p className="text-muted-foreground">
            Interviewers you archive will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold truncate">{agent.name}</h3>
                    <AgentStatusBadge status={agent.status} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {agent.archetype.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {agent.channel.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>Sessions: {agent.interviewsCount}</span>
                    {agent.lastInterviewDate && (
                      <>
                        <span>•</span>
                        <span>Last interview: {formatDate(agent.lastInterviewDate)}</span>
                      </>
                    )}
                    {agent.archivedAt && (
                      <>
                        <span>•</span>
                        <span>Archived: {formatDate(agent.archivedAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUnarchiveDialog(agent.id)}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Unarchive
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/app/agents/${agent.id}`)}
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
                        await agentsService.moveToTrash(agent.id);
                        toast({
                          description: "Moved to trash",
                        });
                        loadArchivedAgents();
                      } catch (error) {
                        if (error instanceof Error && error.message === 'ACTIVE_CALL_IN_PROGRESS') {
                          toast({
                            title: "Cannot move to trash",
                            description: "This interviewer has an active call in progress. Please wait until the call ends.",
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
          ))}
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

export default AgentsArchive;
