
import React from 'react';

const NotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4 pb-1 border-b border-primary w-fit">
        Notification Preferences
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white border rounded-md">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="emailNotifications" className="w-4 h-4" defaultChecked />
            <label htmlFor="emailNotifications" className="ml-2">Enable</label>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white border rounded-md">
          <div>
            <h4 className="font-medium">Post Scheduling</h4>
            <p className="text-sm text-gray-500">Get notified when your posts are scheduled or published</p>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="postScheduling" className="w-4 h-4" defaultChecked />
            <label htmlFor="postScheduling" className="ml-2">Enable</label>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white border rounded-md">
          <div>
            <h4 className="font-medium">Analytics Reports</h4>
            <p className="text-sm text-gray-500">Receive weekly analytics reports for your accounts</p>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="analyticsReports" className="w-4 h-4" />
            <label htmlFor="analyticsReports" className="ml-2">Enable</label>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white border rounded-md">
          <div>
            <h4 className="font-medium">Account Activity</h4>
            <p className="text-sm text-gray-500">Get alerts about new logins or suspicious activity</p>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="accountActivity" className="w-4 h-4" defaultChecked />
            <label htmlFor="accountActivity" className="ml-2">Enable</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
