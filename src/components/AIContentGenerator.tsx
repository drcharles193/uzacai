
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";

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
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  const generateTextWithOpenAI = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a social media content writer. Create engaging, concise social media posts (maximum 280 characters) that include relevant hashtags.'
            },
            {
              role: 'user',
              content: `Create a social media post about: ${prompt}`
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate content');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content.trim() || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  };

  const generateImageWithOpenAI = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Create an image for a social media post about: ${prompt}`,
          n: 1,
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate image');
      }

      const data = await response.json();
      return data.data[0]?.url || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey && !showApiKeyInput) {
      setShowApiKeyInput(true);
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate content.",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Missing API Key",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const results: { text?: string; imageUrl?: string } = {};
      
      if (contentType !== 'image') {
        results.text = await generateTextWithOpenAI(prompt);
      }
      
      if (contentType !== 'text') {
        results.imageUrl = await generateImageWithOpenAI(prompt);
      }
      
      setGeneratedContent(results);
      
      toast({
        title: "Content Generated",
        description: "Your AI content has been created successfully."
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please check your API key and try again.",
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
                
                <div className="space-y-4">
                  {showApiKeyInput && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground mb-1">
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        className="w-full p-2 rounded-lg border border-border bg-background/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all duration-200"
                        placeholder="Enter your OpenAI API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your API key is used only in your browser and is not stored on our servers.
                      </p>
                    </div>
                  )}

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
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      'Generate Content'
                    )}
                  </Button>

                  {!showApiKeyInput && (
                    <div className="text-center">
                      <button 
                        onClick={() => setShowApiKeyInput(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Set OpenAI API Key
                      </button>
                    </div>
                  )}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedContent.text || '');
                                toast({
                                  title: "Copied",
                                  description: "Text copied to clipboard"
                                });
                              }}
                            >
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = generatedContent.imageUrl || '';
                                link.download = 'generated-image.png';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                toast({
                                  title: "Download Started",
                                  description: "Image download has started"
                                });
                              }}
                            >
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
