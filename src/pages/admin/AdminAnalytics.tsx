import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Users, 
  MessageSquare,
  TrendingUp,
  Shapes,
  FolderOpen,
  Clock,
  CheckCircle2,
  TestTube
} from 'lucide-react';
import { 
  getSystemAnalytics, 
  getProjectAnalytics, 
  getProjectList,
  SystemAnalytics, 
  ProjectAnalytics,
  ProjectListItem
} from '@/services/admin';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<'system' | 'project'>('system');
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics | null>(null);
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSystemAnalytics(),
      getProjectList()
    ]).then(([system, projects]) => {
      setSystemAnalytics(system);
      setProjectList(projects);
      if (projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedProjectId && activeTab === 'project') {
      getProjectAnalytics(selectedProjectId).then(setProjectAnalytics);
    }
  }, [selectedProjectId, activeTab]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const last7DaysData = systemAnalytics?.usageByDay.slice(-7) || [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Usage statistics and insights</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'system' | 'project')}>
        <TabsList>
          <TabsTrigger value="system">System Overview</TabsTrigger>
          <TabsTrigger value="project">Per Project</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="system" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemAnalytics?.overview.totalProjects}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviewers</CardTitle>
                <Shapes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemAnalytics?.overview.totalInterviewers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemAnalytics?.overview.totalSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemAnalytics?.overview.activeUsers}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sessions Over Time</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last7DaysData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { weekday: 'short' })}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelFormatter={(v) => new Date(v).toLocaleDateString()}
                      />
                      <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Channel</CardTitle>
                <CardDescription>Session distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={systemAnalytics?.usageByChannel}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="channel"
                        label={({ channel, percentage }) => `${channel}: ${percentage}%`}
                      >
                        {systemAnalytics?.usageByChannel.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Archetype Usage */}
          <Card>
            <CardHeader>
              <CardTitle>By Archetype</CardTitle>
              <CardDescription>Sessions per archetype</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={systemAnalytics?.usageByArchetype} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal vertical={false} />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="archetype" className="text-xs" width={100} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Per Project Tab */}
        <TabsContent value="project" className="space-y-6 mt-6">
          {/* Project Selector */}
          <div className="flex items-center gap-4">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projectList.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.caseCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {projectAnalytics && (
            <>
              {/* Project Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectAnalytics.teamSize}</div>
                    <div className="flex gap-2 mt-1">
                      {projectAnalytics.membersByRole.filter(r => r.count > 0).map(r => (
                        <span key={r.role} className="text-xs text-muted-foreground">
                          {r.count} {r.role}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interviewers</CardTitle>
                    <Shapes className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectAnalytics.totalInterviewers}</div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {projectAnalytics.interviewersByStatus.map(s => (
                        <span key={s.status} className="text-xs text-muted-foreground capitalize">
                          {s.count} {s.status}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Live Sessions</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectAnalytics.liveSessions}</div>
                    <p className="text-xs text-muted-foreground">{projectAnalytics.testSessions} test sessions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Duration & Activity Row */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Duration Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Avg Duration</span>
                      </div>
                      <span className="font-medium">{formatDuration(projectAnalytics.avgDurationSec)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total Time</span>
                      </div>
                      <span className="font-medium">{projectAnalytics.totalDurationHours.toFixed(1)}h</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Sessions by Channel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectAnalytics.interviewersByChannel.map(c => {
                        const total = projectAnalytics.totalInterviewers;
                        const pct = total > 0 ? (c.count / total) * 100 : 0;
                        return (
                          <div key={c.channel}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{c.channel.replace('_', ' ')}</span>
                              <span>{c.count} interviewer{c.count !== 1 ? 's' : ''}</span>
                            </div>
                            <Progress value={pct} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Activity (14 days)</CardTitle>
                  <CardDescription>Live vs test sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={projectAnalytics.sessionsByDay}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          labelFormatter={(v) => new Date(v).toLocaleDateString()}
                        />
                        <Legend />
                        <Bar dataKey="live" name="Live" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="test" name="Test" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
