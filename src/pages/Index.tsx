
import React from 'react';
import Layout from '@/components/Layout';
import LandingHero from '@/components/landing/LandingHero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CTASection from '@/components/landing/CTASection';

const Index = () => {
  return (
    <Layout>
      <LandingHero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTASection />
    </Layout>
  );
};

export default Index;
