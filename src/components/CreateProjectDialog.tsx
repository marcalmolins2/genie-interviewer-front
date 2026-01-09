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
import { PROJECT_TYPE_LABELS, ProjectType } from '@/types';
import { projectsService, CreateProjectInput } from '@/services/projects';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  caseCode: z
    .string()
    .max(20)
    .regex(/^[A-Za-z0-9-]*$/, 'Only letters, numbers, and hyphens allowed')
    .optional(),
  projectType: z.enum(['internal_work', 'commercial_proposal', 'client_investment', 'client_work'] as const),
  description: z.string().max(500).optional(),
}).refine(
  (data) => data.projectType !== 'client_work' || (data.caseCode && data.caseCode.length > 0),
  { message: 'Case code is required for client work', path: ['caseCode'] }
);

type FormValues = z.infer<typeof formSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (projectId: string) => void;
}

export function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      caseCode: '',
      projectType: 'client_work',
      description: '',
    },
  });

  const projectType = form.watch('projectType');
  const isClientWork = projectType === 'client_work';

  // Clear caseCode when switching away from client_work
  useEffect(() => {
    if (!isClientWork) {
      form.setValue('caseCode', '');
    }
  }, [isClientWork, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const project = await projectsService.createProject(values as CreateProjectInput);
      toast({
        title: 'Project created',
        description: `"${project.name}" has been created successfully.`,
      });
      form.reset();
      onOpenChange(false);
      onProjectCreated?.(project.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Projects group related interviewers together. Team members you invite will have access to all interviewers in this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Retail Transformation Study" {...field} />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
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

            {isClientWork && (
              <FormField
                control={form.control}
                name="caseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., BCG-2024-001" {...field} />
                    </FormControl>
                    <FormDescription>A unique identifier for this project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the project..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
