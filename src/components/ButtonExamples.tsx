import { Button } from '@/components/ui/button';
import { Heart, Send, Star, ArrowRight } from 'lucide-react';

export default function ButtonExamples() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-serif font-bold mb-6 text-center">Button Variants</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Red and Gold Gradient Buttons */}
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium text-lg">Red and Gold Gradients</h3>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="red-gold" size="default" className="text-base">
              <Heart className="mr-1" /> Send Interest
            </Button>
            <Button variant="gold-red" size="default" className="text-base">
              Premium Membership
            </Button>
          </div>
        </div>
        
        {/* Primary Button */}
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium text-lg">Primary Gradient</h3>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="primary" size="default" className="text-base">
              Register Now
            </Button>
            <Button variant="primary" size="lg" className="text-base">
              Find Matches <ArrowRight className="ml-1" />
            </Button>
          </div>
        </div>
        
        {/* Mixed Color Gradients */}
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium text-lg">Gradient Buttons</h3>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="gradient-red-gold" size="default" className="text-base">
              <Heart className="mr-1" /> Send Interest
            </Button>
            <Button variant="gradient-purple-pink" size="pill" className="text-base">
              Premium Match
            </Button>
          </div>
        </div>
        
        {/* More Gradients */}
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium text-lg">More Gradients</h3>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="gradient-blue-cyan" size="default" className="text-base">
              <Star className="mr-1" /> Upgrade Plan
            </Button>
            <Button variant="gradient-emerald-lime" size="pill" className="text-base">
              <Send className="mr-1" /> Connect
            </Button>
          </div>
        </div>
        
        {/* Maroon Button */}
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium text-lg">Maroon Buttons</h3>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="maroon" size="default" className="text-base">
              <Heart className="mr-1" /> Send Interest
            </Button>
            <Button variant="maroon-outline" size="pill" className="text-base">
              View Horoscope
            </Button>
          </div>
        </div>
        
        {/* Gold Button */}
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium text-lg">Gold Buttons</h3>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="gold" size="default" className="text-base">
              <Star className="mr-1" /> Upgrade Plan
            </Button>
            <Button variant="gold-outline" size="pill" className="text-base">
              <Send className="mr-1" /> Connect
            </Button>
          </div>
        </div>
        
        {/* Amber-Rose Gradient */}
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium text-lg">Call to Action</h3>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="gradient-amber-rose" size="xl" className="w-full text-base">
              Create Free Account
            </Button>
            <Button variant="red-gold" size="lg" className="w-full text-base">
              Premium Membership
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
