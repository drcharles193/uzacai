
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Reply, Send, User } from 'lucide-react';

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

const CommentsTab: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      text: 'Great post! I love the content.',
      author: 'Jane Doe',
      timestamp: '2 hours ago',
      replies: [
        {
          id: '1-1',
          text: 'Thank you so much!',
          author: 'You',
          timestamp: '1 hour ago',
        }
      ]
    },
    {
      id: '2',
      text: 'Can you share more details about this?',
      author: 'John Smith',
      timestamp: '1 day ago',
      replies: []
    }
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      author: 'You',
      timestamp: 'Just now',
      replies: []
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    
    const reply: Reply = {
      id: `${commentId}-${Date.now()}`,
      text: replyText,
      author: 'You',
      timestamp: 'Just now'
    };
    
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] } 
        : comment
    ));
    
    setReplyingTo(null);
    setReplyText('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
        <h3 className="text-lg font-medium">Comments</h3>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments.map((comment) => (
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
                    <div className="mt-3 space-y-2">
                      <Textarea 
                        placeholder="Write a reply..." 
                        className="text-sm"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex space-x-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={cancelReply}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAddReply(comment.id)}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                      {comment.replies.map((reply) => (
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
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 space-y-2 pb-16">
        <Textarea 
          placeholder="Write a comment..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleAddComment} className="flex items-center gap-1 mb-12">
            <Send className="h-4 w-4" />
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentsTab;
