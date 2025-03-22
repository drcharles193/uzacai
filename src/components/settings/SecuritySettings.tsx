
import React from 'react';
import { Button } from '@/components/ui/button';
import { Key, Shield } from 'lucide-react';
import DeleteAccountSection from './DeleteAccountSection';

const SecuritySettings = () => {
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
      
      <DeleteAccountSection />
    </div>
  );
};

export default SecuritySettings;
