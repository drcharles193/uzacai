
import React, { useState } from 'react';
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
  Home,
  Plus,
  List,
  ChevronDown,
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  
  // Define sidebar main items
  const sidebarItems = [
    { 
      name: 'Home', 
      icon: Home, 
      path: '/',
      color: '#FFCB05',
      exact: true
    },
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashin',
    },
    { 
      name: 'Posts', 
      icon: MessageSquare, 
      path: '#',
      hasSubmenu: true,
      submenuItems: [
        { name: 'Create Post', icon: Plus, path: '#create-post' },
        { name: 'Manage Posts', icon: List, path: '#', comingSoon: true }
      ]
    },
    { 
      name: 'Users', 
      icon: User, 
      path: '#',
      comingSoon: true
    },
    { 
      name: 'Analytics', 
      icon: BarChart3, 
      path: '/analytics' 
    },
    { 
      name: 'Content', 
      icon: FileText, 
      path: '/content' 
    },
    { 
      name: 'Inbox', 
      icon: Inbox, 
      path: '/inbox' 
    },
  ];

  // Handle post creation functionality
  const handleCreatePost = (e: React.MouseEvent) => {
    e.preventDefault();
    // We'll use window.dispatchEvent to communicate with parent components
    window.dispatchEvent(new CustomEvent('open-launchpad'));
  };

  // Determine if item is active
  const isActive = (path: string, exact: boolean = false) => {
    if (path === '#') return false;
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (
    <div 
      className={cn(
        "bg-[#1A2238] flex flex-col h-screen transition-all duration-300",
        expanded ? "w-56" : "w-[60px]"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex items-center p-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#689675] flex items-center justify-center">
          <MessageSquare size={16} className="text-white" />
        </div>
        <span className={cn(
          "text-white text-xl font-semibold ml-3 transition-opacity duration-300",
          expanded ? "opacity-100" : "opacity-0 absolute"
        )}>
          SocialPilot
        </span>
      </div>
      
      <div className="flex flex-col flex-1 px-2 gap-1">
        {sidebarItems.map((item) => (
          <div key={item.name} className="relative">
            {item.hasSubmenu ? (
              <div>
                <button 
                  onClick={() => setPostMenuOpen(!postMenuOpen)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-md",
                    "text-white hover:bg-[#2A2F3C]",
                    postMenuOpen && "bg-[#2A2F3C]"
                  )}
                >
                  <item.icon 
                    className={item.color ? `text-[${item.color}]` : 'text-white'} 
                    size={20} 
                  />
                  <span className={cn(
                    "text-base transition-opacity duration-300",
                    expanded ? "opacity-100" : "opacity-0 absolute"
                  )}>
                    {item.name}
                  </span>
                  {expanded && (
                    postMenuOpen ? 
                    <ChevronDown size={16} className="ml-auto text-white" /> : 
                    <ChevronRight size={16} className="ml-auto text-white" />
                  )}
                </button>
                
                {postMenuOpen && expanded && (
                  <div className="ml-2 pl-4 border-l border-[#2A2F3C] mt-1">
                    {item.submenuItems?.map((subItem) => (
                      <div key={subItem.name}>
                        {subItem.comingSoon ? (
                          <div className="flex items-center gap-2 p-2 text-gray-400 cursor-not-allowed">
                            <subItem.icon size={16} />
                            <span>{subItem.name}</span>
                            <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded ml-auto">Soon</span>
                          </div>
                        ) : (
                          <a 
                            href={subItem.path}
                            onClick={subItem.path === '#create-post' ? handleCreatePost : undefined}
                            className="flex items-center gap-2 p-2 text-white hover:bg-[#2A2F3C] rounded-md"
                          >
                            <subItem.icon size={16} />
                            <span>{subItem.name}</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to={item.comingSoon ? "#" : item.path}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-md",
                  isActive(item.path, item.exact) ? "bg-[#2A2F3C]" : "",
                  "text-white hover:bg-[#2A2F3C]",
                  item.comingSoon && "cursor-not-allowed text-gray-400"
                )}
                onClick={e => item.comingSoon && e.preventDefault()}
              >
                <item.icon 
                  className={item.color ? `text-[${item.color}]` : item.comingSoon ? 'text-gray-400' : 'text-white'} 
                  size={20} 
                />
                <span className={cn(
                  "text-base transition-opacity duration-300",
                  expanded ? "opacity-100" : "opacity-0 absolute"
                )}>
                  {item.name}
                </span>
                {item.comingSoon && expanded && (
                  <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded ml-auto">Soon</span>
                )}
              </Link>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-auto pb-6 px-2">
        <Link 
          to="/settings" 
          className={cn(
            "flex items-center gap-3 p-2.5 rounded-md",
            isActive('/settings') ? "bg-[#2A2F3C]" : "",
            "text-white hover:bg-[#2A2F3C]"
          )}
        >
          <Settings className="text-white" size={20} />
          <span className={cn(
            "text-base transition-opacity duration-300",
            expanded ? "opacity-100" : "opacity-0 absolute"
          )}>
            Settings
          </span>
        </Link>
      </div>
    </div>
  );
};

export default AppSidebar;
