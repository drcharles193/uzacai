
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, AlertTriangle } from 'lucide-react';
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

interface SocialAccount {
  platform: string;
  account_name: string;
  account_type?: string;
  platform_account_id?: string;
}

interface ConnectedAccountsListProps {
  accounts: SocialAccount[];
  onAccountDisconnected: (platformId: string) => void;
}

const ConnectedAccountsList: React.FC<ConnectedAccountsListProps> = ({ accounts, onAccountDisconnected }) => {
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState<string | null>(null);

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'facebook':
        return <Facebook size={20} className="text-[#4267B2]" />;
      case 'instagram':
        return <Instagram size={20} className="text-[#E1306C]" />;
      case 'linkedin':
        return <Linkedin size={20} className="text-[#0077B5]" />;
      case 'twitter':
        return <Twitter size={20} className="text-[#1DA1F2]" />;
      case 'youtube':
        return <Youtube size={20} className="text-[#FF0000]" />;
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        );
    }
  };

  const openDisconnectConfirmation = (platform: string) => {
    setAccountToDisconnect(platform);
    setConfirmDialogOpen(true);
  };

  const handleCancelDisconnect = () => {
    setConfirmDialogOpen(false);
    setAccountToDisconnect(null);
  };

  const disconnectAccount = async (platform: string) => {
    try {
      setDisconnecting(platform);
      setConfirmDialogOpen(false);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be signed in to disconnect accounts");
        return;
      }
      
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', session.user.id)
        .eq('platform', platform);
        
      if (error) {
        throw error;
      }
      
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account disconnected`);
      onAccountDisconnected(platform);
      
    } catch (error: any) {
      console.error("Error disconnecting account:", error);
      toast.error(`Failed to disconnect ${platform} account`);
    } finally {
      setDisconnecting(null);
      setAccountToDisconnect(null);
    }
  };

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[#689675]">Publishing by Accounts</h2>
      
      <Card className="border-[#689675]/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#689675]/10">
              <TableRow>
                <TableHead className="w-[250px]">Account Name</TableHead>
                <TableHead className="text-center">Queued</TableHead>
                <TableHead className="text-center">Errors</TableHead>
                <TableHead className="text-center">Planned Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={`${account.platform}-${account.account_name}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(account.platform)}
                      <span>{account.account_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">Not Scheduled</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDisconnectConfirmation(account.platform)}
                      disabled={disconnecting === account.platform}
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      {disconnecting === account.platform ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Disconnect Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your {accountToDisconnect ? `${accountToDisconnect.charAt(0).toUpperCase() + accountToDisconnect.slice(1)}` : ''} account? 
              This will remove the connection between your account and this platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDisconnect}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => accountToDisconnect && disconnectAccount(accountToDisconnect)}
              className="bg-red-500 hover:bg-red-600"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConnectedAccountsList;
