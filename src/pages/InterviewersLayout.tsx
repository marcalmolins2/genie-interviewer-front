import { Outlet, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { LayoutGrid, Trash2, Archive } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navigation = [
  { name: 'Overview', href: '/app/interviewers', icon: LayoutGrid },
  { name: 'Trash', href: '/app/interviewers/trash', icon: Trash2 },
  { name: 'Archive', href: '/app/interviewers/archive', icon: Archive },
];

function InterviewersSidebar() {
  const location = useLocation();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300">
      <div className="p-2">
        <SidebarTrigger className="w-full" />
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <TooltipProvider>
              <SidebarMenu>
                {navigation.map((item) => {
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
  );
}

export default function InterviewersLayout() {
  return (
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
  );
}
