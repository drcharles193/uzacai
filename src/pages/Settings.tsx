
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import SettingsHeader from '@/components/settings/SettingsHeader';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SubscriptionSettings from '@/components/settings/SubscriptionSettings';
import ComingSoonTab from '@/components/settings/ComingSoonTab';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { tabs } from '@/components/settings/SettingsTabs';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const {
    userProfile,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleRadioChange,
    handleSave
  } = useProfileSettings();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleDiscard = () => {
    window.location.reload();
  };

  const handleExit = () => {
    navigate('/dashin');
  };

  const renderTabContent = () => {
    if (isLoading) {
      return <div className="p-6 text-center">Loading settings...</div>;
    }

    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSettings
            userProfile={userProfile}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleRadioChange={handleRadioChange}
          />
        );
      case 'notifications':
        return <NotificationSettings />;
      case 'subscriptions':
        return <SubscriptionSettings />;
      case 'security':
      case 'organization':
      case 'users':
        const currentTab = tabs.find(tab => tab.id === activeTab);
        if (currentTab?.icon) {
          return <ComingSoonTab icon={currentTab.icon} />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SettingsSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleExit={handleExit}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <SettingsHeader
            activeTab={activeTab}
            handleExit={handleExit}
            handleSave={handleSave}
            handleDiscard={handleDiscard}
          />

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
