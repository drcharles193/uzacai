
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ContentType = 'text' | 'image' | 'both';

const AIContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('both');
  const [loading, setLoading] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [showAPIKeyInput, setShowAPIKeyInput] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    text?: string;
    imageUrl?: string;
  }>({});
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setOpenAIKey(savedKey);
    }
  }, []);

  const handleSaveAPIKey = () => {
    if (openAIKey.trim()) {
      localStorage.setItem('openai_api_key', openAIKey);
      setShowAPIKeyInput(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved securely to your browser."
      });
    } else {
      toast({
        title: "Empty API Key",
        description: "Please enter a valid OpenAI API key.",
        variant: "destructive",
      });
    }
  };

  const generateTextWithOpenAI = async (userPrompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a social media content expert. Create engaging, concise social media posts that are optimized for engagement. Include relevant hashtags where appropriate. Keep the tone conversational and authentic.'
            },
            {
              role: 'user',
              content: `Create a social media post about: ${userPrompt}`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate content');
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  };

  const generateImageWithOpenAI = async (userPrompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Create an engaging social media image for: ${userPrompt}. Make it visually appealing and optimized for social media.`,
          n: 1,
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate image');
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('Error generating image:', error);
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

    if (!openAIKey) {
      setShowAPIKeyInput(true);
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate content.",
      });
      return;
    }

    setLoading(true);
    setGeneratedContent({});
    
    try {
      const results: { text?: string; imageUrl?: string } = {};
      
      // Generate text if the content type includes text
      if (contentType === 'text' || contentType === 'both') {
        results.text = await generateTextWithOpenAI(prompt);
      }
      
      // Generate image if the content type includes image
      if (contentType === 'image' || contentType === 'both') {
        results.imageUrl = await generateImageWithOpenAI(prompt);
      }
      
      setGeneratedContent(results);
      
      toast({
        title: "Content Generated",
        description: "Your AI content has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (generatedContent.text) {
      navigator.clipboard.writeText(generatedContent.text);
      toast({
        title: "Copied to Clipboard",
        description: "The generated text has been copied to your clipboard."
      });
    }
  };

  const handleDownloadImage = () => {
    if (generatedContent.imageUrl) {
      const link = document.createElement('a');
      link.href = generatedContent.imageUrl;
      link.download = `ai-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
              {showAPIKeyInput ? (
                <div className="mb-6 space-y-4 p-4 rounded-lg border border-border bg-background/80">
                  <h3 className="text-lg font-semibold">Enter Your OpenAI API Key</h3>
                  <p className="text-sm text-muted-foreground">
                    Your API key is stored only in your browser's local storage and is never sent to our servers.
                  </p>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    className="font-mono"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveAPIKey}
                      disabled={!openAIKey.trim()}
                    >
                      Save API Key
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAPIKeyInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Alert>
                    <AlertDescription>
                      Don't have an API key? You can get one from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenAI website</a>.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <>
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
                        <Textarea
                          className="w-full min-h-[120px] p-4 rounded-lg border border-border bg-background/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all duration-200 resize-none"
                          placeholder="Describe the content you want to generate... (e.g., 'A motivational post about achieving goals with a modern workspace image')"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          maxLength={500}
                        />
                        <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                          {prompt.length}/500
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Button
                          className="py-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all duration-300 shadow-md hover:shadow-lg"
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
                        
                        {openAIKey && (
                          <button 
                            className="text-sm text-primary hover:underline"
                            onClick={() => setShowAPIKeyInput(true)}
                          >
                            Update API Key
                          </button>
                        )}
                      </div>
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
                                <Button variant="outline" size="sm" className="text-xs" onClick={handleCopyText}>
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
                                <Button variant="outline" size="sm" className="text-xs" onClick={handleDownloadImage}>
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Tabs>
                </>
              )}
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
