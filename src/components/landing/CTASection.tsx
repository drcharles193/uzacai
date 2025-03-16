import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const CTASection: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to get started.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the email to your backend or CRM
    toast({
      title: "Thank you for your interest!",
      description: "We'll be in touch shortly with your trial details.",
    });
    setEmail('');
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 to-background"></div>
      
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span>Get Started Today</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-slide-up">
            Transform Your Social Media Strategy with SocialAI
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 animate-slide-up">
            Join thousands of marketers who save hours every week while creating better content that drives real results.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6 animate-slide-up">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="h-12 px-8">Start Free Trial</Button>
          </form>
          
          <p className="text-sm text-muted-foreground animate-slide-up">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
          
          <div className="mt-12 pt-6 border-t border-border flex flex-wrap justify-center gap-6 animate-slide-up">
            {[
              '/placeholder.svg',
              '/placeholder.svg',
              '/placeholder.svg',
              '/placeholder.svg',
              '/placeholder.svg',
            ].map((logo, i) => (
              <img
                key={i}
                src={logo}
                alt={`Customer ${i+1}`}
                className="h-8 opacity-50"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
