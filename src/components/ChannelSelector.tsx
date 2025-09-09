import { Channel, PRICE_BY_CHANNEL } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelSelectorProps {
  value: Channel;
  onChange: (channel: Channel) => void;
  className?: string;
}

const channelConfig = {
  chat: {
    icon: MessageCircle,
    title: 'Chat',
    description: 'Web-based chat interface',
    features: ['Instant deployment', 'URL + password access', 'Text-based interaction'],
  },
  inbound_call: {
    icon: Phone,
    title: 'Inbound Call',
    description: 'Participants call a provided number',
    features: ['Dedicated phone number', 'Voice interaction', 'Call recording'],
  },
  outbound_call: {
    icon: PhoneCall,
    title: 'Outbound Call',
    description: 'System calls participants',
    features: ['Automated calling', 'Audience upload required', 'Scheduled campaigns'],
  },
};

export function ChannelSelector({ value, onChange, className }: ChannelSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(Object.keys(channelConfig) as Channel[]).map((channel) => {
        const config = channelConfig[channel];
        const IconComponent = config.icon;
        const isSelected = value === channel;
        const price = PRICE_BY_CHANNEL[channel];
        
        return (
          <Card
            key={channel}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              isSelected && 'ring-2 ring-primary shadow-glow'
            )}
            onClick={() => onChange(channel)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{config.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        ${price}/interview
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {config.description}
                    </p>
                    
                    <ul className="space-y-1">
                      {config.features.map((feature, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}