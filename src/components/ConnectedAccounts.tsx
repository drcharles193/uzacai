import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Account {
  id: string;
  platform: string;
  accountName: string;
  queued: number;
  errors: number;
  status: string;
}

interface ConnectedAccountsProps {
  accounts: Account[];
  onConnectMore: () => void;
  onDisconnect?: (accountId: string) => Promise<void>;
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({ 
  accounts, 
  onConnectMore, 
  onDisconnect 
}) => {
  const [disconnectAccount, setDisconnectAccount] = useState<Account | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case 'twitter':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        );
      case 'facebook':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        );
      case 'linkedin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        );
    }
  };

  const handleDisconnectClick = (account: Account) => {
    setDisconnectAccount(account);
    setIsAlertOpen(true);
  };

  const confirmDisconnect = async () => {
    if (disconnectAccount && onDisconnect) {
      try {
        await onDisconnect(disconnectAccount.id);
        toast({
          title: "Account disconnected",
          description: `${disconnectAccount.accountName} has been disconnected successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to disconnect account. Please try again.",
          variant: "destructive",
        });
        console.error("Error disconnecting account:", error);
      }
    }
    setIsAlertOpen(false);
    setDisconnectAccount(null);
  };

  const getStatusBadge = (account: Account) => {
    switch (account.status.toLowerCase()) {
      case 'active':
        return (
          <Badge 
            className="bg-[#689675] hover:bg-[#85A88EA8] cursor-pointer"
            onClick={() => handleDisconnectClick(account)}
          >
            Active
          </Badge>
        );
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{account.status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Connected Accounts</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-[#689675] text-[#689675] hover:bg-[#689675]/10"
              onClick={onConnectMore}
            >
              <PlusCircle size={16} className="mr-1" />
              Connect More
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="text-[#689675]">
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{account.accountName}</h3>
                        <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                      </div>
                      <div>
                        {getStatusBadge(account)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Queued Posts</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-medium">{account.queued}</span>
                          <Progress value={account.queued * 10} className="h-2 flex-1" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Errors</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-medium">{account.errors}</span>
                          <Progress value={account.errors * 10} className="h-2 flex-1 bg-secondary [&>div]:bg-red-500" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Planned Until</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-medium text-[#689675]">Mar 24</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect {disconnectAccount?.accountName}? 
              This will remove all access and any scheduled posts for this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDisconnect}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConnectedAccounts;
