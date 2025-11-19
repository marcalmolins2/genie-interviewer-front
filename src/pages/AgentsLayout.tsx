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
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { LayoutGrid, Trash2, Archive } from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/app/agents', icon: LayoutGrid },
  { name: 'Trash', href: '/app/agents/trash', icon: Trash2 },
  { name: 'Archive', href: '/app/agents/archive', icon: Archive },
];

export default function AgentsLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link to={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 py-8">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
