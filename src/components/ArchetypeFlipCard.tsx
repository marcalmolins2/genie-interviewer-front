import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArchetypeFlipCardProps {
  icon: LucideIcon;
  title: string;
  description: string[];
  gradient: string;
}

export default function ArchetypeFlipCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: ArchetypeFlipCardProps) {
  return (
    <div className="group relative h-64 perspective-1000">
      <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
        {/* Front Side */}
        <Card className="absolute inset-0 w-full h-full backface-hidden">
          <div className={`h-full flex flex-col items-center justify-center text-center p-6 ${gradient} text-white`}>
            <div className="w-16 h-16 mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
        </Card>
        
        {/* Back Side */}
        <Card className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
          <div className="h-full flex flex-col justify-between p-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
              <div className="space-y-2">
                {description.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4">
              <Link to="/login" className="w-full">
                <Button className="w-full gap-2 text-sm">
                  Build This Agent <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}