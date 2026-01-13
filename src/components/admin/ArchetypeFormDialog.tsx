import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ArchetypeInfo, Archetype } from '@/types';
import { createArchetype, updateArchetype } from '@/services/admin';
import { useToast } from '@/hooks/use-toast';

const availableIcons = [
  { value: 'Microscope', label: 'Microscope' },
  { value: 'Users', label: 'Users' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Search', label: 'Search' },
  { value: 'FileSearch', label: 'File Search' },
  { value: 'Users2', label: 'Users Group' },
];

interface ArchetypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archetype: ArchetypeInfo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ArchetypeFormDialog({
  open,
  onOpenChange,
  archetype,
  onSuccess,
  onCancel,
}: ArchetypeFormDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    icon: 'Microscope',
    useCase: '',
    examples: [] as string[],
  });
  const [exampleInput, setExampleInput] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const isEditing = !!archetype;

  useEffect(() => {
    if (archetype) {
      setFormData({
        id: archetype.id,
        title: archetype.title,
        description: archetype.description,
        icon: archetype.icon,
        useCase: archetype.useCase,
        examples: [...archetype.examples],
      });
    } else {
      setFormData({
        id: '',
        title: '',
        description: '',
        icon: 'Microscope',
        useCase: '',
        examples: [],
      });
    }
    setExampleInput('');
  }, [archetype, open]);

  const handleAddExample = () => {
    if (exampleInput.trim() && formData.examples.length < 5) {
      setFormData(prev => ({
        ...prev,
        examples: [...prev.examples, exampleInput.trim()],
      }));
      setExampleInput('');
    }
  };

  const handleRemoveExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateArchetype(archetype.id, {
          title: formData.title,
          description: formData.description,
          icon: formData.icon,
          useCase: formData.useCase,
          examples: formData.examples,
        });
        toast({
          title: 'Archetype updated',
          description: `"${formData.title}" has been updated.`,
        });
      } else {
        const id = formData.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') as Archetype;
        await createArchetype({
          id,
          title: formData.title,
          description: formData.description,
          icon: formData.icon,
          useCase: formData.useCase,
          examples: formData.examples,
        });
        toast({
          title: 'Archetype created',
          description: `"${formData.title}" has been added.`,
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save archetype.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Archetype' : 'Add Archetype'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the archetype configuration below.' 
              : 'Create a new interview archetype for agents.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Expert Deep-Dive"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this archetype is for..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="useCase">Use Case</Label>
            <Input
              id="useCase"
              value={formData.useCase}
              onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
              placeholder="e.g., Technical validation, detailed research"
            />
          </div>

          <div className="space-y-2">
            <Label>Examples (up to 5)</Label>
            <div className="flex gap-2">
              <Input
                value={exampleInput}
                onChange={(e) => setExampleInput(e.target.value)}
                placeholder="Add an example..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExample())}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddExample}
                disabled={formData.examples.length >= 5}
              >
                Add
              </Button>
            </div>
            {formData.examples.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.examples.map((example, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {example}
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Archetype'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
