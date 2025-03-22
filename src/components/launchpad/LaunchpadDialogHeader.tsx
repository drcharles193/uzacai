
import React from 'react';
import { DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LaunchpadDialogHeaderProps {
  onClose: () => void;
}

const LaunchpadDialogHeader: React.FC<LaunchpadDialogHeaderProps> = ({ onClose }) => {
  return (
    <>
      <DialogTitle className="sr-only">Create Post</DialogTitle>
      <div className="flex justify-between items-center border-b py-2 px-4">
        <div>
          <h2 className="text-lg font-semibold">Create Post</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default LaunchpadDialogHeader;
