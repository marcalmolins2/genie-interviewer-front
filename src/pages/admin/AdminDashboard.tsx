import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shapes, 
  BarChart3, 
  Users, 
  MessageSquare,
  ArrowRight,
  Clock,
  TrendingUp,
  Database,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { getSystemAnalytics, SystemAnalytics } from '@/services/admin';
import { seedDataService } from '@/services/seedData';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedExists, setSeedExists] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getSystemAnalytics(),
      seedDataService.checkSeedDataExists()
    ]).then(([data, exists]) => {
      setAnalytics(data);
      setSeedExists(exists);
      setLoading(false);
    });
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await seedDataService.seedAll();
      if (result.success) {
        toast({
          title: 'Data seeded successfully',
          description: result.results.join('\n'),
        });
        setSeedExists(true);
        // Refresh analytics
        const data = await getSystemAnalytics();
        setAnalytics(data);
      } else {
        toast({
          title: 'Seeding failed',
          description: result.results.join('\n'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error seeding data',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const quickLinks = [
    { name: 'Manage Archetypes', href: '/app/admin/archetypes', icon: Shapes, description: 'Add, edit, or remove interview archetypes' },
    { name: 'View Analytics', href: '/app/admin/analytics', icon: BarChart3, description: 'See detailed usage statistics and trends' },
    { name: 'Feature Flags', href: '/app/admin/feature-flags', icon: TrendingUp, description: 'Toggle features on or off' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of system configuration and usage</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Shapes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.totalInterviewers}</div>
            <p className="text-xs text-muted-foreground">Active interviewers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Conducted to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground">In the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Interview success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Seed Data Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Seed Sample Data
          </CardTitle>
          <CardDescription>
            Populate the database with sample projects, interviewers, and sessions for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {seedExists ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Sample data already exists in the database
            </div>
          ) : (
            <Button onClick={handleSeedData} disabled={seeding}>
              {seeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Data Now
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Links and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickLinks.map((link) => (
              <Link key={link.name} to={link.href}>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <link.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{link.name}</p>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-muted">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
