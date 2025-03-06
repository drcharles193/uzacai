
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const PostPreview: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('twitter');
  
  const handleSchedule = () => {
    toast({
      title: "Post Scheduled",
      description: "Your post has been scheduled successfully."
    });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">
            Preview Before You Post
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up">
            See exactly how your content will look on each platform before it goes live. Make adjustments to perfect your message.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="twitter" onValueChange={setActiveTab} className="animate-scale">
            <div className="flex justify-center mb-8">
              <TabsList className="p-1">
                <TabsTrigger value="twitter" className="rounded-md data-[state=active]:shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  Twitter
                </TabsTrigger>
                <TabsTrigger value="instagram" className="rounded-md data-[state=active]:shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  Instagram
                </TabsTrigger>
                <TabsTrigger value="facebook" className="rounded-md data-[state=active]:shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  Facebook
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="glass-card rounded-xl shadow-md overflow-hidden mx-auto">
              <TabsContent value="twitter" className="p-0 m-0">
                <div className="p-4 border-b border-border bg-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted"></div>
                    <div>
                      <div className="font-semibold">Your Name</div>
                      <div className="text-sm text-muted-foreground">@username</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="mb-4">
                    Just launched our new product! Super excited to share what we've been working on for the past few months. Check it out at <span className="text-primary">socialai.example.com</span> 🚀 #ProductLaunch #Excited
                  </p>
                  
                  <div className="rounded-xl overflow-hidden bg-muted mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f" 
                      alt="Product launch" 
                      className="w-full aspect-[16/9] object-cover"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="text-xs">10:30 AM · Jun 7, 2023</div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span>42</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                        <span>12</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <span>87</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="instagram" className="p-0 m-0">
                <div className="p-4 border-b border-border bg-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="font-semibold">your_username</div>
                    <div className="ml-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted w-full aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f" 
                    alt="Product launch" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 2L15 22l-3-6-6-3L22 2z"></path></svg>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21"></polygon></svg>
                  </div>
                  
                  <div className="text-sm mb-1 font-semibold">243 likes</div>
                  
                  <div className="text-sm">
                    <span className="font-semibold">your_username</span> Just launched our new product! Super excited to share what we've been working on for the past few months. 🚀 #ProductLaunch #Excited
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">View all 24 comments</div>
                </div>
              </TabsContent>
              
              <TabsContent value="facebook" className="p-0 m-0">
                <div className="p-4 border-b border-border bg-white/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div>
                      <div className="font-semibold">Your Page</div>
                      <div className="text-xs text-muted-foreground">Yesterday at 10:30 AM</div>
                    </div>
                    <div className="ml-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </div>
                  </div>
                  
                  <p className="mb-4">
                    Just launched our new product! Super excited to share what we've been working on for the past few months. Check it out at socialai.example.com 🚀
                  </p>
                </div>
                
                <div className="bg-muted w-full aspect-[16/9]">
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f" 
                    alt="Product launch" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      <span>87</span>
                    </div>
                    <div>24 comments · 12 shares</div>
                  </div>
                  
                  <div className="pt-2 border-t border-border flex items-center justify-between text-muted-foreground">
                    <button className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      <span>Like</span>
                    </button>
                    <button className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      <span>Comment</span>
                    </button>
                    <button className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </TabsContent>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="rounded-lg border border-border p-3 flex items-center justify-between w-full sm:w-auto gap-3">
                <div className="text-sm flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Today, 10:30 AM</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-auto">
                  Edit Post
                </Button>
                <Button className="flex-1 sm:flex-auto" onClick={handleSchedule}>
                  Schedule Post
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default PostPreview;
