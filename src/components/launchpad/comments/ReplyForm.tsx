
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReplyFormProps {
  replyText: string;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onCancel: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ 
  replyText, 
  setReplyText, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <div className="mt-3 space-y-2">
      <Textarea 
        placeholder="Write a reply..." 
        className="text-sm resize-none focus:ring-2 focus:ring-blue-500"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <div className="flex space-x-2 justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          size="sm"
          onClick={onSubmit}
        >
          Reply
        </Button>
      </div>
    </div>
  );
};

export default ReplyForm;
