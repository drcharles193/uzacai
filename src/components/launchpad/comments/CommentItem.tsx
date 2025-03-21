
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Reply, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CommentReply from './CommentReply';
import ReplyForm from './ReplyForm';

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface CommentItemProps {
  comment: Comment;
  onAddReply: (commentId: string, replyText: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onAddReply }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    onAddReply(commentId, replyText);
    setReplyingTo(null);
    setReplyText('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <Card key={comment.id} className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">{comment.author}</div>
              <div className="text-xs text-gray-500">{comment.timestamp}</div>
            </div>
            <p className="mt-1 text-gray-700">{comment.text}</p>
            
            {!replyingTo && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-gray-600 hover:text-gray-900 p-0 h-auto"
                onClick={() => handleReply(comment.id)}
              >
                <Reply className="h-3.5 w-3.5 mr-1" />
                Reply
              </Button>
            )}
            
            {replyingTo === comment.id && (
              <ReplyForm
                replyText={replyText}
                setReplyText={setReplyText}
                onSubmit={() => handleAddReply(comment.id)}
                onCancel={cancelReply}
              />
            )}
            
            {comment.replies.length > 0 && (
              <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                {comment.replies.map((reply) => (
                  <CommentReply key={reply.id} reply={reply} />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentItem;
