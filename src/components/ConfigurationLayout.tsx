import { ReactNode } from "react";
import { useSidebar } from "@/components/ui/sidebar";

interface ConfigurationLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/**
 * A shared layout component for multi-step configuration flows.
 * 
 * Uses a viewport-constrained flexbox layout that:
 * - Keeps header sticky at top
 * - Keeps footer fixed at bottom
 * - Only scrolls content area when needed (no artificial scroll space)
 * - Properly adjusts for sidebar width on desktop
 */
export function ConfigurationLayout({ header, footer, children }: ConfigurationLayoutProps) {
  const { state: sidebarState, isMobile } = useSidebar();

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 sticky top-0 z-20 border-b bg-card">
        {header}
      </div>
      
      {/* Scrollable Content Area - only scrolls if content exceeds available height */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      
      {/* Fixed Footer */}
      <div 
        className="flex-shrink-0 border-t bg-card z-10 transition-[left] duration-200 ease-in-out"
        style={{ 
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: isMobile ? "0px" : sidebarState === "expanded" ? "var(--sidebar-width)" : "var(--sidebar-width-icon)"
        }}
      >
        {footer}
      </div>
    </div>
  );
}
