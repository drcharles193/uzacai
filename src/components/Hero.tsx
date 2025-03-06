
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col items-center text-center mb-12 md:mb-20 animate-fade-in">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
            <span className="animate-pulse-subtle">●</span>
            <span className="ml-2">Introducing SocialAI</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight md:leading-tight mb-4 max-w-4xl animate-slide-up">
            Automate your social presence with <span className="text-primary">AI-powered</span> content
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-8 animate-slide-up">
            Generate engaging posts, stunning images, and schedule your content across all social platforms—all with a simple prompt.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-medium shadow-md hover:shadow-lg focus-ring">
              Get started for free
            </button>
            <button className="px-8 py-3 rounded-full border border-border bg-background hover:bg-secondary/80 transition-colors duration-300 font-medium focus-ring">
              Watch demo
            </button>
          </div>
        </div>
        
        <div className="relative mx-auto max-w-5xl animate-scale">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl blur-md"></div>
          <div className="glass-card rounded-2xl overflow-hidden shadow-md">
            <div className="aspect-[16/9] w-full bg-secondary/40 rounded-t-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-destructive/60"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/60"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/60"></div>
                <div className="flex-1"></div>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row gap-4 p-2">
                <div className="w-full md:w-1/2 bg-background/80 rounded-lg p-4 flex flex-col">
                  <div className="flex justify-between mb-3">
                    <div className="h-6 w-24 bg-muted rounded"></div>
                    <div className="h-6 w-6 bg-muted rounded-md"></div>
                  </div>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-8 w-20 bg-muted rounded-full"></div>
                    <div className="h-8 w-20 bg-muted rounded-full"></div>
                  </div>
                  <div className="mt-auto">
                    <div className="h-10 w-full bg-primary/20 rounded-lg"></div>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 bg-background/80 rounded-lg p-4 flex flex-col">
                  <div className="aspect-square w-full bg-muted rounded-lg mb-3"></div>
                  <div className="h-6 w-36 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
          {[
            { name: 'Twitter', users: '2M+' },
            { name: 'Instagram', users: '3M+' },
            { name: 'Facebook', users: '4M+' },
            { name: 'LinkedIn', users: '1M+' },
          ].map((platform, index) => (
            <div key={platform.name} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="font-display font-bold text-2xl md:text-3xl mb-1">{platform.users}</div>
              <div className="text-sm text-muted-foreground">Posts on {platform.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
