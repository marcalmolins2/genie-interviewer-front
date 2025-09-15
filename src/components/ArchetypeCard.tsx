import { ArchetypeInfo } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Microscope, 
  Users, 
  Heart, 
  Zap, 
  Search, 
  FileSearch, 
  Users2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  Microscope,
  Users,
  Heart,
  Zap,
  Search,
  FileSearch,
  Users2,
};

interface ArchetypeCardProps {
  archetype: ArchetypeInfo;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function ArchetypeCard({ archetype, selected, onSelect, className }: ArchetypeCardProps) {
  const IconComponent = iconMap[archetype.icon as keyof typeof iconMap] || Search;
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        selected && 'ring-2 ring-primary shadow-glow',
        className
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              selected ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{archetype.title}</CardTitle>
              <CardDescription className="text-sm">
                {archetype.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Use Case</p>
            <p className="text-sm">{archetype.useCase}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Examples</p>
            <div className="flex flex-wrap gap-1">
              {archetype.examples.slice(0, 2).map((example, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {example}
                </Badge>
              ))}
              {archetype.examples.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{archetype.examples.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {onSelect && (
          <Button 
            variant={selected ? "default" : "outline"} 
            className="w-full mt-4"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {selected ? 'Selected' : 'Select'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}