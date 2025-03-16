import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Bell, CreditCard, Shield, Building2, Users, 
  X, ChevronDown, Save, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the tabs in the settings page
const tabs = [
  { id: 'profile', icon: User, name: 'Profile' },
  { id: 'security', icon: Shield, name: 'Security' },
  { id: 'notifications', icon: Bell, name: 'Notifications' },
  { id: 'organization', icon: Building2, name: 'Organization' },
  { id: 'users', icon: Users, name: 'Users' },
  { id: 'subscriptions', icon: CreditCard, name: 'Subscriptions' },
];

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: '12' | '24';
  firstDayOfWeek: string;
  language: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    timeZone: 'Central Time (US & Canada) (GMT-06:00)',
    dateFormat: 'MMM DD, YYYY (Jan 15, 2017)',
    timeFormat: '12',
    firstDayOfWeek: 'Sunday',
    language: 'English'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get query param if any (for direct navigation to tabs)
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const metadata = user.user_metadata;
          setUserProfile({
            firstName: metadata?.firstName || metadata?.first_name || '',
            lastName: metadata?.lastName || metadata?.last_name || '',
            email: user.email || '',
            timeZone: metadata?.timeZone || 'Central Time (US & Canada) (GMT-06:00)',
            dateFormat: metadata?.dateFormat || 'MMM DD, YYYY (Jan 15, 2017)',
            timeFormat: metadata?.timeFormat || '12',
            firstDayOfWeek: metadata?.firstDayOfWeek || 'Sunday',
            language: metadata?.language || 'English'
          });
        } else {
          // Redirect to home if no user
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: '12' | '24') => {
    setUserProfile(prev => ({ ...prev, timeFormat: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          timeZone: userProfile.timeZone,
          dateFormat: userProfile.dateFormat,
          timeFormat: userProfile.timeFormat,
          firstDayOfWeek: userProfile.firstDayOfWeek,
          language: userProfile.language
        }
      });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    }
  };

  const handleDiscard = () => {
    // Reload the page to discard changes
    window.location.reload();
  };

  const handleExit = () => {
    navigate('/dashin');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <div className="w-56 border-r bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-medium">Settings</h1>
          <Button variant="ghost" size="icon" onClick={handleExit} className="text-gray-500">
            <X size={18} />
          </Button>
        </div>
        
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
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b">
            <h2 className="text-xl font-semibold">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDiscard}>
                Discard
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>

          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-medium mb-4 pb-1 border-b border-primary w-fit">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="mb-1.5 block">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={userProfile.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="mb-1.5 block">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={userProfile.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-1.5 block">
                      Email ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={userProfile.email}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-4 pb-1 border-b border-primary w-fit">
                  Localization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="timeZone" className="mb-1.5 block">
                      Time Zone
                    </Label>
                    <Select 
                      value={userProfile.timeZone} 
                      onValueChange={(value) => handleSelectChange('timeZone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pacific Time (US & Canada) (GMT-08:00)">
                          Pacific Time (US & Canada) (GMT-08:00)
                        </SelectItem>
                        <SelectItem value="Mountain Time (US & Canada) (GMT-07:00)">
                          Mountain Time (US & Canada) (GMT-07:00)
                        </SelectItem>
                        <SelectItem value="Central Time (US & Canada) (GMT-06:00)">
                          Central Time (US & Canada) (GMT-06:00)
                        </SelectItem>
                        <SelectItem value="Eastern Time (US & Canada) (GMT-05:00)">
                          Eastern Time (US & Canada) (GMT-05:00)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat" className="mb-1.5 block">
                      Date Format
                    </Label>
                    <Select 
                      value={userProfile.dateFormat} 
                      onValueChange={(value) => handleSelectChange('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY (01/15/2017)">
                          MM/DD/YYYY (01/15/2017)
                        </SelectItem>
                        <SelectItem value="DD/MM/YYYY (15/01/2017)">
                          DD/MM/YYYY (15/01/2017)
                        </SelectItem>
                        <SelectItem value="YYYY/MM/DD (2017/01/15)">
                          YYYY/MM/DD (2017/01/15)
                        </SelectItem>
                        <SelectItem value="MMM DD, YYYY (Jan 15, 2017)">
                          MMM DD, YYYY (Jan 15, 2017)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">
                      Time Format
                    </Label>
                    <RadioGroup 
                      value={userProfile.timeFormat} 
                      onValueChange={handleRadioChange as any}
                      className="flex gap-4 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="12h" />
                        <Label htmlFor="12h">12 Hours</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="24" id="24h" />
                        <Label htmlFor="24h">24 Hours</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="firstDayOfWeek" className="mb-1.5 block">
                      First Day of the Week
                    </Label>
                    <Select 
                      value={userProfile.firstDayOfWeek} 
                      onValueChange={(value) => handleSelectChange('firstDayOfWeek', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select first day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language" className="mb-1.5 block">
                      Language
                    </Label>
                    <Select 
                      value={userProfile.language} 
                      onValueChange={(value) => handleSelectChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Notifications Tab Content */}
          {activeTab === 'notifications' && (
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
          )}

          {/* Subscriptions Tab Content */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4 pb-1 border-b border-primary w-fit">
                Your Subscription
              </h3>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-2">
                        Active
                      </div>
                      <h3 className="text-xl font-semibold">Free Trial Plan</h3>
                      <p className="text-gray-500">Basic features included</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Your plan renews on</p>
                      <p className="font-medium">August 15, 2023</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-medium mb-4">Plan Features</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check size={18} className="text-primary" />
                      <span>5 social media accounts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={18} className="text-primary" />
                      <span>Basic content scheduling</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={18} className="text-primary" />
                      <span>Standard analytics</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <X size={18} />
                      <span>Advanced post targeting</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <X size={18} />
                      <span>Team collaboration</span>
                    </li>
                  </ul>
                  
                  <div className="mt-8">
                    <Button className="w-full">Upgrade Plan</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs could be implemented here */}
          {(activeTab === 'security' || activeTab === 'organization' || activeTab === 'users') && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                {(() => {
                  const currentTab = tabs.find(tab => tab.id === activeTab);
                  if (currentTab?.icon) {
                    const IconComponent = currentTab.icon;
                    return <IconComponent size={32} className="text-primary" />;
                  }
                  return null;
                })()}
              </div>
              <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
              <p className="text-gray-500 max-w-md">
                We're working on adding this feature. Check back soon for updates!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
