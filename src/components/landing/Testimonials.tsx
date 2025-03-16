
import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "SocialAI cut our content creation time by 80% and increased our engagement by 45%. It's been a game-changer for our small marketing team.",
      author: "Sarah Johnson",
      role: "Marketing Director, TechStart Inc."
    },
    {
      quote: "The AI-generated content is so on-brand that our audience can't tell the difference. We've been able to 3x our posting frequency without adding staff.",
      author: "Michael Chen",
      role: "Social Media Manager, Bright Retail"
    },
    {
      quote: "As a solopreneur, SocialAI has been invaluable. It feels like having a full social media team at my fingertips. Worth every penny.",
      author: "Jessica Rodriguez",
      role: "Founder, Wellness Ways"
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span>Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Marketing Teams
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of marketers who've transformed their social media strategy with SocialAI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="glass-card rounded-xl p-6 md:p-8 flex flex-col h-full animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} fill="currentColor" className="w-4 h-4" />
                ))}
              </div>
              
              <blockquote className="flex-grow mb-6">
                <p className="text-foreground italic">"{testimonial.quote}"</p>
              </blockquote>
              
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
