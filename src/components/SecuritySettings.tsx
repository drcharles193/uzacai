import React from 'react';
import { Button } from '@/components/ui/button';
import { Key, Shield, Lock, Facebook } from 'lucide-react';
import DeleteAccountSection from './DeleteAccountSection';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SecuritySettings = () => {
  const { toast } = useToast();

  const handleFacebookPermissions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage Facebook permissions.",
          variant: "destructive"
        });
        return;
      }
      
      // Generate Facebook auth URL for permission review
      const response = await supabase.functions.invoke('social-auth', {
        body: JSON.stringify({
          platform: 'facebook',
          action: 'auth-url',
          userId: session.user.id
        })
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start Facebook permission review");
      }
      
      if (!response.data.authUrl) {
        throw new Error("No Facebook auth URL returned");
      }
      
      const width = 800, height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      window.open(
        response.data.authUrl,
        'facebook-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      toast({
        title: "Facebook Permissions",
        description: "Please complete the Facebook permission review in the opened window."
      });
    } catch (error: any) {
      console.error("Error initializing Facebook permission review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start Facebook permission review",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-medium mb-4 pb-1 border-b border-primary w-fit">
          Password & Authentication
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Key size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
                </div>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Shield size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </div>
        </div>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-4 pb-1 border-b border-primary w-fit">
          Connected Accounts
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Facebook size={18} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Facebook Permissions</h4>
                  <p className="text-sm text-muted-foreground">
                    Review or update the permissions granted to this app
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={handleFacebookPermissions}
              >
                Manage Permissions
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Lock size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Data Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage which data our app can access on your connected social accounts
                  </p>
                </div>
              </div>
              <Button variant="outline">Review Permissions</Button>
            </div>
          </div>
        </div>
      </section>
      
      <DeleteAccountSection />
    </div>
  );
};

export default SecuritySettings;
