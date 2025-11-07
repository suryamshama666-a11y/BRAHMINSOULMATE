import React from "react";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageSquare, Video, Shield, CreditCard, User } from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 
            className="text-3xl font-serif font-bold mb-2"
            style={{ color: '#E30613' }}
          >
            Help Center
          </h1>
          <p className="text-gray-600 mb-8">Find answers to common questions or contact our support team</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
              <Phone className="h-10 w-10 mx-auto mb-4" style={{ color: '#E30613' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#E30613' }}>Call Support</h3>
              <p className="text-gray-600 mb-3">Available Mon-Sat, 10AM-7PM</p>
              <a href="tel:+918001234567" style={{ color: '#E30613' }} className="hover:underline font-medium">
                +91 800 123 4567
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
              <Mail className="h-10 w-10 mx-auto mb-4" style={{ color: '#E30613' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#E30613' }}>Email Support</h3>
              <p className="text-gray-600 mb-3">We'll respond within 24 hours</p>
              <a href="mailto:help@brahminsoulmate.com" style={{ color: '#E30613' }} className="hover:underline font-medium">
                help@brahminsoulmate.com
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
              <MessageSquare className="h-10 w-10 mx-auto mb-4" style={{ color: '#E30613' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#E30613' }}>Live Chat</h3>
              <p className="text-gray-600 mb-3">Chat with our support team</p>
              <Button 
                variant="outline" 
                className="hover:bg-[#FFF1E6]"
                style={{ borderColor: '#E30613', color: '#E30613' }}
              >
                Start Chat
              </Button>
            </div>
          </div>
          
          <h2 
            className="text-2xl font-semibold mb-6"
            style={{ color: '#E30613' }}
          >
            Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm mb-12">
            <AccordionItem value="item-1">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                How do I create an account?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                To create an account, click on the "Register" button on the top right corner of the homepage. 
                Fill in your basic details like name, email, and password. You'll receive a verification email or OTP 
                to confirm your email address. Once verified, you can complete your profile with more detailed information.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                How does horoscope matching work?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Our horoscope matching system analyzes the birth charts of two individuals based on traditional 
                Vedic astrology principles. We check for compatibility across 8 key parameters (Ashtakoot Milan) 
                including Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakut, and Nadi. The system then generates 
                a compatibility score out of 36 points, with a score above 18 generally considered auspicious.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                What are the differences between free and premium accounts?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Free accounts can create profiles, browse matches, and receive limited communications. 
                Premium accounts enjoy unlimited messaging, advanced search filters, view contact details, 
                get priority in search results, see who viewed your profile, and access detailed horoscope 
                compatibility reports. Visit our <a href="/free-vs-paid" style={{ color: '#E30613' }} className="hover:underline">Free vs Paid</a> page for more details.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                How can I ensure my privacy and safety?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                We take your privacy and safety seriously. You can control your profile visibility in the privacy settings, 
                choose to blur your photos until you're ready to share them, hide contact information from non-matches, 
                and block users if needed. We also have a reporting system for inappropriate behavior. Please visit our 
                <a href="/privacy" style={{ color: '#E30613' }} className="hover:underline ml-1">Privacy Policy</a> for more information.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                How can I cancel my subscription?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                To cancel your subscription, go to your Account Settings, select "Subscription" and click on 
                "Cancel Subscription." Your premium features will remain active until the end of your current 
                billing period. If you have any issues, please contact our customer support team.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: '#E30613' }}
            >
              Browse Help Topics
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center justify-start px-4 py-6 h-auto">
                <User className="h-5 w-5 mr-3" style={{ color: '#E30613' }} />
                <span>Account & Profile</span>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-start px-4 py-6 h-auto">
                <Shield className="h-5 w-5 mr-3" style={{ color: '#E30613' }} />
                <span>Privacy & Security</span>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-start px-4 py-6 h-auto">
                <MessageSquare className="h-5 w-5 mr-3" style={{ color: '#E30613' }} />
                <span>Messaging & Communication</span>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-start px-4 py-6 h-auto">
                <Video className="h-5 w-5 mr-3" style={{ color: '#E30613' }} />
                <span>Virtual Dates</span>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-start px-4 py-6 h-auto">
                <CreditCard className="h-5 w-5 mr-3" style={{ color: '#E30613' }} />
                <span>Billing & Subscription</span>
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: '#E30613' }}
            >
              Contact Us
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
            </p>
            
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input id="subject" placeholder="How can we help you?" />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea id="message" placeholder="Please describe your issue in detail" rows={4} />
              </div>
              
              <Button 
                type="submit" 
                style={{ backgroundColor: '#E30613' }}
                className="hover:bg-[#E30613]/90"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Help;
