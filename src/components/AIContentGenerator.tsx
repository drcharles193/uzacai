
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type ContentType = 'text' | 'image' | 'both';

const AIContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('both');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    text?: string;
    imageUrl?: string;
  }>({});

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      // Mock AI results - in a real implementation, this would call actual AI services
      const mockResults = {
        text: contentType !== 'image' ? generateMockText(prompt) : undefined,
        imageUrl: contentType !== 'text' ? generateMockImage() : undefined,
      };
      
      setGeneratedContent(mockResults);
      setLoading(false);
      
      toast({
        title: "Content Generated",
        description: "Your AI content has been created successfully."
      });
    }, 2000);
  };

  const generateMockText = (prompt: string) => {
    const templates = [
      "✨ Just discovered the perfect way to start my day! #MorningRoutine #SelfCare",
      "This view never gets old. Nature is truly the best artist! #NatureLovers #Sunset",
      "New project in the works! Can't wait to share what I've been working on. #ComingSoon #ExcitingNews",
      "When life gives you lemons, make lemonade... or maybe a lemon drop martini! 🍸 #WeekendVibes",
      "Feeling inspired after today's workshop. So many new ideas to implement! #Growth #Learning"
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const generateMockImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1501426026826-31c667bdf23d",
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      "https://images.unsplash.com/photo-1493612276216-ee3925520721",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2"
    ];
    
    return images[Math.floor(Math.random() * images.length)];
  };

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">
            Create AI-Powered Social Content
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up">
            Generate engaging text and images with a simple prompt. Our AI understands your brand voice and creates content that resonates with your audience.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-xl overflow-hidden shadow-md animate-scale">
            <div className="p-6 md:p-8">
              <Tabs defaultValue="both" onValueChange={(value) => setContentType(value as ContentType)}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="both">Both</TabsTrigger>
                </TabsList>
                
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
                    onClick={handleGenerate}
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
                </div>

                {(generatedContent.text || generatedContent.imageUrl) && (
                  <div className="mt-8 p-6 rounded-lg border border-border bg-secondary/30 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4">Generated Content</h3>
                    
                    <div className="space-y-6">
                      {generatedContent.text && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Caption
                          </label>
                          <div className="p-4 rounded-lg bg-background">
                            {generatedContent.text}
                          </div>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="text-xs">
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {generatedContent.imageUrl && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            Image
                          </label>
                          <div className="rounded-lg overflow-hidden bg-background/60 border border-border/50">
                            <img 
                              src={generatedContent.imageUrl} 
                              alt="Generated content" 
                              className="w-full h-auto object-cover"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="text-xs">
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Tabs>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Smart Text Generation",
                description: "Get captions, hashtags, and engaging text optimized for each platform."
              },
              {
                title: "Stunning Visuals",
                description: "Create eye-catching images that match your brand style and message."
              },
              {
                title: "Multi-Platform Ready",
                description: "Content formatted correctly for each social network's requirements."
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-xl border border-border/50 bg-background/60 hover:border-primary/30 hover:bg-background/80 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIContentGenerator;
