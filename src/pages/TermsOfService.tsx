
import React from 'react';
import Layout from '@/components/Layout';
import { Separator } from '@/components/ui/separator';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-6 md:px-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              By accessing or using SocialAI's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our service. The materials contained in this website and service are protected by applicable copyright and trademark law.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Use License</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily use SocialAI's services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display;</li>
              <li>Attempt to decompile or reverse engineer any software contained in SocialAI's platform;</li>
              <li>Remove any copyright or other proprietary notations from the materials;</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            <p className="text-base text-muted-foreground leading-relaxed mt-4">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by SocialAI at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Subscription and Payments</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              SocialAI offers subscription-based services. By subscribing to our services, you agree to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You will be charged according to the pricing plan you select.</li>
              <li>Subscriptions will automatically renew unless canceled before the renewal date.</li>
              <li>You are responsible for maintaining the confidentiality of your payment information.</li>
              <li>SocialAI reserves the right to change subscription fees upon notice.</li>
              <li>Refunds are provided in accordance with our refund policy.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">User Accounts</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              To access certain features of our service, you may be required to create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your account information;</li>
              <li>All activities that occur under your account;</li>
              <li>Ensuring that your account information is accurate and up-to-date;</li>
              <li>Notifying us immediately of any unauthorized use of your account.</li>
            </ul>
            <p className="text-base text-muted-foreground leading-relaxed mt-4">
              We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to our service or other users.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">User Content</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              Our service allows you to create, upload, and share content. By submitting content to our platform, you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Retain ownership rights to your content;</li>
              <li>Grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display the content in connection with our service;</li>
              <li>Confirm that you have all necessary rights to the content you post;</li>
              <li>Agree not to post content that infringes on any third-party rights or violates our content guidelines.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Prohibited Uses</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              You agree not to use our service for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Any unlawful purpose or to violate any laws;</li>
              <li>Soliciting others to perform unlawful acts;</li>
              <li>Infringing upon or violating our intellectual property rights or those of others;</li>
              <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability;</li>
              <li>Uploading or transmitting viruses or any other malicious code;</li>
              <li>Interfering with or circumventing the security features of the service.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              SocialAI's services are provided "as is" and "as available" without any warranties, expressed or implied. SocialAI does not warrant that the service will be uninterrupted or error-free, that defects will be corrected, or that the service or servers are free of viruses or other harmful components.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              In no event shall SocialAI, its officers, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Governing Law</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which SocialAI is established, without regard to its conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located within this jurisdiction.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms of Service at any time at our sole discretion. It is your responsibility to review these Terms of Service periodically for changes. Your continued use of our service following the posting of any changes constitutes acceptance of those changes.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at terms@socialai.com.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
