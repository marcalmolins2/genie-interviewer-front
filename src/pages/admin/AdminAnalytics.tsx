import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Legend
} from 'recharts';
import { 
  Users, 
  MessageSquare,
  Shapes,
  FolderOpen,
  Clock,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { 
  getSystemAnalytics, 
  getProjectAnalytics, 
  getProjectList,
  SystemAnalytics, 
  ProjectAnalytics,
  ProjectListItem
} from '@/services/admin';
import { PROJECT_TYPE_LABELS, ProjectType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  internal_work: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  commercial_proposal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  client_investment: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  client_work: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-primary/20 text-primary border-primary/30',
  editor: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  viewer: 'bg-muted text-muted-foreground border-border',
};

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<'system' | 'project'>('system');
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics | null>(null);
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [membersOpen, setMembersOpen] = useState(false);

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

            {/* Archetype Usage */}
            <Card>
              <CardHeader>
                <CardTitle>By Archetype</CardTitle>
                <CardDescription>Sessions per archetype</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
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
          </div>
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
              {/* Project Header */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{projectAnalytics.projectName}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="font-mono text-xs">
                    {projectAnalytics.caseCode}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={PROJECT_TYPE_COLORS[projectAnalytics.projectType]}
                  >
                    {PROJECT_TYPE_LABELS[projectAnalytics.projectType]}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Last activity {formatDistanceToNow(new Date(projectAnalytics.lastActivityDate), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Sessions Completed */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{projectAnalytics.totalSessions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {projectAnalytics.liveSessions} live • {projectAnalytics.testSessions} test
                    </p>
                  </CardContent>
                </Card>

                {/* Team Members with Collapsible */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Collapsible open={membersOpen} onOpenChange={setMembersOpen}>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full group">
                        <span className="text-3xl font-bold">{projectAnalytics.teamSize}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${membersOpen ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-2">
                        {projectAnalytics.members.map(member => (
                          <div key={member.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground truncate">{member.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs capitalize ${ROLE_COLORS[member.role] || ''}`}
                            >
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>

                {/* Total Duration */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{projectAnalytics.totalDurationHours.toFixed(1)}h</div>
                    <p className="text-xs text-muted-foreground mt-1">Interview time</p>
                  </CardContent>
                </Card>

                {/* Avg Duration */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatDuration(projectAnalytics.avgDurationSec)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Per session</p>
                  </CardContent>
                </Card>
              </div>

              {/* Stacked Bar Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Activity</CardTitle>
                  <CardDescription>Live vs test sessions over 14 days</CardDescription>
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
                        <Bar dataKey="live" name="Live" stackId="sessions" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="test" name="Test" stackId="sessions" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
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