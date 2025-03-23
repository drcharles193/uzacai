
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // Function to check if a URL is a video
  const isVideoUrl = (url: string): boolean => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null || url.includes('video');
  };

  return (
    <div className="flex flex-col space-y-4">
      {selectedAccounts.length > 0 ? (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Preview as:</h3>
          <Select 
            value={selectedPreviewAccount} 
            onValueChange={setSelectedPreviewAccount}
            disabled={selectedAccounts.length === 0}
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
      ) : null}

      <div className="flex flex-col items-center justify-start p-4 border rounded-md h-[500px] overflow-y-auto">
        {postContent ? (
          <>
            <div className="text-gray-700 whitespace-pre-wrap mb-4 w-full">
              {selectedPlatform === 'twitter' && (
                <div className="w-full mb-2 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="font-semibold">@{selectedPreviewAccount}</div>
                    <div className="text-xs text-gray-500">Just now</div>
                  </div>
                </div>
              )}
              {selectedPlatform === 'instagram' && (
                <div className="w-full mb-2 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"></div>
                  <div className="font-semibold">{selectedPreviewAccount}</div>
                </div>
              )}
              {selectedPlatform === 'facebook' && (
                <div className="w-full mb-2 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600"></div>
                  <div>
                    <div className="font-semibold">{selectedPreviewAccount}</div>
                    <div className="text-xs text-gray-500">Just now</div>
                  </div>
                </div>
              )}
              {selectedPlatform === 'linkedin' && (
                <div className="w-full mb-2 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-700"></div>
                  <div className="font-semibold">{selectedPreviewAccount}</div>
                </div>
              )}
              {postContent}
            </div>
            {mediaPreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 w-full">
                {mediaPreviewUrls.map((url, index) => (
                  isVideoUrl(url) ? (
                    <div key={index} className="w-full rounded-md overflow-hidden">
                      <video 
                        src={url} 
                        controls
                        className="w-full h-auto rounded-md"
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    <img 
                      key={index} 
                      src={url} 
                      alt={`Media ${index + 1}`} 
                      className="w-full h-auto rounded-md" 
                    />
                  )
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 flex items-center justify-center h-full">
            {selectedAccounts.length === 0 
              ? "Please select one or more accounts to preview" 
              : "Post preview will appear here"}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPreviewTab;
