import { Channel, PRICE_BY_CHANNEL } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelSelectorProps {
  value: Channel;
  onChange: (channel: Channel) => void;
  className?: string;
}

export function ChannelSelector({ value, onChange, className }: ChannelSelectorProps) {
  const price = PRICE_BY_CHANNEL.inbound_call;
  
  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          value === 'inbound_call' && 'ring-2 ring-primary shadow-glow'
        )}
        onClick={() => onChange('inbound_call')}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn(
                'p-2 rounded-lg',
                value === 'inbound_call' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                <Phone className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Inbound Call</h3>
                  <Badge variant="outline" className="text-xs">
                    ${price}/interview
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  Participants call a provided number
                </p>
                
                <ul className="space-y-1">
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Dedicated phone number
                  </li>
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Voice interaction
                  </li>
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Call recording
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
