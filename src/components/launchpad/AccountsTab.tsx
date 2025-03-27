
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, CheckSquare, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface AccountsTabProps {
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
    account_type?: string;
    platform_account_id?: string;
  }>;
  selectedAccounts: string[];
  setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>;
}

const AccountsTab: React.FC<AccountsTabProps> = ({ 
  connectedAccounts, 
  selectedAccounts, 
  setSelectedAccounts 
}) => {
  const handleAccountToggle = (accountName: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountName) 
        ? prev.filter(name => name !== accountName) 
        : [...prev, accountName]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === connectedAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(connectedAccounts.map(account => account.account_name));
    }
  };

  const allSelected = connectedAccounts.length > 0 && 
    selectedAccounts.length === connectedAccounts.length;

  // Function to get platform-specific styles and status
  const getPlatformInfo = (platform: string) => {
    // Default to implemented for Twitter and LinkedIn
    let isImplemented = platform === 'twitter' || platform === 'linkedin';
    let bgColor = '';
    let icon = null;
    
    switch(platform) {
      case 'twitter':
        bgColor = 'bg-blue-400';
        icon = (
          <svg fill="white" viewBox="0 0 24 24" width="14" height="14">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
          </svg>
        );
        break;
      case 'linkedin':
        bgColor = 'bg-blue-700';
        icon = (
          <svg fill="white" viewBox="0 0 24 24" width="14" height="14">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
          </svg>
        );
        break;
      case 'facebook':
        isImplemented = true; // Facebook is now implemented
        bgColor = 'bg-[#4267B2]';
        icon = (
          <svg fill="white" viewBox="0 0 24 24" width="14" height="14">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
        break;
      case 'instagram':
        isImplemented = true; // Instagram is now implemented
        bgColor = 'bg-[#E1306C]';
        icon = (
          <svg fill="white" viewBox="0 0 24 24" width="14" height="14">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        );
        break;
      default:
        bgColor = 'bg-gray-400';
        icon = null;
    }
    
    return { isImplemented, bgColor, icon };
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="selectAll" 
            checked={allSelected} 
            onCheckedChange={handleSelectAll}
            className="h-4 w-4"
          />
          <label htmlFor="selectAll" className="text-sm flex items-center cursor-pointer">
            <span className="mr-1">{selectedAccounts.length}</span> 
            <span>{selectedAccounts.length === 1 ? 'Account' : 'Accounts'} selected</span>
          </label>
          {selectedAccounts.length > 0 && (
            <Button 
              variant="link" 
              className="text-[#689675] p-0 h-auto" 
              onClick={() => setSelectedAccounts([])}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {connectedAccounts.length > 0 ? (
          connectedAccounts.map(account => {
            const isSelected = selectedAccounts.includes(account.account_name);
            // Get platform-specific styling and status
            const { isImplemented, bgColor, icon } = getPlatformInfo(account.platform);
            const otherPlatformClass = !isImplemented ? 'opacity-70' : '';
            
            return (
              <div 
                key={account.account_name} 
                className={`flex items-center p-2 hover:bg-gray-50 rounded ${isSelected ? 'bg-gray-50' : ''} ${otherPlatformClass}`}
              >
                <Checkbox 
                  id={account.account_name} 
                  checked={isSelected}
                  onCheckedChange={() => handleAccountToggle(account.account_name)}
                  className="h-4 w-4 mr-3"
                  disabled={!isImplemented}
                />
                <label 
                  htmlFor={account.account_name} 
                  className={`flex items-center gap-2 w-full ${!isImplemented ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => isImplemented && handleAccountToggle(account.account_name)}
                >
                  <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center text-white text-xs`}>
                    {icon}
                  </div>
                  <div className="flex flex-col">
                    <span>{account.account_name}</span>
                    {!isImplemented && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle size={12} />
                        Coming soon
                      </span>
                    )}
                  </div>
                  
                  {isImplemented && (
                    <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  )}
                </label>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No accounts connected yet</div>
            <p className="text-sm mt-1">Connect accounts in the settings panel</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AccountsTab;
