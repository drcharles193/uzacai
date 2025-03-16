import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  Inbox, 
  FileText, 
  Settings,
  Library,
  User,
  Grid,
  MessageCircle,
  CalendarDays,
  LineChart
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const location = useLocation();
  console.log("Current location in AppSidebar:", location.pathname);
  
  return (
    <Sidebar side="left" variant="sidebar" className="bg-[#1A1F2C] border-r-0 w-16">
      <SidebarContent className="px-0">
        <SidebarMenu>
          {/* Icon for Messages (shown as first icon in the image) */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={false}
              className="flex justify-center text-white hover:bg-[#2A2F3C] py-4"
            >
              <Link to="#" className="flex flex-col items-center">
                <div className="bg-blue-500 p-1.5 rounded-full">
                  <MessageCircle size={20} className="text-white" />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Dashboard icon */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={location.pathname === '/dashboard' || location.pathname === '/user'}
              className="flex justify-center text-white hover:bg-[#2A2F3C] py-4"
            >
              <Link to="/dashboard" className="flex flex-col items-center">
                <Grid size={20} className="text-white" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Calendar icon */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={false}
              className="flex justify-center text-white hover:bg-[#2A2F3C] py-4"
            >
              <Link to="#" className="flex flex-col items-center">
                <CalendarDays size={20} className="text-white" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Analytics icon */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={false}
              className="flex justify-center text-white hover:bg-[#2A2F3C] py-4"
            >
              <Link to="#" className="flex flex-col items-center">
                <LineChart size={20} className="text-white" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Other icons matching sidebar */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={false}
              className="flex justify-center text-white hover:bg-[#2A2F3C] py-4"
            >
              <Link to="#" className="flex flex-col items-center">
                <Users size={20} className="text-white" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
