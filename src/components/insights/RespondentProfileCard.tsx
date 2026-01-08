import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import type { RespondentProfile } from '@/types';

interface RespondentProfileCardProps {
  profile?: RespondentProfile;
}

export function RespondentProfileCard({ profile }: RespondentProfileCardProps) {
  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm">Respondent profile not available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{profile.role}</h3>
            {profile.organization && (
              <p className="text-sm text-muted-foreground">{profile.organization}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Background</h4>
          <p className="text-sm leading-relaxed">{profile.background}</p>
        </div>
      </CardContent>
    </Card>
  );
}
