import { Channel, PRICE_BY_CHANNEL } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelSelectorProps {
  value: Channel;
  onChange: (channel: Channel) => void;
  className?: string;
}

const channelOptions: {
  id: Channel;
  title: string;
  description: string;
  icon: typeof Phone;
  features: string[];
}[] = [
  {
    id: 'inbound_call',
    title: 'Inbound Call',
    description: 'Participants call a dedicated phone number',
    icon: Phone,
    features: ['Dedicated phone number', 'Voice interaction', 'Call recording'],
  },
  {
    id: 'web_link',
    title: 'Web Link',
    description: 'Participants join via a unique browser link',
    icon: Globe,
    features: ['Browser-based', 'Voice interaction', 'Auto-transcription'],
  },
];

export function ChannelSelector({ value, onChange, className }: ChannelSelectorProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {channelOptions.map((channel) => {
        const Icon = channel.icon;
        const price = PRICE_BY_CHANNEL[channel.id];
        const isSelected = value === channel.id;

        return (
          <Card
            key={channel.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              isSelected && 'ring-2 ring-primary shadow-glow'
            )}
            onClick={() => onChange(channel.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{channel.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      ${price}/interview
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {channel.description}
                  </p>
                  
                  <ul className="space-y-1">
                    {channel.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
