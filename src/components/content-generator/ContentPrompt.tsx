
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ContentPromptProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  loading: boolean;
  progress: number;
  onGenerate: () => void;
}

const ContentPrompt: React.FC<ContentPromptProps> = ({ 
  prompt, 
  setPrompt, 
  loading, 
  progress, 
  onGenerate 
}) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Your Prompt
      </label>
      <div className="relative">
        <textarea
          className="w-full min-h-[120px] p-4 rounded-lg border border-border bg-background/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all duration-200 resize-none"
          placeholder="Describe the content you want to generate... (e.g., 'A motivational post about achieving goals with a modern workspace image')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
          {prompt.length}/500
        </div>
      </div>
      
      <Button
        className="w-full py-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all duration-300 shadow-md hover:shadow-lg"
        onClick={onGenerate}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Content'
        )}
      </Button>
      
      {loading && (
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-right mt-1 text-muted-foreground">{progress}% complete</p>
        </div>
      )}
    </div>
  );
};

export default ContentPrompt;
