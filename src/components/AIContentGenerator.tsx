
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Loader2, Copy, Download, AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

type ContentType = 'text' | 'image' | 'both';

const AIContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('both');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    text?: string;
    imageUrl?: string;
  }>({});
  
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API key from localStorage on component mount
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleCopyText = () => {
    if (generatedContent.text) {
      navigator.clipboard.writeText(generatedContent.text);
      toast({
        title: "Copied to clipboard",
        description: "Text content has been copied to your clipboard."
      });
    }
  };

  const handleDownloadImage = () => {
    if (generatedContent.imageUrl) {
      const link = document.createElement('a');
      link.href = generatedContent.imageUrl;
      link.download = 'ai-generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your image is being downloaded."
      });
    }
  };

  const generateText = async (promptText: string) => {
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
              content: 'You are a social media content creator assistant. Create engaging social media content based on the user\'s prompt. Keep it concise, engaging, and suitable for platforms like Instagram, Facebook, and Twitter. Include relevant hashtags.'
            },
            {
              role: 'user',
              content: promptText
            }
          ],
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate text');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, no content was generated.';
    } catch (error) {
      console.error('Text generation error:', error);
      throw error;
    }
  };

  const generateImage = async (promptText: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Create a social media image for the following prompt: ${promptText}. Make it visually engaging and suitable for social platforms.`,
          n: 1,
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate image');
      }

      const data = await response.json();
      return data.data[0]?.url;
    } catch (error) {
      console.error('Image generation error:', error);
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

    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Save API key to localStorage
      localStorage.setItem('openai_api_key', apiKey);
      
      const newContent: {text?: string; imageUrl?: string} = {};
      
      if (contentType === 'text' || contentType === 'both') {
        newContent.text = await generateText(prompt);
      }
      
      if (contentType === 'image' || contentType === 'both') {
        newContent.imageUrl = await generateImage(prompt);
      }
      
      setGeneratedContent(newContent);
      toast({
        title: "Content Generated",
        description: "Your AI content has been created successfully."
      });
    } catch (error) {
      let errorMessage = 'An error occurred during content generation';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
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
              <Tabs defaultValue={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="both">Both</TabsTrigger>
                </TabsList>
                
                <div className="space-y-4">
                  {showApiKeyInput && (
                    <div className="mb-6 space-y-2">
                      <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                        <Lock size={16} />
                        OpenAI API Key
                      </label>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your API key is stored locally in your browser and never sent to our servers.
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
                  
                  {error && (
                    <Alert variant="destructive" className="my-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    className="w-full py-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all duration-300 shadow-md hover:shadow-lg"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                              className="text-xs flex items-center gap-1"
                              onClick={handleCopyText}
                            >
                              <Copy size={14} />
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
                              className="text-xs flex items-center gap-1"
                              onClick={handleDownloadImage}
                            >
                              <Download size={14} />
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
