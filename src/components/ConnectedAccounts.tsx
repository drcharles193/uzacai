
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ConnectedAccount {
  id: string;
  platform: string;
  accountName: string;
  queued: number;
  errors: number;
  status: string;
}

interface ConnectedAccountsProps {
  accounts: ConnectedAccount[];
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({ accounts }) => {
  if (accounts.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Publishing by Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Queued</TableHead>
              <TableHead>Errors</TableHead>
              <TableHead>Planned Until</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map(account => (
              <TableRow key={account.id}>
                <TableCell className="flex items-center gap-2">
                  {account.platform === 'instagram' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-md"></div>
                  )}
                  {account.platform === 'twitter' && (
                    <div className="w-6 h-6 bg-blue-400 rounded-md"></div>
                  )}
                  {account.platform === 'facebook' && (
                    <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
                  )}
                  {account.accountName}
                </TableCell>
                <TableCell>{account.queued}</TableCell>
                <TableCell>{account.errors}</TableCell>
                <TableCell>Not Scheduled</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ConnectedAccounts;
