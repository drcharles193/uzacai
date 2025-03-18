
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ScheduledPost } from '@/components/launchpad/types';

interface ScheduledPostItemProps {
  post: ScheduledPost;
  onDeletePost: (id: string) => void;
  onEditPost: () => void;
  isLoading: boolean;
}

const ScheduledPostItem: React.FC<ScheduledPostItemProps> = ({ 
  post, 
  onDeletePost, 
  onEditPost,
  isLoading 
}) => {
  const postDate = new Date(post.scheduled_for);
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-4 flex items-start gap-4">
        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium">
          {format(postDate, 'h:mm')}
          <span className="text-[10px] ml-0.5">{format(postDate, 'a')}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-2">
            {post.selected_accounts.map((platform, index) => (
              <span key={index} className="px-1.5 py-0.5 bg-secondary text-xs rounded-md">
                {platform}
              </span>
            ))}
          </div>
          
          <p className="text-sm mb-2 line-clamp-2">{post.content}</p>
          
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto">
              {post.media_urls.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={url} 
                    alt="Post preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors duration-200"
            onClick={onEditPost}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button 
            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors duration-200"
            onClick={() => onDeletePost(post.id)}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ScheduledPostItem;
