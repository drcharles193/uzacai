
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: '12' | '24';
  firstDayOfWeek: string;
  language: string;
}

interface ProfileSettingsProps {
  userProfile: UserProfile;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleRadioChange: (value: '12' | '24') => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userProfile,
  handleInputChange,
  handleSelectChange,
  handleRadioChange
}) => {
  return (
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
  );
};

export default ProfileSettings;
