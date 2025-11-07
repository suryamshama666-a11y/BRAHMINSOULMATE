import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import Footer from '@/components/Footer';

export default function FreeVsPaid() {
  const features = [
    {
      feature: "Create Profile",
      free: true,
      paid: true
    },
    {
      feature: "Basic Search",
      free: true,
      paid: true
    },
    {
      feature: "View Public Photos",
      free: true,
      paid: true
    },
    {
      feature: "Advanced Search Filters",
      free: false,
      paid: true
    },
    {
      feature: "Send Messages",
      free: false,
      paid: true
    },
    {
      feature: "View Contact Details",
      free: false,
      paid: true
    },
    {
      feature: "Video Calls",
      free: false,
      paid: true
    },
    {
      feature: "Horoscope Matching",
      free: false,
      paid: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-serif mb-4"
            style={{ color: '#E30613' }}
          >
            Free vs Paid Membership
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compare our membership options to choose the plan that suits your needs
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4">Features</th>
                  <th className="text-center py-4">Free</th>
                  <th className="text-center py-4">Paid</th>
                </tr>
              </thead>
              <tbody>
                {features.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-4">{item.feature}</td>
                    <td className="text-center">
                      {item.free ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="text-center">
                      {item.paid ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
