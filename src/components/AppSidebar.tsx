
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import SidebarItem from './sidebar/SidebarItem';
import SettingsLink from './sidebar/SettingsLink';
import { getSidebarItems } from './sidebar/sidebarData';

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  
  // Get sidebar items from our data file
  const sidebarItems = getSidebarItems();

  // Handle post creation functionality
  const handleCreatePost = (e: React.MouseEvent) => {
    e.preventDefault();
    // We'll use window.dispatchEvent to communicate with parent components
    window.dispatchEvent(new CustomEvent('open-launchpad'));
  };

  // Handle navigation to schedule page
  const handleNavigation = (path: string) => {
    if (path === '#create-post') {
      handleCreatePost({ preventDefault: () => {} } as React.MouseEvent);
    } else if (path !== '#') {
      navigate(path);
    }
  };

  // Determine if item is active
  const isActive = (path: string, exact: boolean = false) => {
    if (path === '#') return false;
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (
    <div 
      className={cn(
        "bg-[#1A2238] flex flex-col h-screen sticky top-0 transition-all duration-300",
        expanded ? "w-56" : "w-[60px]"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Main sidebar items with proper spacing */}
      <div className="flex flex-col flex-1 px-2 gap-2 mt-6 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div key={item.name} className="relative">
            <SidebarItem
              {...item}
              isActive={isActive}
              expanded={expanded}
              postMenuOpen={postMenuOpen}
              togglePostMenu={() => setPostMenuOpen(!postMenuOpen)}
              handleCreatePost={handleCreatePost}
              handleNavigation={handleNavigation}
            />
          </div>
        ))}
      </div>
      
      {/* Settings icon positioned at the very bottom */}
      <SettingsLink 
        expanded={expanded} 
        isActive={isActive} 
      />
    </div>
  );
};

export default AppSidebar;
