import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Microscope,
  Users,
  Heart,
  Zap,
  Search,
  FileSearch,
  Users2,
  AlertCircle
} from 'lucide-react';
import { ArchetypeInfo } from '@/types';
import { getArchetypes, deleteArchetype } from '@/services/admin';
import { ArchetypeFormDialog } from '@/components/admin/ArchetypeFormDialog';
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
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, React.ElementType> = {
  Microscope,
  Users,
  Heart,
  Zap,
  Search,
  FileSearch,
  Users2,
};

export default function AdminArchetypes() {
  const [archetypes, setArchetypes] = useState<ArchetypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingArchetype, setEditingArchetype] = useState<ArchetypeInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingArchetype, setDeletingArchetype] = useState<ArchetypeInfo | null>(null);
  const { toast } = useToast();

  const loadArchetypes = async () => {
    setLoading(true);
    const data = await getArchetypes();
    setArchetypes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadArchetypes();
  }, []);

  const handleEdit = (archetype: ArchetypeInfo) => {
    setEditingArchetype(archetype);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingArchetype) return;
    
    try {
      await deleteArchetype(deletingArchetype.id);
      toast({
        title: 'Archetype deleted',
        description: `"${deletingArchetype.title}" has been removed.`,
      });
      loadArchetypes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete archetype.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingArchetype(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingArchetype(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadArchetypes();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Archetypes</h1>
          <p className="text-muted-foreground mt-1">Manage interview agent archetypes</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Archetype
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {archetypes.map((archetype) => {
          const Icon = iconMap[archetype.icon] || Microscope;
          
          return (
            <Card key={archetype.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{archetype.title}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {archetype.id}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEdit(archetype)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeletingArchetype(archetype);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{archetype.description}</p>
                
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Use Case</p>
                  <p className="text-xs text-muted-foreground">{archetype.useCase}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Examples</p>
                  <div className="flex flex-wrap gap-1">
                    {archetype.examples.slice(0, 3).map((example, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <ArchetypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        archetype={editingArchetype}
        onSuccess={handleFormSuccess}
        onCancel={handleFormClose}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Archetype
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingArchetype?.title}"? This action cannot be undone.
              Existing agents using this archetype will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
