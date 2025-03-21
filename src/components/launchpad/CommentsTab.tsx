
import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import CommentItem from './comments/CommentItem';
import CommentForm from './comments/CommentForm';
import AccountSelector from './comments/AccountSelector';
import CommentFilters from './comments/CommentFilters';

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

interface CommentsTabProps {
  selectedAccounts: string[];
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
    account_type?: string;
    platform_account_id?: string;
  }>;
}

const CommentsTab: React.FC<CommentsTabProps> = ({
  selectedAccounts,
  connectedAccounts
}) => {
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
  const [selectedCommentAccount, setSelectedCommentAccount] = useState<string>(
    selectedAccounts.length > 0 ? selectedAccounts[0] : ''
  );
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'withReplies' | 'withoutReplies'>('all');

  // Filter accounts that are selected in the Accounts tab
  const filteredConnectedAccounts = connectedAccounts.filter(account => 
    selectedAccounts.includes(account.account_name)
  );

  // Update selected account when selectedAccounts changes
  useEffect(() => {
    if (selectedAccounts.length > 0 && !selectedAccounts.includes(selectedCommentAccount)) {
      setSelectedCommentAccount(selectedAccounts[0]);
    }
  }, [selectedAccounts, selectedCommentAccount]);

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

  const handleAddReply = (commentId: string, replyText: string) => {
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
  };

  // Filter and sort comments based on user selections
  const getFilteredAndSortedComments = () => {
    // First filter comments
    let filteredComments = [...comments];
    
    if (filterType === 'withReplies') {
      filteredComments = filteredComments.filter(comment => comment.replies.length > 0);
    } else if (filterType === 'withoutReplies') {
      filteredComments = filteredComments.filter(comment => comment.replies.length === 0);
    }
    
    // Then sort comments
    return filteredComments.sort((a, b) => {
      // Simple sorting based on ID (assuming higher ID = newer)
      if (sortOrder === 'newest') {
        return parseInt(b.id) - parseInt(a.id);
      } else {
        return parseInt(a.id) - parseInt(b.id);
      }
    });
  };

  const filteredAndSortedComments = getFilteredAndSortedComments();

  return (
    <div className="space-y-4 p-4">
      {selectedAccounts.length > 0 ? (
        <>
          <AccountSelector 
            selectedCommentAccount={selectedCommentAccount}
            setSelectedCommentAccount={setSelectedCommentAccount}
            filteredConnectedAccounts={filteredConnectedAccounts}
          />
          
          <CommentFilters 
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            filterType={filterType}
            setFilterType={setFilterType}
          />
        </>
      ) : (
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
          <h3 className="text-lg font-medium">Comments</h3>
        </div>
      )}

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
        {selectedAccounts.length === 0 ? (
          <div className="flex items-center justify-center h-32 border rounded-md">
            <p className="text-gray-500">Please select one or more accounts to view comments</p>
          </div>
        ) : filteredAndSortedComments.length === 0 ? (
          <div className="flex items-center justify-center h-32 border rounded-md">
            <p className="text-gray-500">No comments match your current filters</p>
          </div>
        ) : (
          filteredAndSortedComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onAddReply={handleAddReply} 
            />
          ))
        )}
      </div>

      {selectedAccounts.length > 0 && (
        <CommentForm
          newComment={newComment}
          setNewComment={setNewComment}
          onSubmit={handleAddComment}
        />
      )}
    </div>
  );
};

export default CommentsTab;
