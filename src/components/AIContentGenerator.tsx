import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { generateText, generateImage } from "@/services/openai";

// Import our components
import ContentPrompt from "@/components/content-generator/ContentPrompt";
import GeneratedContent from "@/components/content-generator/GeneratedContent";
import ApiKeyManager from "@/components/content-generator/ApiKeyManager";

type ContentType = 'text' | 'image' | 'both';

const AIContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('both');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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
    setProgress(0);
    
    try {
      // Reset content
      setGeneratedContent({});
      
      // Generate text if needed
      if (contentType !== 'image') {
        setProgress(20);
        const text = await generateText(prompt);
        setProgress(contentType === 'both' ? 50 : 100);
        setGeneratedContent(prev => ({ ...prev, text }));
      }
      
      // Generate image if needed
      if (contentType !== 'text') {
        setProgress(contentType === 'both' ? 60 : 50);
        const imageUrl = await generateImage(prompt);
        setProgress(100);
        setGeneratedContent(prev => ({ ...prev, imageUrl }));
      }
      
      toast({
        title: "Content Generated",
        description: "Your AI content has been created successfully."
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                
                <ContentPrompt
                  prompt={prompt}
                  setPrompt={setPrompt}
                  loading={loading}
                  progress={progress}
                  onGenerate={handleGenerate}
                />

                <GeneratedContent content={generatedContent} />
              </Tabs>
              
              <ApiKeyManager />
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
