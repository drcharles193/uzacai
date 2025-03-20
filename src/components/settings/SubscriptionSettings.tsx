
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const SubscriptionSettings: React.FC = () => {
  return (
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
  );
};

export default SubscriptionSettings;
