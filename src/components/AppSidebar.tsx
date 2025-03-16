
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  UserPlus,
  BarChart3, 
  Inbox, 
  FileText, 
  Settings,
  Library
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const sidebarItems = [
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashboard',
    color: '#FFCB05',
    isHighlighted: true
  },
  { 
    name: 'Posts', 
    icon: MessageSquare, 
    path: '/posts' 
  },
  { 
    name: 'Calendar', 
    icon: Calendar, 
    path: '/calendar' 
  },
  { 
    name: 'Accounts', 
    icon: Users, 
    path: '/accounts' 
  },
  { 
    name: 'Groups', 
    icon: UserPlus, 
    path: '/groups' 
  },
  { 
    name: 'Analytics', 
    icon: BarChart3, 
    path: '/analytics' 
  },
  { 
    name: 'Inbox', 
    icon: Inbox, 
    path: '/inbox' 
  },
  { 
    name: 'Content', 
    icon: FileText, 
    path: '/content' 
  },
  { 
    name: 'Setup', 
    icon: Settings, 
    path: '/setup' 
  },
];

const AppSidebar = () => {
  const location = useLocation();
  
  return (
    <Sidebar side="left" variant="sidebar" className="bg-[#1A1F2C] border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 text-white">
          <div className="bg-blue-500 p-1.5 rounded-full">
            <MessageSquare size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold">SocialPilot</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === item.path}
                className="text-white hover:bg-[#2A2F3C] data-[active=true]:bg-[#2A2F3C]"
              >
                <Link to={item.path} className="flex items-center gap-3 py-2.5">
                  {item.isHighlighted ? (
                    <item.icon className="text-[#FFCB05]" size={20} />
                  ) : (
                    <item.icon className="text-white" size={20} />
                  )}
                  <span className={`text-base ${item.isHighlighted ? "font-bold text-[#FFCB05]" : ""}`}>
                    {item.name}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto pb-6 px-4">
        <SidebarMenuButton 
          asChild 
          className="text-white hover:bg-[#2A2F3C]"
        >
          <Link to="/resources" className="flex items-center gap-3 py-2.5">
            <Library className="text-white" size={20} />
            <span className="text-base">Resources</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
