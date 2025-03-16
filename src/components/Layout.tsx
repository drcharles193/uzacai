
import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full py-4 px-6 md:px-10 border-b border-border/40 sticky top-0 backdrop-blur-md bg-background/80 z-50">
        <div className="container max-w-7xl mx-auto flex justify-between items-center animate-fade-in">
          <a href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg transition-transform duration-300 group-hover:rotate-3">
              S
            </div>
            <span className="font-display font-semibold text-lg">SocialAI</span>
          </a>
          
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-full">
              Sign in
            </Button>
            <Button size="sm" className="rounded-full">
              Start Free Trial
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="w-full py-12 px-6 md:px-10 border-t border-border/40 bg-secondary/50">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  S
                </div>
                <span className="font-display font-semibold">SocialAI</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                Automate your social media presence with AI-generated content that engages your audience and saves you time.
              </p>
              <div className="flex gap-4">
                <FooterIconLink href="#" ariaLabel="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </FooterIconLink>
                <FooterIconLink href="#" ariaLabel="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </FooterIconLink>
                <FooterIconLink href="#" ariaLabel="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </FooterIconLink>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-sm">Product</h4>
              <ul className="space-y-3">
                <FooterLink href="#features">Features</FooterLink>
                <FooterLink href="#pricing">Pricing</FooterLink>
                <FooterLink href="#testimonials">Testimonials</FooterLink>
                <FooterLink href="#how-it-works">How It Works</FooterLink>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-sm">Company</h4>
              <ul className="space-y-3">
                <FooterLink href="#">About</FooterLink>
                <FooterLink href="#">Blog</FooterLink>
                <FooterLink href="#">Careers</FooterLink>
                <FooterLink href="#">Contact</FooterLink>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground order-2 md:order-1">
              © {new Date().getFullYear()} SocialAI. All rights reserved.
            </p>
            <div className="flex gap-4 order-1 md:order-2">
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a 
    href={href} 
    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 focus-ring rounded-md"
  >
    {children}
  </a>
);

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <li>
    <a 
      href={href} 
      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus-ring"
    >
      {children}
    </a>
  </li>
);

const FooterIconLink: React.FC<{ href: string; ariaLabel: string; children: React.ReactNode }> = ({ 
  href, 
  ariaLabel, 
  children 
}) => (
  <a 
    href={href} 
    aria-label={ariaLabel}
    className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus-ring p-2 rounded-full bg-muted/50 hover:bg-muted"
  >
    {children}
  </a>
);

export default Layout;
