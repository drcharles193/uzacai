
import React from 'react';
import { format } from "date-fns";
import ScheduledPostItem from './ScheduledPostItem';
import EmptyPostsList from './EmptyPostsList';
import { ScheduledPost } from '@/components/launchpad/types';

interface ScheduledPostsListProps {
  date: Date | undefined;
  filteredPosts: ScheduledPost[];
  isLoading: boolean;
  onDeletePost: (id: string) => void;
  onEditPost: () => void;
  onCreatePost: () => void;
}

const ScheduledPostsList: React.FC<ScheduledPostsListProps> = ({
  date,
  filteredPosts,
  isLoading,
  onDeletePost,
  onEditPost,
  onCreatePost
}) => {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Scheduled Posts'}
        </h3>
        <button 
          className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
          onClick={onCreatePost}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Post
        </button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <ScheduledPostItem
              key={post.id}
              post={post}
              onDeletePost={onDeletePost}
              onEditPost={onEditPost}
              isLoading={isLoading}
            />
          ))
        ) : (
          <EmptyPostsList onCreatePost={onCreatePost} />
        )}
      </div>
    </div>
  );
};

export default ScheduledPostsList;
