
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Reply, Send, User, RefreshCw, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface FacebookCommentsProps {
  postId?: string;
  accountId: string;
  showNoAccountsMessage?: boolean;
}

type CommentType = {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
  comments?: {
    data: ReplyType[];
  };
};

type ReplyType = {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
};

const FacebookComments: React.FC<FacebookCommentsProps> = ({ 
  postId, 
  accountId,
  showNoAccountsMessage = true
}) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const fetchComments = async () => {
    if (!postId || !accountId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Authentication required");
        return;
      }
      
      const response = await supabase.functions.invoke('facebook-engagement', {
        body: JSON.stringify({
          action: 'fetch-comments',
          userId: session.user.id,
          postId: postId,
          accountId: accountId
        })
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch comments");
      }
      
      setComments(response.data.comments || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      setError(error.message || "Failed to fetch comments");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch comments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId && accountId) {
      fetchComments();
    }
  }, [postId, accountId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId || !accountId) return;
    
    try {
      setSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add comments.",
          variant: "destructive"
        });
        return;
      }
      
      const response = await supabase.functions.invoke('facebook-engagement', {
        body: JSON.stringify({
          action: 'post-comment',
          userId: session.user.id,
          postId: postId,
          comment: newComment,
          accountId: accountId
        })
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to post comment");
      }
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully."
      });
      
      setNewComment('');
      
      // Refresh comments to show the new one
      fetchComments();
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim() || !commentId || !accountId) return;
    
    try {
      setSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add replies.",
          variant: "destructive"
        });
        return;
      }
      
      const response = await supabase.functions.invoke('facebook-engagement', {
        body: JSON.stringify({
          action: 'post-reply',
          userId: session.user.id,
          commentId: commentId,
          comment: replyText,
          accountId: accountId
        })
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to post reply");
      }
      
      toast({
        title: "Reply Added",
        description: "Your reply has been posted successfully."
      });
      
      setReplyText('');
      setReplyingTo(null);
      
      // Refresh comments to show the new reply
      fetchComments();
    } catch (error: any) {
      console.error("Error posting reply:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  // Empty state
  if (!postId || !accountId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
          <h3 className="text-lg font-medium">Facebook Comments</h3>
        </div>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4 flex items-center justify-center h-32">
            <p className="text-gray-500">
              {showNoAccountsMessage 
                ? "Please select a Facebook account and post to view comments" 
                : "No comments available for this post"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Facebook Comments</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={fetchComments}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {loading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : comments.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-4 flex items-center justify-center h-32">
              <p className="text-gray-500">No comments yet</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{comment.from.name}</div>
                      <div className="text-xs text-gray-500">{formatDate(comment.created_time)}</div>
                    </div>
                    <p className="mt-1 text-gray-700">{comment.message}</p>
                    
                    <div className="flex gap-2 mt-2">
                      {!replyingTo && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-gray-900 p-0 h-auto"
                          onClick={() => handleReply(comment.id)}
                        >
                          <Reply className="h-3.5 w-3.5 mr-1" />
                          Reply
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 hover:text-gray-900 p-0 h-auto"
                        onClick={() => window.open(`https://facebook.com/${comment.id}`, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View on Facebook
                      </Button>
                    </div>
                    
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
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAddReply(comment.id)}
                            disabled={submitting || !replyText.trim()}
                          >
                            {submitting ? 'Posting...' : 'Reply'}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {comment.comments && comment.comments.data && comment.comments.data.length > 0 && (
                      <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                        {comment.comments.data.map((reply) => (
                          <div key={reply.id} className="flex items-start">
                            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                              <User className="h-3 w-3 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <div className="font-medium text-sm">{reply.from.name}</div>
                                <div className="text-xs text-gray-500 ml-2">{formatDate(reply.created_time)}</div>
                              </div>
                              <p className="mt-1 text-sm text-gray-700">{reply.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Textarea 
          placeholder="Write a comment..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleAddComment} 
            className="flex items-center gap-1"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            {submitting ? 'Posting...' : 'Add Comment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FacebookComments;
