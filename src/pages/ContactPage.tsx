import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppSidebar from '@/components/AppSidebar';
const ContactPage = () => {
  const navigate = useNavigate();
  return <div className="flex min-h-screen">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Contact Us</h1>
        </div>
        
        <div className="flex-1 bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our dedicated team is here to help you with any questions about our enterprise solutions and custom plans.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium text-black">info@tanutrics.com</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    For sales inquiries
                  </p>
                  
                  <CardDescription className="text-base text-black mt-4 font-medium">info@socialai.com</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    For technical support
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Phone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium text-black">+1 (531) 123-4567</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mon-Fri, 9am-6pm EST
                  </p>
                  
                  <CardDescription className="text-base font-medium text-black mt-4">+1 (531) 987-6543</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enterprise support (24/7)
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium text-black">UzacAI Headquarters</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    123 Tech Boulevard<br />
                    Suite 500<br />
                    San Francisco, CA 94107
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Enterprise Inquiry Form</CardTitle>
                <CardDescription>
                  Fill out the form below and a member of our enterprise sales team will contact you shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">First Name</label>
                      <input type="text" className="w-full p-2 border rounded-md" placeholder="Your first name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Last Name</label>
                      <input type="text" className="w-full p-2 border rounded-md" placeholder="Your last name" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Company Email</label>
                    <input type="email" className="w-full p-2 border rounded-md" placeholder="your.email@company.com" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Company Name</label>
                    <input type="text" className="w-full p-2 border rounded-md" placeholder="Your company" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <textarea className="w-full p-2 border rounded-md min-h-[100px]" placeholder="Tell us about your requirements"></textarea>
                  </div>
                  
                  <Button className="mt-2">Submit Inquiry</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default ContactPage;