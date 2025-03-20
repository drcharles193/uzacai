
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ComingSoonTabProps {
  icon: LucideIcon;
}

const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-primary/10 rounded-full p-4 mb-4">
        <Icon size={32} className="text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
      <p className="text-gray-500 max-w-md">
        We're working on adding this feature. Check back soon for updates!
      </p>
    </div>
  );
};

export default ComingSoonTab;
