
import React from 'react';
import { Code, ImageIcon, CalendarCheck, Share2, Sparkles, Zap } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "AI Content Creation",
      description: "Generate captivating captions, hashtags, and images tailored to your brand voice and audience."
    },
    {
      icon: <CalendarCheck className="h-5 w-5" />,
      title: "Smart Scheduling",
      description: "Our AI determines the optimal posting times for maximum engagement on each platform."
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      title: "Multi-Platform Publishing",
      description: "Seamlessly post to all major social networks from a single dashboard with one click."
    },
    {
      icon: <ImageIcon className="h-5 w-5" />,
      title: "Visual Content Generator",
      description: "Create stunning images and graphics that align with your brand identity in seconds."
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "Advanced Analytics",
      description: "Track performance metrics across all platforms with detailed insights and recommendations."
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Engagement Automation",
      description: "Automatically respond to comments and messages with AI that sounds like your brand."
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span>Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Social Media Success
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive toolkit eliminates the need for multiple tools, saving you time and streamlining your workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
