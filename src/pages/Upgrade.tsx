import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import AppSidebar from '@/components/AppSidebar';

const Upgrade = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const navigate = useNavigate();
  
  const plans = [
    {
      id: 'starter',
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
      id: 'professional',
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
      id: 'enterprise',
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
  
  const handlePayment = (planId: string) => {
    toast.success(`Processing payment for ${planId} plan. This would connect to Stripe in production.`);
    
    setTimeout(() => {
      toast.success('Subscription activated successfully!');
      navigate('/dashin');
    }, 1500);
  };
  
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashin')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Upgrade Your Account</h1>
        </div>
        
        <div className="flex-1 bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Choose Your Perfect Plan</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Unlock the full potential of SocialAI with a premium plan that fits your needs.
                All plans include a 14-day money-back guarantee.
              </p>
              
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
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  style={{ backgroundColor: plan.color }}
                  className={`relative overflow-hidden ${
                    plan.popular ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">/mo</span>
                      
                      {billingPeriod === 'annual' && (
                        <p className="text-xs text-primary mt-1">
                          Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/year
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      variant={plan.popular ? "default" : "outline"} 
                      className="w-full"
                      onClick={() => handlePayment(plan.id)}
                    >
                      Choose {plan.name}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Need a custom plan for your enterprise?
              </p>
              <Button variant="outline" onClick={() => navigate('/contact')}>Contact Sales</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
