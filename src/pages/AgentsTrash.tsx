import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import { Agent } from "@/types";
import { agentsService } from "@/services/agents";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AgentsTrash = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrashedAgents = async () => {
    try {
      setLoading(true);
      const data = await agentsService.getTrashedAgents();
      setAgents(data);
    } catch (error) {
      console.error("Failed to load trashed agents:", error);
      toast({
        title: "Error",
        description: "Failed to load trashed agents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrashedAgents();
  }, []);

  const handleRestore = async (agentId: string) => {
    try {
      await agentsService.restoreAgent(agentId);
      toast({
        title: "Agent restored",
        description: "The agent has been restored successfully",
      });
      loadTrashedAgents();
    } catch (error) {
      console.error("Failed to restore agent:", error);
      toast({
        title: "Error",
        description: "Failed to restore agent",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (agentId: string) => {
    try {
      await agentsService.permanentlyDeleteAgent(agentId);
      toast({
        title: "Agent deleted permanently",
        description: "The agent and all its data have been permanently deleted",
      });
      loadTrashedAgents();
    } catch (error) {
      console.error("Failed to delete agent:", error);
      toast({
        title: "Error",
        description: "Failed to delete agent permanently",
        variant: "destructive",
      });
    }
  };

  const getDaysUntilDeletion = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const deleteDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.ceil((deleteDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
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
        <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
        <p className="text-muted-foreground mt-1">
          Agents will be permanently deleted after 30 days
        </p>
      </div>

      {agents.length === 0 ? (
        <Card className="p-12 text-center">
          <Trash2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground">
            Deleted agents will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => {
            const daysLeft = getDaysUntilDeletion(agent.deletedAt!);
            return (
              <Card key={agent.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{agent.archetype}</Badge>
                          <Badge variant="outline">{agent.channel}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>
                        Will be permanently deleted in{" "}
                        <span className="font-semibold text-foreground">
                          {daysLeft} {daysLeft === 1 ? "day" : "days"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(agent.id)}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Forever
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Permanently delete agent?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{agent.name}" and all
                            its associated data including interviews, transcripts,
                            and insights. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handlePermanentDelete(agent.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgentsTrash;
