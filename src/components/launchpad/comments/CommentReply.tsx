
import React from 'react';
import { User } from 'lucide-react';

interface Reply {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface CommentReplyProps {
  reply: Reply;
}

const CommentReply: React.FC<CommentReplyProps> = ({ reply }) => {
  return (
    <div key={reply.id} className="flex items-start">
      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
        <User className="h-3 w-3 text-gray-600" />
      </div>
      <div>
        <div className="flex items-center">
          <div className="font-medium text-sm">{reply.author}</div>
          <div className="text-xs text-gray-500 ml-2">{reply.timestamp}</div>
        </div>
        <p className="mt-1 text-sm text-gray-700">{reply.text}</p>
      </div>
    </div>
  );
};

export default CommentReply;
