
import React from 'react';
import { User, Bell, CreditCard, Shield, Building2, Users } from 'lucide-react';

export const tabs = [
  { id: 'profile', icon: User, name: 'Profile' },
  { id: 'security', icon: Shield, name: 'Security' },
  { id: 'notifications', icon: Bell, name: 'Notifications' },
  { id: 'organization', icon: Building2, name: 'Organization' },
  { id: 'users', icon: Users, name: 'Users' },
  { id: 'subscriptions', icon: CreditCard, name: 'Subscriptions' },
];

interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left mb-1 ${
            activeTab === tab.id 
              ? 'bg-primary/10 text-primary' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : ''} />
          <span>{tab.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default SettingsTabs;
