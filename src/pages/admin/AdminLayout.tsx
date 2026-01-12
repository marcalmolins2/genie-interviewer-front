import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shapes, 
  BarChart3,
  Flag,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AdminRoute } from '@/components/AdminRoute';

const navigation = [
  { name: 'Dashboard', href: '/app/admin', icon: LayoutDashboard, end: true },
  { name: 'Archetypes', href: '/app/admin/archetypes', icon: Shapes, end: false },
  { name: 'Analytics', href: '/app/admin/analytics', icon: BarChart3, end: false },
  { name: 'Feature Flags', href: '/app/admin/flags', icon: Flag, end: false },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <AdminRoute>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card/50 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                <NavLink to="/app/agents">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to App
                </NavLink>
              </Button>
            </div>
            <h2 className="text-lg font-semibold mt-3 text-foreground">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Manage system configuration</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = item.end 
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.end}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </AdminRoute>
  );
}
