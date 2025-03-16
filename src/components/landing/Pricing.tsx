
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckIcon } from 'lucide-react';

type PricingPeriod = 'monthly' | 'annual';

const Pricing: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<PricingPeriod>('annual');
  
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
      buttonText: "Start Free Trial"
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
      buttonText: "Start Free Trial"
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
      buttonText: "Request a Demo"
    }
  ];

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span>Simple Pricing</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose the Perfect Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Flexible options to fit your needs with a 14-day free trial on all plans.
          </p>
          
          <div className="mt-8 inline-flex items-center p-1 bg-muted rounded-full">
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

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border ${
                plan.popular ? 'border-primary shadow-lg' : 'border-border'
              } bg-card transition-all duration-300 animate-slide-up`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 inset-x-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                  </span>
                  <span className="text-muted-foreground ml-1">/month</span>
                  
                  {billingPeriod === 'annual' && (
                    <div className="mt-1 text-sm text-primary">
                      Save ${(plan.monthlyPrice - plan.annualPrice) * 12} yearly
                    </div>
                  )}
                </div>
                
                <Button 
                  className={`w-full mb-6 ${!plan.popular ? 'bg-primary/90 hover:bg-primary' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
                
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Need a custom plan for your enterprise? Contact our sales team.
          </p>
          <Button variant="outline">Contact Sales</Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
