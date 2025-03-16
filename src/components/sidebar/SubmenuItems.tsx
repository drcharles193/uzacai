
import React from 'react';
import { SubmenuItem } from './SidebarItem';

interface SubmenuItemsProps {
  submenuItems: SubmenuItem[];
  handleCreatePost?: (e: React.MouseEvent) => void;
}

const SubmenuItems: React.FC<SubmenuItemsProps> = ({ submenuItems, handleCreatePost }) => {
  return (
    <div className="ml-2 pl-4 border-l border-[#2A2F3C] mt-1">
      {submenuItems.map((subItem) => (
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
  );
};

export default SubmenuItems;
