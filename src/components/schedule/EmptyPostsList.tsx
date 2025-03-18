
import React from 'react';
import { Button } from "@/components/ui/button";

interface EmptyPostsListProps {
  onCreatePost: () => void;
}

const EmptyPostsList: React.FC<EmptyPostsListProps> = ({ onCreatePost }) => {
  return (
    <div className="py-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
      </div>
      <h4 className="text-lg font-medium mb-2">No posts scheduled</h4>
      <p className="text-muted-foreground mb-4">Create new content for this date</p>
      <Button variant="outline" size="sm" onClick={onCreatePost}>
        Schedule Post
      </Button>
    </div>
  );
};

export default EmptyPostsList;
