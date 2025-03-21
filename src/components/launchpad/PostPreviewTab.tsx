
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from 'lucide-react';

interface PostPreviewTabProps {
  postContent: string;
  mediaPreviewUrls: string[];
  selectedAccounts: string[];
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
    account_type?: string;
    platform_account_id?: string;
  }>;
}

const PostPreviewTab: React.FC<PostPreviewTabProps> = ({ 
  postContent, 
  mediaPreviewUrls, 
  selectedAccounts,
  connectedAccounts
}) => {
  const [selectedPreviewAccount, setSelectedPreviewAccount] = React.useState<string>(
    selectedAccounts.length > 0 ? selectedAccounts[0] : ''
  );

  // Filter accounts that are selected in the Accounts tab
  const filteredConnectedAccounts = connectedAccounts.filter(account => 
    selectedAccounts.includes(account.account_name)
  );

  // Update selected account when selectedAccounts changes
  React.useEffect(() => {
    if (selectedAccounts.length > 0 && !selectedAccounts.includes(selectedPreviewAccount)) {
      setSelectedPreviewAccount(selectedAccounts[0]);
    }
  }, [selectedAccounts, selectedPreviewAccount]);

  // Get platform for the selected account
  const getSelectedPlatform = () => {
    const account = connectedAccounts.find(acc => acc.account_name === selectedPreviewAccount);
    return account?.platform || '';
  };

  const selectedPlatform = getSelectedPlatform();

  return (
    <div className="max-w-3xl mx-auto p-6">
      {selectedAccounts.length > 0 ? (
        <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Preview as:</h3>
          <Select 
            value={selectedPreviewAccount} 
            onValueChange={setSelectedPreviewAccount}
            disabled={selectedAccounts.length === 0}
          >
            <SelectTrigger className="w-[220px] border-gray-200 bg-white shadow-sm">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {filteredConnectedAccounts.map((account) => (
                <SelectItem key={account.account_name} value={account.account_name}>
                  <div className="flex items-center gap-2">
                    {account.platform === 'instagram' && (
                      <span className="text-pink-600 font-medium">Instagram:</span>
                    )}
                    {account.platform === 'facebook' && (
                      <span className="text-blue-600 font-medium">Facebook:</span>
                    )}
                    {account.platform === 'twitter' && (
                      <span className="text-blue-400 font-medium">Twitter:</span>
                    )}
                    {account.platform === 'linkedin' && (
                      <span className="text-blue-700 font-medium">LinkedIn:</span>
                    )}
                    {account.account_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex flex-col items-center justify-start p-6 border border-gray-200 rounded-lg shadow-sm bg-white h-[550px] overflow-y-auto">
        {postContent ? (
          <>
            <div className="w-full">
              {selectedPlatform === 'twitter' && (
                <div className="w-full mb-4 flex items-center gap-3 border-b pb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">@{selectedPreviewAccount}</div>
                    <div className="text-xs text-gray-500">Just now</div>
                  </div>
                </div>
              )}
              {selectedPlatform === 'instagram' && (
                <div className="w-full mb-4 flex items-center gap-3 border-b pb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="font-semibold">{selectedPreviewAccount}</div>
                </div>
              )}
              {selectedPlatform === 'facebook' && (
                <div className="w-full mb-4 flex items-center gap-3 border-b pb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{selectedPreviewAccount}</div>
                    <div className="text-xs text-gray-500">Just now</div>
                  </div>
                </div>
              )}
              {selectedPlatform === 'linkedin' && (
                <div className="w-full mb-4 flex items-center gap-3 border-b pb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="font-semibold">{selectedPreviewAccount}</div>
                </div>
              )}
              
              <div className="text-gray-800 whitespace-pre-wrap mb-6 font-normal leading-relaxed">
                {postContent}
              </div>
            </div>
            
            {mediaPreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4 w-full mt-2">
                {mediaPreviewUrls.map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Media ${index + 1}`} 
                    className="w-full h-auto rounded-lg border border-gray-100 shadow-sm" 
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 flex flex-col items-center justify-center h-full">
            {selectedAccounts.length === 0 ? (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-2">No account selected</p>
                <p className="text-sm text-gray-500">Please select one or more accounts to preview</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-2">Post preview empty</p>
                <p className="text-sm text-gray-500">Write your post content to see a preview</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPreviewTab;
