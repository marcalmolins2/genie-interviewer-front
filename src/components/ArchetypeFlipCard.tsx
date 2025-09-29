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
        {/* Front Side - Visual and Title */}
        <Card className="absolute inset-0 w-full h-full backface-hidden">
          <div className={`h-full flex flex-col items-center justify-center text-center p-6 ${gradient} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 mb-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Icon className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <div className="w-12 h-0.5 bg-white/50 mx-auto"></div>
            </div>
          </div>
        </Card>
        
        {/* Back Side - Description and Button */}
        <Card className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden bg-background">
          <div className="h-full flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div className="text-center">
                <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <div className="space-y-3">
                {description.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <Link to="/login" className="w-full">
                <Button className="w-full gap-2">
                  Build This Agent <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}