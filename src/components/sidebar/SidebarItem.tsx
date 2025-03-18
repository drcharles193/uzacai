
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import SubmenuItems from './SubmenuItems';

// Define types for sidebar items
export interface SubmenuItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  comingSoon?: boolean;
}

export interface SidebarItemProps {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  color?: string;
  exact?: boolean;
  hasSubmenu?: boolean;
  submenuItems?: SubmenuItem[];
  comingSoon?: boolean;
  isActive: (path: string, exact?: boolean) => boolean;
  expanded: boolean;
  postMenuOpen: boolean;
  togglePostMenu?: () => void;
  handleCreatePost?: (e: React.MouseEvent) => void;
  handleNavigation?: (path: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon: Icon,
  path,
  color,
  exact,
  hasSubmenu,
  submenuItems,
  comingSoon,
  isActive,
  expanded,
  postMenuOpen,
  togglePostMenu,
  handleCreatePost,
  handleNavigation
}) => {
  if (hasSubmenu) {
    return (
      <div>
        <button 
          onClick={togglePostMenu}
          className={cn(
            "w-full flex items-center gap-3 p-2.5 rounded-md",
            "text-white hover:bg-[#2A2F3C]",
            postMenuOpen && "bg-[#2A2F3C]"
          )}
        >
          <Icon 
            className={color ? `text-[${color}]` : 'text-white'} 
            size={20} 
          />
          <span className={cn(
            "text-base transition-opacity duration-300",
            expanded ? "opacity-100" : "opacity-0 absolute"
          )}>
            {name}
          </span>
          {expanded && (
            postMenuOpen ? 
            <ChevronDown size={16} className="ml-auto text-white" /> : 
            <ChevronRight size={16} className="ml-auto text-white" />
          )}
        </button>
        
        {postMenuOpen && expanded && submenuItems && (
          <SubmenuItems 
            submenuItems={submenuItems} 
            handleCreatePost={handleCreatePost}
            handleNavigation={handleNavigation}
          />
        )}
      </div>
    );
  }

  return (
    <Link 
      to={comingSoon ? "#" : path}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-md",
        isActive(path, exact) ? "bg-[#2A2F3C]" : "",
        "text-white hover:bg-[#2A2F3C]",
        comingSoon && "cursor-not-allowed text-gray-400"
      )}
      onClick={e => {
        if (comingSoon) {
          e.preventDefault();
        }
      }}
    >
      <Icon 
        className={color ? `text-[${color}]` : comingSoon ? 'text-gray-400' : 'text-white'} 
        size={20} 
      />
      <span className={cn(
        "text-base transition-opacity duration-300",
        expanded ? "opacity-100" : "opacity-0 absolute"
      )}>
        {name}
      </span>
      {comingSoon && expanded && (
        <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded ml-auto">Soon</span>
      )}
    </Link>
  );
};

export default SidebarItem;
