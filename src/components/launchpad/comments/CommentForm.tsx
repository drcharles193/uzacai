
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';

interface CommentFormProps {
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  newComment, 
  setNewComment, 
  onSubmit 
}) => {
  return (
    <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
      <Textarea 
        placeholder="Write a comment..." 
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="resize-none focus:ring-2 focus:ring-green-500 border-gray-200"
      />
      <div className="flex justify-end">
        <Button 
          onClick={onSubmit} 
          className="flex items-center gap-1"
          disabled={!newComment.trim()}
        >
          <Send className="h-4 w-4" />
          Add Comment
        </Button>
      </div>
    </div>
  );
};

export default CommentForm;
