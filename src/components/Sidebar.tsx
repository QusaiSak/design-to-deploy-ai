
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { 
  Home, 
  Code, 
  FileCode,
  Settings,
  Plus,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();
  
  const sidebarItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />
    },
    {
      name: 'New Project',
      path: '/new',
      icon: <Plus className="h-5 w-5 mr-2" />
    },
    {
      name: 'My Projects',
      path: '/projects',
      icon: <FileCode className="h-5 w-5 mr-2" />
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="h-5 w-5 mr-2" />
    }
  ];

  return (
    <div className={cn(
      "flex h-screen flex-col bg-sidebar border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-14 items-center px-4 py-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">WireframeAI</span>
          </div>
        )}
        {collapsed && <Code className="h-6 w-6 mx-auto text-primary" />}
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 gap-1">
          {sidebarItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent transition-colors",
                location.pathname === item.path ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground"
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center justify-between">
          {!collapsed && <span className="text-sm text-muted-foreground">Account</span>}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
