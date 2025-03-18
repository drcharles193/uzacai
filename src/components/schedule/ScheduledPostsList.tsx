
import React from 'react';
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CalendarClock, Trash2, Edit, Plus } from 'lucide-react';

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls: string[];
  selectedAccounts: string[];
  scheduledFor: string;
  createdAt: string;
  status: string;
}

interface ScheduledPostsListProps {
  date: Date | undefined;
  filteredPosts: ScheduledPost[];
  onDeletePost: (id: string) => void;
  onEditPost: (post: ScheduledPost) => void;
  onOpenLaunchpad: () => void;
}

const ScheduledPostsList: React.FC<ScheduledPostsListProps> = ({
  date,
  filteredPosts,
  onDeletePost,
  onEditPost,
  onOpenLaunchpad
}) => {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Scheduled Posts'}
        </h3>
        <Button variant="outline" size="sm" className="text-sm" onClick={onOpenLaunchpad}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>
      
      <div className="space-y-3">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const postDate = new Date(post.scheduledFor);
            return (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium">
                    {format(postDate, 'h:mm')}
                    <span className="text-[10px] ml-0.5">{format(postDate, 'a')}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.selectedAccounts.map((platform, index) => (
                        <span key={index} className="px-1.5 py-0.5 bg-secondary text-xs rounded-md">
                          {platform}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-sm mb-2 line-clamp-2">{post.content}</p>
                    
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="flex gap-2 mb-2 overflow-x-auto">
                        {post.mediaUrls.map((url, idx) => (
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
                      onClick={() => onEditPost(post)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors duration-200"
                      onClick={() => onDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <CalendarClock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">No posts scheduled</h4>
            <p className="text-muted-foreground mb-4">Create new content for this date</p>
            <Button variant="outline" size="sm" onClick={onOpenLaunchpad}>
              Schedule Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledPostsList;
