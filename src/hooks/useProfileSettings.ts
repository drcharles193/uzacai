
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from '@/components/settings/ProfileSettings';

export const useProfileSettings = () => {
  const navigate = useNavigate();
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

  return {
    userProfile,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleRadioChange,
    handleSave
  };
};
