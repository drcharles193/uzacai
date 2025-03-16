
import React, { useState } from 'react';
import { CheckIcon, X, ArrowRight, HelpCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Link } from 'react-router-dom';

const Trial = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  
  const plans = [
    {
      name: "Basic",
      description: "For individuals and small teams",
      monthlyPrice: 25,
      annualPrice: 20,
      features: [
        "5 social accounts",
        "50 scheduled posts",
        "Content calendar",
        "Analytics dashboard",
      ],
      popular: false,
      color: "white"
    },
    {
      name: "Standard",
      description: "For growing businesses",
      monthlyPrice: 42,
      annualPrice: 35,
      features: [
        "15 social accounts",
        "150 scheduled posts",
        "Content calendar",
        "Advanced analytics",
        "Team collaboration",
      ],
      popular: false,
      color: "white"
    },
    {
      name: "Premium",
      description: "For marketing teams",
      monthlyPrice: 85,
      annualPrice: 70,
      features: [
        "Unlimited social accounts",
        "Unlimited scheduled posts",
        "Content calendar",
        "Advanced analytics",
        "Team collaboration",
        "Custom reporting",
        "Priority support",
      ],
      popular: true,
      color: "#EBF5EE"
    },
    {
      name: "Ultimate",
      description: "For agencies and enterprises",
      monthlyPrice: 170,
      annualPrice: 140,
      features: [
        "Everything in Premium",
        "White labeling",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
      ],
      popular: false,
      color: "white"
    }
  ];
  
  // Detailed feature comparison data
  const featureCategories = [
    {
      name: "Platforms",
      features: [
        { name: "Instagram", basic: 1, standard: 1, premium: "✓", ultimate: "✓" },
        { name: "Facebook", basic: 1, standard: 3, premium: "✓", ultimate: "✓" },
        { name: "Twitter", basic: 1, standard: 3, premium: "✓", ultimate: "✓" },
        { name: "LinkedIn", basic: 1, standard: 3, premium: "✓", ultimate: "✓" },
        { name: "TikTok", basic: 1, standard: 3, premium: "✓", ultimate: "✓" },
        { name: "Pinterest", basic: 0, standard: 1, premium: "✓", ultimate: "✓" },
      ]
    },
    {
      name: "Content Creation",
      features: [
        { name: "AI Post Generator", basic: "✓", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "AI Image Generator", basic: "✓", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Template Library", basic: 10, standard: 50, premium: "✓", ultimate: "✓" },
        { name: "Hashtag Suggestions", basic: "✓", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Bulk Upload", basic: "", standard: "✓", premium: "✓", ultimate: "✓" },
      ]
    },
    {
      name: "Publishing",
      features: [
        { name: "Scheduled Posts", basic: 50, standard: 150, premium: "✓", ultimate: "✓" },
        { name: "Content Calendar", basic: "✓", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Best Time to Post", basic: "", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Auto-posting", basic: "", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Post Approval Flow", basic: "", standard: "✓", premium: "✓", ultimate: "✓" },
      ]
    },
    {
      name: "Analytics",
      features: [
        { name: "Basic Analytics", basic: "✓", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Engagement Reports", basic: "", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Custom Reports", basic: "", standard: "", premium: "✓", ultimate: "✓" },
        { name: "Export Reports", basic: "", standard: "✓", premium: "✓", ultimate: "✓" },
      ]
    },
    {
      name: "Team & Workflow",
      features: [
        { name: "Team Members", basic: 1, standard: 3, premium: 10, ultimate: "✓" },
        { name: "Role Management", basic: "", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Approval Workflows", basic: "", standard: "✓", premium: "✓", ultimate: "✓" },
      ]
    },
    {
      name: "Support",
      features: [
        { name: "Email Support", basic: "✓", standard: "✓", premium: "✓", ultimate: "✓" },
        { name: "Priority Support", basic: "", standard: "", premium: "✓", ultimate: "✓" },
        { name: "Dedicated Manager", basic: "", standard: "", premium: "", ultimate: "✓" },
      ]
    },
  ];
  
  // FAQ Data
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
  
  // Trusted brands
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
        {/* Hero section */}
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

        {/* Pricing cards */}
        <section className="py-6">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-4">
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
                    >
                      {plan.popular ? "Start Free Trial" : "Choose Plan"}
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

        {/* Compare Features */}
        <section className="py-10 bg-muted/30">
          <div className="container max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Compare Features Across Plans</h2>
            
            <div className="overflow-x-auto">
              <Table className="w-full border">
                <TableHeader className="bg-muted/70">
                  <TableRow>
                    <TableHead className="w-[300px]">Features</TableHead>
                    <TableHead className="text-center">Basic</TableHead>
                    <TableHead className="text-center">Standard</TableHead>
                    <TableHead className="text-center bg-primary/10">Premium</TableHead>
                    <TableHead className="text-center">Ultimate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureCategories.map((category) => (
                    <React.Fragment key={category.name}>
                      <TableRow className="bg-muted/40">
                        <TableCell colSpan={5} className="font-medium">
                          {category.name}
                        </TableCell>
                      </TableRow>
                      {category.features.map((feature) => (
                        <TableRow key={feature.name}>
                          <TableCell>{feature.name}</TableCell>
                          <TableCell className="text-center">{feature.basic}</TableCell>
                          <TableCell className="text-center">{feature.standard}</TableCell>
                          <TableCell className="text-center bg-primary/5">{feature.premium}</TableCell>
                          <TableCell className="text-center">{feature.ultimate}</TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-8 grid md:grid-cols-4 gap-4">
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
                  >
                    {plan.popular ? "Start Free Trial" : "Choose Plan"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted by section */}
        <section className="py-10">
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

        {/* FAQ Section */}
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
    </div>
  );
};

export default Trial;
