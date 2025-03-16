
import React from 'react';
import Layout from '@/components/Layout';
import LandingHero from '@/components/landing/LandingHero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CTASection from '@/components/landing/CTASection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ViewHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 py-2 px-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              S
            </div>
            <span className="font-display font-semibold text-lg">SocialAI</span>
          </div>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
      
      <main>
        <LandingHero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTASection />
      </main>
    </div>
  );
};

export default ViewHome;
