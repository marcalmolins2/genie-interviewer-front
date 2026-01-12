import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { LayoutGrid, Trash2, Archive, FolderOpen, Plus, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Project, PROJECT_TYPE_LABELS } from '@/types';
import { projectsService } from '@/services/projects';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { ProjectSettingsDialog } from '@/components/ProjectSettingsDialog';
import { cn } from '@/lib/utils';

// Context for sharing selected project with child routes
interface ProjectContextType {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projects: Project[];
  refreshProjects: () => Promise<void>;
  isLoadingProjects: boolean;
}

const ProjectContext = createContext<ProjectContextType>({
  selectedProjectId: null,
  setSelectedProjectId: () => {},
  projects: [],
  refreshProjects: async () => {},
  isLoadingProjects: true,
});

export const useProjectContext = () => useContext(ProjectContext);

const navigation = [
  { name: 'All Interviewers', href: '/app/interviewers', icon: LayoutGrid, id: 'all' },
];

const bottomNavigation = [
  { name: 'Trash', href: '/app/interviewers/trash', icon: Trash2 },
  { name: 'Archive', href: '/app/interviewers/archive', icon: Archive },
];

function InterviewersSidebar() {
  const location = useLocation();
  const { open } = useSidebar();
  const { 
    selectedProjectId, 
    setSelectedProjectId, 
    projects, 
    refreshProjects 
  } = useProjectContext();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsProject, setSettingsProject] = useState<Project | null>(null);

  const handleProjectCreated = async () => {
    await refreshProjects();
  };

  const isAllActive = location.pathname === '/app/interviewers' && selectedProjectId === null;

  return (
    <>
      <Sidebar collapsible="icon" className="border-r h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300">
        <div className="p-2">
          <SidebarTrigger className="w-full" />
        </div>
        
        <SidebarContent>
          {/* Overview Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <TooltipProvider>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isAllActive}
                            onClick={() => setSelectedProjectId(null)}
                          >
                            <Link to={item.href}>
                              <item.icon className="h-4 w-4" />
                              {open && <span>{item.name}</span>}
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {!open && (
                          <TooltipContent side="right">
                            <p>{item.name}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </TooltipProvider>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Projects Section */}
          <SidebarGroup>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              {open && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>New Project</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <SidebarGroupContent>
              <TooltipProvider>
                <SidebarMenu>
                  {projects.map((project) => {
                    const isActive = selectedProjectId === project.id;
                    return (
                      <SidebarMenuItem key={project.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton 
                              isActive={isActive}
                              onClick={() => setSelectedProjectId(project.id)}
                              className="group/project"
                            >
                              <FolderOpen className="h-4 w-4" />
                              {open && (
                                <div className="flex-1 flex items-center justify-between min-w-0">
                                  <span className="truncate">{project.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-5 w-5 opacity-0 group-hover/project:opacity-100 transition-opacity",
                                      isActive && "opacity-100"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSettingsProject(project);
                                    }}
                                  >
                                    <Settings className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {!open && (
                            <TooltipContent side="right">
                              <p>{project.name}</p>
                              <p className="text-xs text-muted-foreground">{project.caseCode}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}

                  {/* New Project Button (collapsed mode) */}
                  {!open && (
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4" />
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>New Project</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </TooltipProvider>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Bottom Navigation */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <TooltipProvider>
                <SidebarMenu>
                  {bottomNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton asChild isActive={isActive}>
                              <Link to={item.href}>
                                <item.icon className="h-4 w-4" />
                                {open && <span>{item.name}</span>}
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {!open && (
                            <TooltipContent side="right">
                              <p>{item.name}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </TooltipProvider>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />

      <ProjectSettingsDialog
        project={settingsProject}
        open={!!settingsProject}
        onOpenChange={(open) => !open && setSettingsProject(null)}
        onProjectUpdated={refreshProjects}
        onProjectDeleted={refreshProjects}
      />
    </>
  );
}

export default function InterviewersLayout() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const refreshProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId, projects, refreshProjects, isLoadingProjects }}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full">
          <InterviewersSidebar />

          <main className="flex-1 py-8 min-h-[calc(100vh-4rem)]">
            <div className="container">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProjectContext.Provider>
  );
}
