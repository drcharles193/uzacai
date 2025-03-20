
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsTabs from './SettingsTabs';

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleExit: () => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeTab,
  setActiveTab,
  handleExit
}) => {
  return (
    <div className="w-56 border-r bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-medium">Settings</h1>
        <Button variant="ghost" size="icon" onClick={handleExit} className="text-gray-500">
          <X size={18} />
        </Button>
      </div>
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default SettingsSidebar;
