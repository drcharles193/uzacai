
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccountSelectorProps {
  selectedCommentAccount: string;
  setSelectedCommentAccount: React.Dispatch<React.SetStateAction<string>>;
  filteredConnectedAccounts: Array<{
    platform: string;
    account_name: string;
    account_type?: string;
    platform_account_id?: string;
  }>;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  selectedCommentAccount,
  setSelectedCommentAccount,
  filteredConnectedAccounts
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-medium">Comments for:</h3>
      </div>
      <Select 
        value={selectedCommentAccount} 
        onValueChange={setSelectedCommentAccount}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {filteredConnectedAccounts.map((account) => (
            <SelectItem key={account.account_name} value={account.account_name}>
              <div className="flex items-center gap-2">
                {account.platform === 'instagram' && (
                  <span className="text-pink-600">Instagram:</span>
                )}
                {account.platform === 'facebook' && (
                  <span className="text-blue-600">Facebook:</span>
                )}
                {account.platform === 'twitter' && (
                  <span className="text-blue-400">Twitter:</span>
                )}
                {account.platform === 'linkedin' && (
                  <span className="text-blue-700">LinkedIn:</span>
                )}
                {account.account_name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountSelector;
