
import React from 'react';
import { SubmenuItem } from './SidebarItem';

interface SubmenuItemsProps {
  submenuItems: SubmenuItem[];
  handleCreatePost?: (e: React.MouseEvent) => void;
  handleNavigation?: (path: string) => void;
}

const SubmenuItems: React.FC<SubmenuItemsProps> = ({ 
  submenuItems, 
  handleCreatePost,
  handleNavigation
}) => {
  return (
    <div className="ml-8 mt-1 space-y-1">
      {submenuItems.map((item) => (
        <button
          key={item.name}
          className={`flex items-center gap-2 p-2 rounded-md text-white text-sm hover:bg-[#2A2F3C] w-full text-left ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={(e) => {
            if (item.comingSoon) {
              e.preventDefault();
              return;
            }
            
            if (item.path === '#create-post' && handleCreatePost) {
              handleCreatePost(e);
            } else if (handleNavigation) {
              handleNavigation(item.path);
            }
          }}
          disabled={item.comingSoon}
        >
          <item.icon size={16} />
          <span>{item.name}</span>
          {item.comingSoon && (
            <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded ml-auto">Soon</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SubmenuItems;
