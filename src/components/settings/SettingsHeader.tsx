
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { tabs } from './SettingsTabs';

interface SettingsHeaderProps {
  activeTab: string;
  handleExit: () => void;
  handleSave: () => void;
  handleDiscard: () => void;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  activeTab,
  handleExit,
  handleSave,
  handleDiscard
}) => {
  return (
    <div className="flex items-center justify-between pb-4 mb-6 border-b">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExit}
          className="flex items-center gap-1 text-gray-700"
        >
          <ArrowLeft size={16} />
          Exit Settings
        </Button>
        <h2 className="text-xl font-semibold">
          {tabs.find(tab => tab.id === activeTab)?.name}
        </h2>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleDiscard}>
          Discard
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};

export default SettingsHeader;
