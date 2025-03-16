import React, { useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Link } from 'react-router-dom';
import SignupDialog from '@/components/SignupDialog';

const Trial = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small businesses",
      monthlyPrice: 29,
      annualPrice: 24,
      features: [
        "5 social media accounts",
        "50 AI-generated posts/month",
        "Basic scheduling",
        "Standard analytics",
        "Email support",
      ],
      popular: false,
      color: "white"
    },
    {
      name: "Professional",
      description: "Ideal for growing businesses and marketing teams",
      monthlyPrice: 79,
      annualPrice: 65,
      features: [
        "15 social media accounts",
        "200 AI-generated posts/month",
        "Advanced scheduling",
        "Detailed analytics",
        "Priority support",
        "Custom content templates",
        "Team collaboration",
      ],
      popular: true,
      color: "#EBF5EE"
    },
    {
      name: "Enterprise",
      description: "For large organizations with complex needs",
      monthlyPrice: 199,
      annualPrice: 165,
      features: [
        "Unlimited social accounts",
        "Unlimited AI-generated posts",
        "Advanced scheduling",
        "Custom analytics & reporting",
        "24/7 priority support",
        "Custom API integrations",
        "Dedicated account manager",
        "White-label options",
      ],
      popular: false,
      color: "white"
    }
  ];
  
  const openSignupDialog = (planName: string) => {
    setSelectedPlan(planName);
    setIsSignupOpen(true);
  };
  
  const featureCategories = [
    {
      name: "Platforms",
      features: [
        { name: "Instagram", starter: 1, professional: "✓", enterprise: "✓" },
        { name: "Facebook", starter: 1, professional: "✓", enterprise: "✓" },
        { name: "Twitter", starter: 1, professional: "✓", enterprise: "✓" },
        { name: "LinkedIn", starter: 1, professional: "✓", enterprise: "✓" },
        { name: "TikTok", starter: 1, professional: "✓", enterprise: "✓" },
        { name: "Pinterest", starter: 0, professional: "✓", enterprise: "✓" },
      ]
    },
    {
      name: "Content Creation",
      features: [
        { name: "AI Post Generator", starter: "✓", professional: "✓", enterprise: "✓" },
        { name: "AI Image Generator", starter: "✓", professional: "✓", enterprise: "✓" },
        { name: "Template Library", starter: 10, professional: 50, enterprise: "✓" },
        { name: "Hashtag Suggestions", starter: "✓", professional: "✓", enterprise: "✓" },
        { name: "Bulk Upload", starter: "", professional: "✓", enterprise: "✓" },
      ]
    },
    {
      name: "Publishing",
      features: [
        { name: "Scheduled Posts", starter: 50, professional: 200, enterprise: "✓" },
        { name: "Content Calendar", starter: "✓", professional: "✓", enterprise: "✓" },
        { name: "Best Time to Post", starter: "", professional: "✓", enterprise: "✓" },
        { name: "Auto-posting", starter: "", professional: "✓", enterprise: "✓" },
        { name: "Post Approval Flow", starter: "", professional: "✓", enterprise: "✓" },
      ]
    },
    {
      name: "Analytics",
      features: [
        { name: "Basic Analytics", starter: "✓", professional: "✓", enterprise: "✓" },
        { name: "Engagement Reports", starter: "", professional: "✓", enterprise: "✓" },
        { name: "Custom Reports", starter: "", professional: "", enterprise: "✓" },
        { name: "Export Reports", starter: "", professional: "✓", enterprise: "✓" },
      ]
    },
    {
      name: "Team & Workflow",
      features: [
        { name: "Team Members", starter: 1, professional: 5, enterprise: "✓" },
        { name: "Role Management", starter: "", professional: "✓", enterprise: "✓" },
        { name: "Approval Workflows", starter: "", professional: "✓", enterprise: "✓" },
      ]
    },
    {
      name: "Support",
      features: [
        { name: "Email Support", starter: "✓", professional: "✓", enterprise: "✓" },
        { name: "Priority Support", starter: "", professional: "✓", enterprise: "✓" },
        { name: "Dedicated Manager", starter: "", professional: "", enterprise: "✓" },
      ]
    },
  ];
  
  const faqs = [
    {
      question: "How does the 14-day free trial work?",
      answer: "Your free trial gives you full access to all SocialAI features for 14 days. No credit card required to start. You can upgrade to a paid plan anytime during or after your trial."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your subscription will take effect immediately."
    },
    {
      question: "What happens when my trial ends?",
      answer: "When your 14-day trial ends, you'll need to select a paid plan to continue using SocialAI. Don't worry - we'll send you a reminder before your trial expires."
    },
    {
      question: "Can I request a demo before signing up?",
      answer: "Absolutely! Enterprise customers can request a personalized demo with our team. Contact us through the 'Request Demo' button and our team will reach out to schedule a session."
    },
    {
      question: "How does billing work?",
      answer: "We offer both monthly and annual billing. Annual plans come with a 20% discount. All plans are billed automatically at the start of each billing period."
    }
  ];
  
  const brands = [
    { name: "Nike", logo: "placeholder.svg" },
    { name: "Google", logo: "placeholder.svg" },
    { name: "Airbnb", logo: "placeholder.svg" },
    { name: "Spotify", logo: "placeholder.svg" },
    { name: "Microsoft", logo: "placeholder.svg" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">SocialAI</Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Back to Home</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 text-center">
          <div className="container max-w-4xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Start Your Free 14-Days Trial Now</h1>
            
            <div className="mt-6 inline-flex items-center p-1 bg-muted rounded-full">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-full text-sm ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                } transition-colors`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-2 rounded-full text-sm ${
                  billingPeriod === 'annual'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                } transition-colors`}
              >
                Annual <span className="text-xs opacity-80">(Save 20%)</span>
              </button>
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div 
                  key={plan.name}
                  style={{ backgroundColor: plan.color }}
                  className={`rounded-lg border ${
                    plan.popular ? 'border-primary shadow-md' : 'border-border'
                  } overflow-hidden`}
                >
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
                      RECOMMENDED
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    
                    <div className="mt-4">
                      <span className="text-2xl font-bold">
                        ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                      </span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    
                    {billingPeriod === 'annual' && (
                      <p className="text-xs text-primary mt-1">
                        Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/year
                      </p>
                    )}
                    
                    <Button 
                      className="w-full mt-4" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => openSignupDialog(plan.name)}
                    >
                      Start Free Trial
                    </Button>
                    
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex text-sm gap-2">
                          <CheckIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Compare Features Across Plans</h2>
            
            <div className="overflow-x-auto">
              <Table className="w-full border">
                <TableHeader className="bg-muted/70">
                  <TableRow>
                    <TableHead className="w-[300px]">Features</TableHead>
                    <TableHead className="text-center">Starter</TableHead>
                    <TableHead className="text-center bg-primary/10">Professional</TableHead>
                    <TableHead className="text-center">Enterprise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureCategories.map((category) => (
                    <React.Fragment key={category.name}>
                      <TableRow className="bg-muted/40">
                        <TableCell colSpan={4} className="font-medium">
                          {category.name}
                        </TableCell>
                      </TableRow>
                      {category.features.map((feature) => (
                        <TableRow key={feature.name}>
                          <TableCell>{feature.name}</TableCell>
                          <TableCell className="text-center">{feature.starter}</TableCell>
                          <TableCell className="text-center bg-primary/5">{feature.professional}</TableCell>
                          <TableCell className="text-center">{feature.enterprise}</TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.name} className="text-center">
                  <div className="font-medium mb-2">{plan.name}</div>
                  <div className="text-2xl font-bold mb-1">
                    ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => openSignupDialog(plan.name)}
                  >
                    Start Free Trial
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-xl font-medium mb-6">Trusted by Agencies and Brands Worldwide</h2>
            <div className="grid grid-cols-5 gap-8 items-center">
              {brands.map((brand) => (
                <div key={brand.name} className="flex justify-center">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="h-10 w-auto opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Collapsible key={index} className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger className="flex justify-between items-center w-full p-4 text-left">
                    <span className="font-medium">{faq.question}</span>
                    <div className="h-5 w-5 text-primary flex items-center justify-center">
                      <svg 
                        width="14" 
                        height="14" 
                        viewBox="0 0 14 14" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="transform transition-transform duration-200"
                      >
                        <path 
                          d="M7 0V14M0 7H14" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                    {faq.answer}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SocialAI. All rights reserved.</p>
        </div>
      </footer>
      
      <SignupDialog 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)} 
        planName={selectedPlan} 
      />
    </div>
  );
};

export default Trial;
