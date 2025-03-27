
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
            // Check if the platform is fully implemented
            const isImplemented = account.platform === 'twitter' || account.platform === 'linkedin';
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
                  className={`flex items-center gap-2 cursor-pointer w-full ${!isImplemented ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => isImplemented && handleAccountToggle(account.account_name)}
                >
                  {account.platform === 'twitter' && (
                    <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs">
                      <svg fill="white" viewBox="0 0 24 24" width="14" height="14">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                      </svg>
                    </div>
                  )}
                  {account.platform === 'linkedin' && (
                    <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs">
                      <svg fill="white" viewBox="0 0 24 24" width="14" height="14">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                      </svg>
                    </div>
                  )}
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
