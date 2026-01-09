import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PROJECT_TYPE_LABELS, Project, ProjectType } from '@/types';
import { projectsService } from '@/services/projects';
import { useProjectPermission } from '@/hooks/useProjectPermission';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { ProjectMembersList } from './ProjectMembersList';

const formSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  caseCode: z
    .string()
    .min(1, 'Case code is required')
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, 'Only letters, numbers, and hyphens allowed'),
  projectType: z.enum(['internal_work', 'commercial_proposal', 'client_investment', 'client_work'] as const),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectSettingsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated?: () => void;
  onProjectDeleted?: () => void;
}

export function ProjectSettingsDialog({
  project,
  open,
  onOpenChange,
  onProjectUpdated,
  onProjectDeleted,
}: ProjectSettingsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { isOwner, canEdit } = useProjectPermission(project?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      caseCode: '',
      projectType: 'client_work',
      description: '',
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        caseCode: project.caseCode,
        projectType: project.projectType,
        description: project.description || '',
      });
    }
  }, [project, form]);

  const onSubmit = async (values: FormValues) => {
    if (!project) return;
    
    setIsSubmitting(true);
    try {
      await projectsService.updateProject(project.id, values);
      toast({
        title: 'Project updated',
        description: 'Your changes have been saved.',
      });
      onProjectUpdated?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    try {
      await projectsService.deleteProject(project.id);
      toast({
        title: 'Project deleted',
        description: `"${project.name}" has been deleted.`,
      });
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onProjectDeleted?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>
              Manage project details and team members.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Code</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormDescription>A unique identifier for this project</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!canEdit}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((type) => (
                              <SelectItem key={type} value={type}>
                                {PROJECT_TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none"
                            {...field}
                            disabled={!canEdit}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {canEdit && (
                    <div className="flex justify-between pt-4">
                      {isOwner && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </Button>
                      )}
                      <div className="flex gap-2 ml-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="members" className="mt-4">
              <ProjectMembersList projectId={project.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{project.name}" and all its interviewers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
