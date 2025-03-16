
import React from 'react';
import { ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Connect Your Accounts",
      description: "Securely link your social media accounts through official APIs in just a few clicks."
    },
    {
      number: "02",
      title: "Create Content with AI",
      description: "Describe what you want or choose from templates, and our AI generates platform-optimized content."
    },
    {
      number: "03",
      title: "Schedule & Automate",
      description: "Set your posting schedule once or let our AI determine the optimal times for each platform."
    },
    {
      number: "04",
      title: "Analyze & Optimize",
      description: "Review comprehensive performance analytics and get AI-powered recommendations for improvement."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-secondary/30">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span>Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How SocialAI Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform simplifies social media management with an intuitive workflow designed for busy professionals.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line between steps */}
          <div className="absolute top-16 left-1/2 h-[calc(100%-4rem)] w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>
          
          <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-2 gap-x-12 gap-y-16 relative">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`relative animate-slide-up ${index % 2 === 0 ? 'md:pr-10' : 'md:pl-10 md:mt-24'}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="glass-card rounded-xl p-6 md:p-8 h-full relative">
                  {/* Step number badge */}
                  <div className="absolute -top-5 left-6 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm z-10">
                    {step.number}
                  </div>
                  
                  {/* Connector dot for timeline (hidden on mobile) */}
                  <div className="absolute top-12 left-0 w-4 h-4 rounded-full bg-primary hidden md:block" style={{ 
                    left: index % 2 === 0 ? 'calc(100% + 1.45rem)' : '-2rem',
                  }}></div>
                  
                  <h3 className="text-xl font-semibold mb-3 mt-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  
                  {index < steps.length - 1 && (
                    <div className="flex justify-end md:hidden">
                      <ArrowRight className="text-primary h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
