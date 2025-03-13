
import React from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import AIContentGenerator from '@/components/AIContentGenerator';
import SocialMediaConnect from '@/components/SocialMediaConnect';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import PostPreview from '@/components/PostPreview';

const Index = () => {
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

export default Index;
