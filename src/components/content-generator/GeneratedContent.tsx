
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface GeneratedContentProps {
  content: {
    text?: string;
    imageUrl?: string;
  };
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ content }) => {
  const { toast } = useToast();

  const handleCopyText = () => {
    if (content.text) {
      navigator.clipboard.writeText(content.text);
      toast({
        description: "Text copied to clipboard"
      });
    }
  };

  const handleDownloadImage = () => {
    if (content.imageUrl) {
      const link = document.createElement('a');
      link.href = content.imageUrl;
      link.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        description: "Image download started"
      });
    }
  };

  if (!content.text && !content.imageUrl) return null;

  return (
    <div className="mt-8 p-6 rounded-lg border border-border bg-secondary/30 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Generated Content</h3>
      
      <div className="space-y-6">
        {content.text && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Caption
            </label>
            <div className="p-4 rounded-lg bg-background">
              {content.text}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="text-xs" onClick={handleCopyText}>
                Copy
              </Button>
            </div>
          </div>
        )}
        
        {content.imageUrl && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Image
            </label>
            <div className="rounded-lg overflow-hidden bg-background/60 border border-border/50">
              <img 
                src={content.imageUrl} 
                alt="Generated content" 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="text-xs" onClick={handleDownloadImage}>
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedContent;
