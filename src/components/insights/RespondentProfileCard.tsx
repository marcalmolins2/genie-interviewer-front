import { Card, CardContent } from '@/components/ui/card';
import { User, CheckCircle2 } from 'lucide-react';
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

        {profile.relevantContext.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Relevant Context</h4>
            <ul className="space-y-1.5">
              {profile.relevantContext.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
