
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from 'lucide-react';
import { PostDraft } from './types';
import { ScrollArea } from "@/components/ui/scroll-area";

interface DraftsListProps {
  drafts: PostDraft[];
  isLoading: boolean;
  onLoadDraft: (draft: PostDraft) => void;
  onDeleteDraft: (id: string) => void;
  onCreatePost: () => void;
}

const DraftsList: React.FC<DraftsListProps> = ({ 
  drafts, 
  isLoading, 
  onLoadDraft, 
  onDeleteDraft,
  onCreatePost
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No drafts saved yet</h3>
        <p className="text-muted-foreground mb-4">Start creating posts and save them as drafts</p>
        <Button onClick={onCreatePost}>Create a Post</Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-4 pr-4">
        <h3 className="text-lg font-medium">Your Drafts</h3>
        {drafts.map((draft) => (
          <div key={draft.id} className="border rounded-md p-4 hover:border-primary transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(draft.created_at).toLocaleDateString()} 
                  {' · '} 
                  {draft.selected_accounts.length} {draft.selected_accounts.length === 1 ? 'account' : 'accounts'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                onClick={() => onDeleteDraft(draft.id)}
                title="Delete draft"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="line-clamp-3 text-sm mb-3">{draft.content}</p>
            {draft.media_urls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {draft.media_urls.map((url, idx) => (
                  <div key={idx} className="w-16 h-16 rounded overflow-hidden bg-muted">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onLoadDraft(draft)}
              >
                Edit Draft
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default DraftsList;
