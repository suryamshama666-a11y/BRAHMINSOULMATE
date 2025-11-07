import React, { useState } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { useHoroscopeFeatures } from '@/features/profile/hooks/useHoroscopeFeatures';
import { Star, Calendar, CircleDot, Moon, Users, Video, Phone, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentPlans from '@/features/payments/components/PaymentPlans';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import PaymentForm from '@/features/payments/components/PaymentForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AstrologicalServices() {
  const profile = { id: '1', userId: '1', name: 'User' }; // Default profile for hook
  const { user, upgradeSubscription } = useAuth();
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{name: string, price: number} | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  const {
    handleBirthChartGeneration,
    handleKundaliMatching,
    handleDoshaCheck,
    handleGunaMatching,
    handleAstrologerConsultation,
    handleAuspiciousTiming
  } = useHoroscopeFeatures(profile as any);

  const handlePaymentSuccess = () => {
    if (selectedPlanForPayment) {
      if (selectedPlanForPayment.name === 'Basic') {
        upgradeSubscription('basic');
      } else if (selectedPlanForPayment.name === 'Premium') {
        upgradeSubscription('premium');
      } else if (selectedPlanForPayment.name === 'Annual Plan') {
        upgradeSubscription('yearly');
      }
    }
    setPaymentDialogOpen(false);
    setSelectedPlanForPayment(null);
    toast.success('Subscription activated successfully!');
  };

  const handleSubscribeClick = (planName: string, planPrice: number) => {
    if (!user) {
      toast.error('Please log in to subscribe to a plan');
      return;
    }
    
    setSelectedPlanForPayment({ name: planName, price: planPrice });
    setPaymentDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold mb-2 text-[#E30613]">
              Astrological Services
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive astrological services to guide your matrimonial journey with ancient wisdom and modern expertise.
            </p>
          </header>

          {/* Subscription Plans Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-center mb-6 text-[#E30613]">
              Our Subscription Plans
            </h2>
            <PaymentPlans />
            
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogContent className="max-w-lg">
                {selectedPlanForPayment && (
                  <PaymentForm 
                    planName={selectedPlanForPayment.name} 
                    planPrice={selectedPlanForPayment.price}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setPaymentDialogOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </section>

          {/* Main navigation for astrological services */}
          <NavigationMenu className="mb-8 max-w-full w-full justify-center">
            <NavigationMenuList className="px-4 space-x-2 md:space-x-4 flex-wrap justify-center">
              <NavigationMenuItem>
                <NavigationMenuTrigger>Birth Charts</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                    <ListItem 
                      title="Generate Birth Chart" 
                      href="#birth-chart"
                      icon={<Star className="h-4 w-4 text-brahmin-primary mr-2" />}
                      onClick={handleBirthChartGeneration}
                    >
                      Upload details and generate your personalized birth chart.
                    </ListItem>
                    <ListItem 
                      title="Birth Chart Analysis" 
                      href="#birth-chart-analysis"
                      icon={<Moon className="h-4 w-4 text-brahmin-primary mr-2" />}
                      onClick={handleBirthChartGeneration}
                    >
                      Detailed analysis of your birth chart by expert astrologers.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Matching Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                    <ListItem 
                      title="Kundali Matching" 
                      href="#kundali-matching"
                      icon={<Users className="h-4 w-4 text-brahmin-primary mr-2" />}
                      onClick={handleKundaliMatching}
                    >
                      Traditional matching based on classical Vedic texts.
                    </ListItem>
                    <ListItem 
                      title="Guna Milan Analysis" 
                      href="#guna-milan"
                      icon={<CircleDot className="h-4 w-4 text-brahmin-primary mr-2" />}
                      onClick={handleGunaMatching}
                    >
                      36-point compatibility analysis with visual charts.
                    </ListItem>
                    <ListItem 
                      title="Dosha Check" 
                      href="#dosha-check"
                      icon={<CircleDot className="h-4 w-4 text-brahmin-primary mr-2" />}
                      onClick={handleDoshaCheck}
                    >
                      Mangal, Nadi, and other dosha checking services.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Consultations</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                    <ListItem 
                      title="Video Consultation" 
                      href="#video-consultation"
                      icon={<Video className="h-4 w-4 text-brahmin-primary mr-2" />}
                      onClick={handleAstrologerConsultation}
                    >
                      Schedule a video call with our verified astrologers.
                    </ListItem>
                    <ListItem 
                      title="Phone Consultation" 
                      href="#phone-consultation"
                      icon={<Phone className="h-4 w-4 text-brahmin-primary mr-2" />}
                      onClick={handleAstrologerConsultation}
                    >
                      Phone consultations for detailed analysis.
                    </ListItem>
                    <ListItem 
                      title="Chat with Astrologer" 
                      href="#chat-consultation"
                      icon={<MessageCircle className="h-4 w-4 text-brahmin-primary mr-2" />}
                      onClick={handleAstrologerConsultation}
                    >
                      Chat-based consultations for quick queries.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="#auspicious-timing" 
                  className={navigationMenuTriggerStyle()}
                  onClick={handleAuspiciousTiming}
                >
                  Auspicious Timing
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Main content tabs */}
          <Tabs defaultValue="birth-charts" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="birth-charts">Birth Charts</TabsTrigger>
              <TabsTrigger value="matching">Compatibility</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
              <TabsTrigger value="timing">Auspicious Timing</TabsTrigger>
            </TabsList>
            
            {/* Birth Charts Section */}
            <TabsContent value="birth-charts" className="space-y-6" id="birth-chart">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-[#E30613]">
                    <Star className="mr-2 h-5 w-5 text-[#E30613]" />
                    Birth Chart Generation
                  </CardTitle>
                  <CardDescription>
                    Upload your birth details or enter them manually to generate your personalized birth chart.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ServiceActionButton 
                      title="Generate Birth Chart" 
                      description="Detailed birth chart with planetary positions"
                      onClick={handleBirthChartGeneration}
                      icon={<Star className="h-5 w-5 text-[#E30613]" />}
                    />
                    <ServiceActionButton 
                      title="Birth Chart Analysis" 
                      description="Expert interpretation of your chart"
                      onClick={handleBirthChartGeneration}
                      icon={<Moon className="h-5 w-5 text-[#E30613]" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Matching Services Section */}
            <TabsContent value="matching" className="space-y-6" id="kundali-matching">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-[#E30613]">
                    <Users className="mr-2 h-5 w-5 text-[#E30613]" />
                    Astrological Compatibility
                  </CardTitle>
                  <CardDescription>
                    Comprehensive astrological compatibility analysis services based on traditional methods.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ServiceActionButton 
                      title="Kundali Matching" 
                      description="Traditional matching based on classical texts"
                      onClick={handleKundaliMatching}
                      icon={<Users className="h-5 w-5 text-[#E30613]" />}
                    />
                    <ServiceActionButton 
                      title="Guna Milan Analysis" 
                      description="36-point compatibility with visual charts"
                      onClick={handleGunaMatching}
                      icon={<CircleDot className="h-5 w-5 text-[#E30613]" />}
                    />
                    <ServiceActionButton 
                      title="Dosha Check" 
                      description="Mangal, Nadi, and other doshas"
                      onClick={handleDoshaCheck}
                      icon={<CircleDot className="h-5 w-5 text-[#E30613]" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Consultations Section */}
            <TabsContent value="consultations" className="space-y-6" id="video-consultation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-[#E30613]">
                    <Video className="mr-2 h-5 w-5 text-[#E30613]" />
                    Astrologer Consultations
                  </CardTitle>
                  <CardDescription>
                    Connect with our network of verified astrologers for personalized guidance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ServiceActionButton 
                      title="Video Consultation" 
                      description="Face-to-face consultation via video call"
                      onClick={handleAstrologerConsultation}
                      icon={<Video className="h-5 w-5 text-[#E30613]" />}
                    />
                    <ServiceActionButton 
                      title="Phone Consultation" 
                      description="Detailed voice consultation"
                      onClick={handleAstrologerConsultation}
                      icon={<Phone className="h-5 w-5 text-[#E30613]" />}
                    />
                    <ServiceActionButton 
                      title="Chat Consultation" 
                      description="Text-based consultation for quick queries"
                      onClick={handleAstrologerConsultation}
                      icon={<MessageCircle className="h-5 w-5 text-[#E30613]" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Auspicious Timing Section */}
            <TabsContent value="timing" className="space-y-6" id="auspicious-timing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-[#E30613]">
                    <Calendar className="mr-2 h-5 w-5 text-[#E30613]" />
                    Auspicious Timing
                  </CardTitle>
                  <CardDescription>
                    Find the most auspicious times for important life events and communications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ServiceActionButton 
                      title="Meeting Timing" 
                      description="Best times for first meetings"
                      onClick={handleAuspiciousTiming}
                      icon={<Calendar className="h-5 w-5 text-[#E30613]" />}
                    />
                    <ServiceActionButton 
                      title="Communication Timing" 
                      description="Optimal times for important discussions"
                      onClick={handleAuspiciousTiming}
                      icon={<Calendar className="h-5 w-5 text-[#E30613]" />}
                    />
                    <ServiceActionButton 
                      title="Ceremony Timing" 
                      description="Auspicious dates for ceremonies"
                      onClick={handleAuspiciousTiming}
                      icon={<Calendar className="h-5 w-5 text-[#E30613]" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Featured Astrologers Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6 text-center text-[#E30613]">
              Our Featured Astrologers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <Card key={item}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
                        <img 
                          src={`https://randomuser.me/api/portraits/${item % 2 === 0 ? 'women' : 'men'}/${item + 20}.jpg`} 
                          alt="Astrologer" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-lg">Pandit Ramesh Sharma {item}</h3>
                      <p className="text-sm text-gray-500 mb-2">Expert in Kundali Matching</p>
                      <p className="text-sm mb-4">15+ years experience</p>
                      <Button 
                        onClick={handleAstrologerConsultation}
                        className="bg-[#E30613] hover:opacity-90"
                      >
                        Book Consultation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

// Helper component for nav menu items
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }
>(({ className, title, children, icon, onClick, ...props }, ref) => {
  return (
    <li>
      <a
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <div className="flex items-center">
          {icon}
          <div className="text-sm font-medium leading-none">{title}</div>
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </a>
    </li>
  );
});
ListItem.displayName = "ListItem";

// Helper component for service action buttons
interface ServiceActionButtonProps {
  title: string;
  description: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

function ServiceActionButton({ title, description, onClick, icon }: ServiceActionButtonProps) {
  return (
    <Button 
      variant="outline" 
      className="w-full justify-start h-auto py-3 px-4"
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && <div className="mr-3">{icon}</div>}
        <div className="flex flex-col items-start">
          <span className="font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </div>
    </Button>
  );
}
