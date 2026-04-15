import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Users, Video, Star, Shield, Sparkles, ArrowRight, CheckCircle2, Quote, ChevronRight } from 'lucide-react';
import SEO from '@/components/SEO';

const FloatingHeart = ({ delay, size, left }: { delay: number; size: number; left: string }) => (
  <div
    className="absolute pointer-events-none animate-float-up opacity-0"
    style={{
      left,
      bottom: '10%',
      animationDelay: `${delay}s`,
      animationDuration: '8s',
    }}
  >
    <Heart className={`text-rose-400/30`} style={{ width: size, height: size }} fill="currentColor" />
  </div>
);

const Landing = () => {
  const [_scrollY, setScrollY] = useState(0);

  // effect:audited — Scroll event listener for parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Heart, title: 'Smart Matching', desc: 'AI-powered compatibility based on values, traditions & preferences', color: 'from-rose-500 to-pink-600' },
    { icon: Users, title: 'Verified Profiles', desc: 'Trusted community with authentic, verified Brahmin families', color: 'from-amber-500 to-orange-600' },
    { icon: Video, title: 'Virtual Dates', desc: 'Meet safely through HD video calls before meeting in person', color: 'from-violet-500 to-purple-600' },
    { icon: Shield, title: 'Privacy First', desc: 'Your data is encrypted and never shared without consent', color: 'from-emerald-500 to-teal-600' },
  ];

  const stats = [
    { value: '50K+', label: 'Active Members' },
    { value: '12K+', label: 'Happy Couples' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '4.9★', label: 'App Rating' },
  ];

  const testimonials = [
    { name: 'Priya & Arjun', location: 'Chennai', quote: 'Found my soulmate within 3 months. The matching algorithm understood exactly what I was looking for.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { name: 'Sneha & Vikram', location: 'Bangalore', quote: 'The video date feature helped us connect deeply before meeting. We knew we were meant for each other.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { name: 'Ananya & Rohan', location: 'Mumbai', quote: 'Finally, a platform that respects our traditions while embracing modern matchmaking.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      <SEO 
        title="Find Your Sacred Soulmate"
        description="Join the exclusive community of verified Brahmin profiles. Premium matchmaking with tradition, security, and sacred connections."
        keywords="Brahmin matrimony, Brahmin soulmate, Gotra matching, Brahmin community, matrimonial services"
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.12) 0%, transparent 40%),
                             radial-gradient(circle at 40% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 45%)`
          }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23b45309' fill-rule='evenodd'%3E%3Cpath d='M40 0L20 40L40 80L60 40z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }} />
        </div>

        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingHeart delay={0} size={24} left="10%" />
          <FloatingHeart delay={2} size={18} left="25%" />
          <FloatingHeart delay={4} size={28} left="45%" />
          <FloatingHeart delay={1} size={20} left="65%" />
          <FloatingHeart delay={3} size={22} left="85%" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6 sm:mb-8 animate-pop">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
              <span className="text-xs sm:text-sm font-medium text-amber-700">Trusted by 50,000+ Families</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-orange-600 bg-clip-text text-transparent block">
                Find Your Perfect
              </span>
              <span className="text-gray-800 block">Life Partner</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-light px-4">
              Connect with like-minded Brahmin singles who share your{' '}
              <span className="text-amber-600 font-medium">values</span>,{' '}
              <span className="text-rose-600 font-medium">traditions</span>, and{' '}
              <span className="text-orange-600 font-medium">dreams</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto group bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-xl shadow-rose-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 px-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>100% Verified Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span>Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 flex-shrink-0" />
                <span>12,000+ Success Stories</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 px-4">
              Why Choose <span className="text-rose-600">Brahmin Soulmate</span>?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Modern matchmaking that honors tradition
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 sm:mb-6 shadow-lg`}>
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 group-hover:text-rose-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>

                <div className="mt-4 sm:mt-6 flex items-center text-sm sm:text-base text-rose-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
              Find Love in 3 Simple Steps
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto px-4">
              Your journey to finding the perfect partner starts here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign up and create your detailed profile with preferences' },
              { step: '02', title: 'Get Matched', desc: 'Our AI finds compatible matches based on your criteria' },
              { step: '03', title: 'Connect & Meet', desc: 'Start conversations and meet your potential life partner' },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl font-bold group-hover:bg-white group-hover:text-rose-600 transition-all duration-300">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-white/30">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-white/80 px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 px-4">
              Love <span className="text-rose-600">Stories</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              Real couples, real connections, real happiness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow relative"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 sm:w-10 sm:h-10 text-rose-100" />
                <div className="flex items-center gap-3 sm:gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-rose-100"
                  />
                  <div>
                    <div className="text-sm sm:text-base font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/50 to-orange-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/50 to-rose-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full mb-6 sm:mb-8 shadow-xl animate-pulse-gentle">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 px-4">
                Ready to Find Your <span className="text-rose-600">Soulmate</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
                Join thousands of Brahmin families who have found their perfect match. Your love story is waiting to begin.
              </p>
              <Link to="/register" className="inline-block w-full sm:w-auto">
                <Button className="w-full sm:w-auto group bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-8 sm:px-12 py-5 sm:py-7 text-lg sm:text-xl rounded-full shadow-xl shadow-rose-500/30 transition-all duration-300 hover:scale-105">
                  Create Free Account
                  <Sparkles className="ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
              <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 px-4">
                Free to join • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
                </div>
                <span className="text-white font-bold text-base sm:text-lg">BrahminSoulmate</span>
              </div>
              <p className="text-xs sm:text-sm">
                Connecting hearts with tradition and modern values since 2020.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/success-stories" className="hover:text-white transition-colors">Success Stories</Link></li>
                <li><Link to="/plans" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Safety Tips</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/help" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>© {new Date().getFullYear()} Brahmin Soulmate Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;