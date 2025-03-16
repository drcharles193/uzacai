
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Calendar, Heart, Users, Image, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  signupDate?: string;
}

const UserPage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    bio: 'Social media manager with 5+ years of experience helping brands grow their online presence.'
  });
  
  useEffect(() => {
    console.log("UserPage component mounted");
    // Get user data from localStorage
    const userData = localStorage.getItem('socialAI_user');
    console.log("User data from localStorage:", userData);
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        firstName: parsedUser.firstName,
        lastName: parsedUser.lastName,
        email: parsedUser.email
      }));
    } else {
      console.log("No user data found in localStorage");
      // Create mock user for testing
      const mockUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        signupDate: new Date().toISOString()
      };
      localStorage.setItem('socialAI_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setFormData(prev => ({
        ...prev,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveChanges = () => {
    if (user) {
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };
      
      localStorage.setItem('socialAI_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }
  };
  
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading user data...</div>;
  }
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - User Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-500 w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <CardTitle className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </CardTitle>
              <p className="text-gray-500 text-sm">Social Media Manager</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-500" size={18} />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-500" size={18} />
                  <span className="text-sm">{formData.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-gray-500" size={18} />
                  <span className="text-sm">{formData.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-500" size={18} />
                  <span className="text-sm">Joined {new Date(user.signupDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 my-4 pt-4">
                <h3 className="font-medium mb-3">Stats</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2">
                    <div className="flex justify-center">
                      <Image className="text-blue-500" size={18} />
                    </div>
                    <div className="text-lg font-semibold">24</div>
                    <div className="text-xs text-gray-500">Posts</div>
                  </div>
                  <div className="p-2">
                    <div className="flex justify-center">
                      <Heart className="text-blue-500" size={18} />
                    </div>
                    <div className="text-lg font-semibold">845</div>
                    <div className="text-xs text-gray-500">Likes</div>
                  </div>
                  <div className="p-2">
                    <div className="flex justify-center">
                      <Users className="text-blue-500" size={18} />
                    </div>
                    <div className="text-lg font-semibold">378</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Right column - User Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                    <Input 
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                    <Input 
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location" className="text-gray-700">Location</Label>
                  <Input 
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio" className="text-gray-700">Bio</Label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full rounded-md border border-input px-3 py-2 text-base md:text-sm ${!isEditing ? "bg-gray-50" : "bg-background"}`}
                  />
                </div>
                
                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveChanges}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Social Accounts Card */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Connected Social Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center p-4 border rounded-md">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Facebook</h3>
                    <p className="text-xs text-gray-500">Connected</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 border rounded-md">
                  <div className="h-10 w-10 rounded-full bg-blue-400 flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Twitter</h3>
                    <p className="text-xs text-gray-500">Connected</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 border rounded-md">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Instagram</h3>
                    <p className="text-xs text-gray-500">Connected</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserPage;
