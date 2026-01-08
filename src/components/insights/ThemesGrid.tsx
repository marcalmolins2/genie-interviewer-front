import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface Theme {
  id: string;
  title: string;
  description: string;
  sessionCount: number;
}

interface ThemesGridProps {
  themes: Theme[];
}

export function ThemesGrid({ themes }: ThemesGridProps) {
  return (
    <div className="space-y-4">
      {themes.map((theme) => (
        <Card key={theme.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base font-semibold">{theme.title}</CardTitle>
              <Badge variant="secondary" className="text-xs shrink-0">
                {theme.sessionCount} sessions
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {theme.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
