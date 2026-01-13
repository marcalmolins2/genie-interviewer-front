import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InterviewerStatusBadge } from "@/components/InterviewerStatusBadge";
import { ShareInterviewerDialog } from "@/components/ShareInterviewerDialog";
import { useInterviewerPermission } from "@/hooks/useInterviewerPermission";
import {
  ArrowLeft,
  Edit,
  Play,
  BarChart3,
  Share,
  Copy,
  Phone,
  Globe,
  ExternalLink as ExternalLinkIcon,
  Users,
  Calendar,
  Zap,
  Rocket,
  CheckCircle,
  ExternalLink,
  FileText,
  Brain,
  File,
  Download,
  ChevronDown,
  ChevronRight,
  Eye,
  AlertCircle,
  MoreHorizontal,
  Archive,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Agent, InterviewGuide, KnowledgeAsset } from "@/types";
import { interviewersService, agentsService } from "@/services/interviewers";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function InterviewerOverview() {
  const { interviewerId } = useParams<{ interviewerId: string }>();
  const [interviewer, setInterviewer] = useState<Agent | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [guide, setGuide] = useState<InterviewGuide | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [trashDialogOpen, setTrashDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [caseCode, setCaseCode] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use the permissions hook
  const {
    permission,
    collaborators,
    isOwner,
    canEdit,
    canManageCollaborators,
    canArchive,
    loading: permissionLoading,
    reload: reloadPermissions,
  } = useInterviewerPermission(interviewerId);

  useEffect(() => {
    if (interviewerId) {
      loadInterviewer();
      loadStats();
      loadGuideAndKnowledge();
    }
  }, [interviewerId]);

  const loadInterviewer = async () => {
    if (!interviewerId) return;

    try {
      const data = await agentsService.getAgent(interviewerId);
      if (data) {
        setInterviewer(data);
      } else {
        navigate("/app/interviewers");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load interviewer details.",
        variant: "destructive",
      });
      navigate("/app/interviewers");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!interviewerId) return;

    try {
      const data = await agentsService.getAgentStats(interviewerId);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadGuideAndKnowledge = async () => {
    if (!interviewerId) return;

    try {
      const [guideData, knowledgeData] = await Promise.all([
        agentsService.getAgentGuide(interviewerId),
        agentsService.getAgentKnowledge(interviewerId),
      ]);
      setGuide(guideData);
      setKnowledge(knowledgeData);
    } catch (error) {
      console.error("Failed to load guide and knowledge:", error);
    }
  };

  const handleActivate = async () => {
    if (!interviewer) return;

    try {
      const updatedInterviewer = await agentsService.activateAgent(interviewer.id);
      setInterviewer(updatedInterviewer);

      toast({
        title: "Success",
        description: "Interviewer activated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate interviewer.",
        variant: "destructive",
      });
    }
  };

  const handleDeploy = async () => {
    if (!interviewer || !caseCode.trim()) return;

    setIsDeploying(true);
    try {
      await agentsService.deployAgent(interviewer.id);
      setInterviewer((prev) => (prev ? { ...prev, status: "live" } : null));
      setDeployDialogOpen(false);
      setCaseCode("");

      toast({
        title: "Success",
        description: "Interviewer deployed successfully and is now live!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deploy interviewer.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard.`,
    });
  };

  const handleArchive = async () => {
    if (!interviewer) return;
    try {
      await agentsService.archiveAgent(interviewer.id);
      toast({ description: "Archived" });
      navigate("/app/interviewers");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive interviewer.",
        variant: "destructive",
      });
    }
    setArchiveDialogOpen(false);
  };

  const handleMoveToTrash = async () => {
    if (!interviewer) return;
    try {
      await agentsService.moveToTrash(interviewer.id);
      toast({ description: "Moved to trash" });
      navigate("/app/interviewers");
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
          description: "Failed to move interviewer to trash.",
          variant: "destructive",
        });
      }
    }
    setTrashDialogOpen(false);
  };

  const handleUnarchive = async () => {
    if (!interviewer) return;
    try {
      const updatedInterviewer = await agentsService.unarchiveAgent(interviewer.id);
      setInterviewer(updatedInterviewer);
      toast({ description: "Unarchived" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unarchive interviewer.",
        variant: "destructive",
      });
    }
    setUnarchiveDialogOpen(false);
  };

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!interviewer) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center">
          <CardTitle className="mb-2">Interviewer not found</CardTitle>
          <CardDescription className="mb-6">The requested interviewer could not be found.</CardDescription>
          <Link to="/app/interviewers">
            <Button>Back to Interviewers</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isArchived = interviewer.status === 'archived';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/app/interviewers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviewers
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{interviewer.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <InterviewerStatusBadge status={interviewer.status} />
              <Badge variant="outline">{interviewer.archetype.replace("_", " ")}</Badge>
              <Badge variant="outline">{interviewer.language.toUpperCase()}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Button - disabled for archived or no permission */}
          {interviewer.hasActiveCall || !canEdit || isArchived ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {isArchived
                      ? "Unarchive to edit this interviewer"
                      : interviewer.hasActiveCall
                      ? "Cannot edit while a call is in progress"
                      : "You need Editor or Owner permission to edit"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate(`/app/interviewers/${interviewer.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {interviewer.status === "ready_to_test" && (
            <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Deploy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy Interviewer</DialogTitle>
                  <DialogDescription>Enter your BCG case code to deploy this interviewer to production.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="case-code">Case Code *</Label>
                    <Input
                      id="case-code"
                      value={caseCode}
                      onChange={(e) => setCaseCode(e.target.value)}
                      placeholder="e.g., BCG-LUMEN-2024-001"
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeployDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDeploy} disabled={!caseCode.trim() || isDeploying}>
                    {isDeploying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy to Production
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {interviewer.status === "paused" && (
            <Button size="sm" onClick={handleActivate}>
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}

          {/* Unarchive button for archived interviewers */}
          {isArchived && (
            <Button size="sm" onClick={() => setUnarchiveDialogOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Unarchive
            </Button>
          )}

          <Link to={`/app/interviewers/${interviewer.id}/insights`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Insights
            </Button>
          </Link>

          {!isArchived && (
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Test Interviewer
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
            <Share className="h-4 w-4 mr-2" />
            Share
            {collaborators.length > 1 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {collaborators.length}
              </Badge>
            )}
          </Button>

          {/* Actions Dropdown Menu */}
          {canArchive && !isArchived && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setArchiveDialogOpen(true)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTrashDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* View Only Badge for non-editors */}
          {permission && !canEdit && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              View Only
            </Badge>
          )}
        </div>
      </div>

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

      {/* Trash Confirmation Dialog */}
      <AlertDialog open={trashDialogOpen} onOpenChange={setTrashDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the interviewer to trash for 30 days before permanent deletion
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMoveToTrash} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {interviewer.channel === 'web_link' ? <Globe className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                Contact Information
              </CardTitle>
              <CardDescription>How participants access your interviewer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {interviewer.credentialsReady ? (
                interviewer.channel === 'web_link' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-medium">Interview Link</Label>
                        <p className="text-sm font-mono truncate">
                          {`${window.location.origin}/interview/${interviewer.contact.linkId}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(
                            `${window.location.origin}/interview/${interviewer.contact.linkId}`,
                            "Interview link"
                          )}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/interview/${interviewer.contact.linkId}`, '_blank')}
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${interviewer.status === 'live' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className="text-muted-foreground">
                        {interviewer.status === 'live' ? 'Link is active' : 'Link inactive (interviewer not live)'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Phone Number</Label>
                      <p className="text-lg font-mono">{interviewer.contact.phoneNumber || 'Not assigned'}</p>
                    </div>
                    {interviewer.contact.phoneNumber && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(interviewer.contact.phoneNumber!, "Phone number")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Generating contact credentials...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interview Guide
              </CardTitle>
              <CardDescription>The conversation structure for this interviewer</CardDescription>
            </CardHeader>
            <CardContent>
              {guide ? (
                <div className="space-y-4">
                  {guide.structured ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Introduction</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {guide.structured.intro}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Objectives</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {guide.structured.objectives.map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Interview Sections ({guide.structured.sections.length})
                        </h4>
                        <div className="space-y-2">
                          {guide.structured.sections.map((section, idx) => (
                            <div key={idx} className="border border-border rounded-md overflow-hidden">
                              <button
                                onClick={() => toggleSection(idx)}
                                className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                              >
                                <p className="font-medium text-sm">{section.title}</p>
                                {expandedSections.has(idx) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>

                              {expandedSections.has(idx) && (
                                <div className="px-3 pb-3 border-t border-border">
                                  <ul className="space-y-2 pt-3">
                                    {section.questions.map((question) => (
                                      <li
                                        key={question.id}
                                        className="text-sm text-muted-foreground flex items-start gap-2"
                                      >
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                                        <span>{question.prompt}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : guide.rawText ? (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Raw Guide Text</h4>
                      <Textarea value={guide.rawText} readOnly className="min-h-[200px] text-sm" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No guide content available</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No interview guide configured</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
              <CardDescription>Information and resources available to the interviewer</CardDescription>
            </CardHeader>
            <CardContent>
              {knowledge.length > 0 ? (
                <div className="space-y-3">
                  {knowledge.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {asset.type === "file" ? (
                          <File className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{asset.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {asset.type === "file" && asset.fileName ? (
                              <span>
                                {asset.fileName} • {Math.round((asset.fileSize || 0) / 1024)} KB
                              </span>
                            ) : (
                              "Text content"
                            )}
                          </p>
                        </div>
                      </div>
                      {asset.type === "text" && asset.contentText && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Create a modal or expand to show content
                            alert(asset.contentText?.substring(0, 200) + "...");
                          }}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                      {knowledge.length} knowledge asset{knowledge.length !== 1 ? "s" : ""} configured
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No knowledge assets configured</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Key events in your interviewer's lifecycle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Interviewer Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(interviewer.createdAt)}</p>
                  </div>
                </div>

                {interviewer.credentialsReady && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Contact Info Generated</p>
                      <p className="text-sm text-muted-foreground">
                        Phone number provisioned
                      </p>
                    </div>
                  </div>
                )}

                {interviewer.status === "live" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Deployed to Production</p>
                      <p className="text-sm text-muted-foreground">Interviewer is now accepting interviews</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{interviewer.interviewsCount}</div>
                <div className="text-xs text-muted-foreground">Total Interviews</div>
              </div>

              {stats && (
                <>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-success">{stats.last7Days}</div>
                    <div className="text-xs text-muted-foreground">Last 7 Days</div>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-info">{Math.round(stats.completionRate * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Completion Rate</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Channel</span>
                <span className="text-sm capitalize">{interviewer.channel.replace("_", " ")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="text-sm">{interviewer.language.toUpperCase()}</span>
              </div>

              {interviewer.voiceId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Voice</span>
                  <span className="text-sm">{interviewer.voiceId}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(interviewer.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Agent Dialog */}
      <ShareInterviewerDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        interviewerId={interviewer.id}
        interviewerName={interviewer.name}
        collaborators={collaborators}
        isOwner={isOwner}
        onCollaboratorsChange={reloadPermissions}
      />
    </div>
  );
}
