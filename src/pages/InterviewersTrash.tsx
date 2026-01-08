import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import { Agent } from "@/types";
import { interviewersService, agentsService } from "@/services/interviewers";
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

const InterviewersTrash = () => {
  const navigate = useNavigate();
  const [interviewers, setInterviewers] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrashedInterviewers = async () => {
    try {
      setLoading(true);
      const data = await agentsService.getTrashedAgents();
      setInterviewers(data);
    } catch (error) {
      console.error("Failed to load trashed interviewers:", error);
      toast({
        title: "Error",
        description: "Failed to load trashed interviewers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrashedInterviewers();
  }, []);

  const handleRestore = async (interviewerId: string) => {
    try {
      await agentsService.restoreAgent(interviewerId);
      toast({
        title: "Interviewer restored",
        description: "The interviewer has been restored successfully",
      });
      loadTrashedInterviewers();
    } catch (error) {
      console.error("Failed to restore interviewer:", error);
      toast({
        title: "Error",
        description: "Failed to restore interviewer",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (interviewerId: string) => {
    try {
      await agentsService.permanentlyDeleteAgent(interviewerId);
      toast({
        title: "Interviewer deleted permanently",
        description: "The interviewer and all its data have been permanently deleted",
      });
      loadTrashedInterviewers();
    } catch (error) {
      console.error("Failed to delete interviewer:", error);
      toast({
        title: "Error",
        description: "Failed to delete interviewer permanently",
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
          Interviewers will be permanently deleted after 30 days
        </p>
      </div>

      {interviewers.length === 0 ? (
        <Card className="p-12 text-center">
          <Trash2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground">
            Deleted interviewers will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {interviewers.map((interviewer) => {
            const daysLeft = getDaysUntilDeletion(interviewer.deletedAt!);
            return (
              <Card key={interviewer.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{interviewer.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{interviewer.archetype}</Badge>
                          <Badge variant="outline">{interviewer.channel}</Badge>
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
                      onClick={() => handleRestore(interviewer.id)}
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
                            Permanently delete interviewer?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{interviewer.name}" and all
                            its associated data including interviews, transcripts,
                            and insights. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handlePermanentDelete(interviewer.id)}
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

export default InterviewersTrash;
