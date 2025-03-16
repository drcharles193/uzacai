
import React from 'react';
import { Button } from "@/components/ui/button";

const LandingHero: React.FC = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16 animate-fade-in">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span className="animate-pulse-subtle">●</span>
            <span className="ml-2">Transform Your Social Media</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl animate-slide-up">
            Automate Your <span className="text-primary">Social Media</span> With AI
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up">
            AI-powered content creation and scheduling across all platforms. Generate captivating posts that convert and save hours every week.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <Button className="px-8 py-6 rounded-full text-base" size="lg">
              Start Your Free Trial
            </Button>
            <Button variant="outline" className="px-8 py-6 rounded-full text-base" size="lg">
              Request a Demo
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-muted-foreground animate-slide-up">
            No credit card required • Cancel anytime • 14-day free trial
          </div>
        </div>
        
        <div className="relative mx-auto max-w-5xl mt-16 animate-scale">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl blur-md"></div>
          <div className="glass-card rounded-2xl overflow-hidden shadow-md">
            <div className="aspect-video w-full bg-secondary/40 rounded-t-2xl p-6">
              <img 
                src="/placeholder.svg" 
                alt="SocialAI Dashboard Preview" 
                className="w-full h-full object-cover rounded-lg border border-border/50"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { stat: '10x', desc: 'Faster Content Creation' },
            { stat: '86%', desc: 'Increase in Engagement' },
            { stat: '5000+', desc: 'Business Users' },
            { stat: '120M+', desc: 'Posts Generated' },
          ].map((item, index) => (
            <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="font-display font-bold text-3xl md:text-4xl mb-2">{item.stat}</div>
              <div className="text-sm text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
