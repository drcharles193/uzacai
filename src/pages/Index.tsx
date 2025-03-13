
import React from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import AIContentGenerator from '@/components/AIContentGenerator';
import SocialMediaConnect from '@/components/SocialMediaConnect';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import PostPreview from '@/components/PostPreview';
import Auth from '@/components/Auth';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

const AuthenticatedApp = () => {
  return (
    <Layout>
      <Hero />
      <AIContentGenerator />
      <SocialMediaConnect />
      <PostPreview />
      <ScheduleCalendar />
    </Layout>
  );
};

const UnauthenticatedApp = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <Auth />
            </div>
            
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="mb-6 animate-slide-up">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <span>All-in-One Solution</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Streamline Your Social Media Management
                </h2>
                <p className="text-lg text-muted-foreground">
                  Sign in to access powerful AI content generation, cross-platform posting, analytics, and scheduling - all in one place.
                </p>
              </div>
              
              <div className="space-y-4 animate-slide-up">
                {[
                  {
                    title: "AI Content Creation",
                    description: "Generate engaging posts and images with advanced AI."
                  },
                  {
                    title: "Multi-Platform Publishing",
                    description: "Post to all your social accounts with a single click."
                  },
                  {
                    title: "Smart Scheduling",
                    description: "Schedule posts for optimal engagement times."
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
