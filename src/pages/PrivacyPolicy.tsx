
import React from 'react';
import Layout from '@/components/Layout';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-6 md:px-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              SocialAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this policy.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              We collect several types of information from and about users of our service, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Personal information such as name, email address, and billing information when you register for an account.</li>
              <li>Information about your social media accounts when you connect them to our service.</li>
              <li>Content data that you input into our platform for generation or scheduling.</li>
              <li>Usage data including how you interact with our service, features you use, and time spent on the platform.</li>
              <li>Device information such as IP address, browser type, operating system, and device identifiers.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Providing, maintaining, and improving our services.</li>
              <li>Processing your transactions and managing your account.</li>
              <li>Personalizing your experience and delivering content relevant to your interests.</li>
              <li>Communicating with you about updates, features, support, and promotional offers.</li>
              <li>Analyzing usage patterns to enhance our service and user experience.</li>
              <li>Detecting, preventing, and addressing technical issues or fraudulent activities.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Data Security</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your personal information, we will securely delete or anonymize it.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Our service may integrate with third-party services, such as social media platforms and analytics providers. These third parties may collect information about you when you interact with their features. This Privacy Policy does not apply to third-party websites or services, and we encourage you to review the privacy policies of any third-party entities you interact with.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Privacy Rights</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal information, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>The right to access personal information we hold about you.</li>
              <li>The right to request correction of inaccurate information.</li>
              <li>The right to request deletion of your personal information.</li>
              <li>The right to restrict or object to processing of your information.</li>
              <li>The right to data portability.</li>
            </ul>
            <p className="text-base text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us using the information provided at the end of this policy.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Our service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to remove that information from our servers.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@socialai.com.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
