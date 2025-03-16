
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SettingsLinkProps {
  expanded: boolean;
  isActive: (path: string) => boolean;
}

const SettingsLink: React.FC<SettingsLinkProps> = ({ expanded, isActive }) => {
  return (
    <div className="px-2 mb-6 mt-auto">
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
  );
};

export default SettingsLink;
