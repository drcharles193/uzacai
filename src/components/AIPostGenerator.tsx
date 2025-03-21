
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Wand2, RefreshCcw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { generateText } from '@/services/openai';

interface AIPostGeneratorProps {
  onContentGenerated: (content: string) => void;
}

const AIPostGenerator: React.FC<AIPostGeneratorProps> = ({ onContentGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const { toast } = useToast();
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        description: "Please enter a prompt to generate content",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Use the OpenAI service with server-side key
      const content = await generateText(prompt);
      // Split content into multiple options
      const options = content.split('\n\n').filter(option => option.trim().length > 0);
      setGeneratedOptions(options.length > 0 ? options : [content]);
      
      toast({
        description: "Content generated successfully",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      
      toast({
        title: "Error generating content",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSelectOption = (option: string) => {
    onContentGenerated(option);
    toast({
      description: "Content added to your post",
    });
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span>AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[500px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-yellow-500" />
            AI Content Generator
          </SheetTitle>
          <SheetDescription>
            Describe what you want to post about and our AI will generate content options for you.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">What would you like to post about?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full min-h-[120px] p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#689675]"
            placeholder="E.g., Write a post announcing our new eco-friendly product line with relevant hashtags"
          ></textarea>
          
          <Button 
            onClick={handleGenerate} 
            className="mt-4 w-full"
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                Generate Content
              </>
            )}
          </Button>
        </div>
        
        {generatedOptions.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Generated options:</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {generatedOptions.map((option, index) => (
                <div key={index} className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100">
                  <p className="text-sm mb-2">{option}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleSelectOption(option)}
                  >
                    Use this
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AIPostGenerator;
