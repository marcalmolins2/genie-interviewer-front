import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Pencil, Play, Rocket } from 'lucide-react';

export default function GuidedConfigReview() {
  const navigate = useNavigate();

  const handleEdit = (section: 'project' | 'settings' | 'content') => {
    // Navigate back to guided config with appropriate tab/step
    if (section === 'settings') {
      navigate('/app/interviewers/new/guided?tab=settings');
    } else {
      navigate('/app/interviewers/new/guided?tab=content');
    }
  };

  const handleTest = () => {
    // TODO: Implement test dialog
    console.log('Opening test dialog...');
  };

  const handlePublish = () => {
    // TODO: Implement publish
    console.log('Publishing...');
    navigate('/app/interviewers');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app/interviewers/new/guided')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Editor
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTest}>
              <Play className="h-4 w-4 mr-2" />
              Test Interviewer
            </Button>
            <Button onClick={handlePublish}>
              <Rocket className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Review Your Interviewer</h1>
            <p className="text-muted-foreground">
              Review all settings before publishing. You can edit any section by clicking the edit button.
            </p>
          </div>

          {/* Project Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Project</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleEdit('project')}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">Sample Project</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">Client Work</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Case Code</span>
                  <span className="font-medium">BCG-2024-001</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Settings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleEdit('settings')}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Archetype</span>
                    <span className="font-medium">Expert Interview</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">30 minutes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interviewer Name</span>
                    <span className="font-medium">Alex</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">English (US)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Channel</span>
                    <span className="font-medium">Web Link</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Content Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Interview Content</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleEdit('content')}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Research Brief</h4>
                  <p className="text-sm text-muted-foreground">
                    No research brief configured yet.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Introduction</h4>
                  <p className="text-sm text-muted-foreground">
                    No introduction configured yet.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Guide Sections</h4>
                  <p className="text-sm text-muted-foreground">
                    No guide sections configured yet.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Closing</h4>
                  <p className="text-sm text-muted-foreground">
                    No closing configured yet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
