import React from "react";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Privacy Policy - Your Data Security"
        description="Learn how Brahmin Soulmate Connect protects your personal data, horoscope details, and communication privacy. Our commitment to secure matrimonial matching."
        keywords="privacy policy, data protection, matrimony privacy, Brahmin Soulmate legal"
      />
      <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-brahmin-primary mb-6">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-gray-700 mb-6">
            At BrahminSoulmate, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our matrimonial platform.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            <strong>Personal Information:</strong> Name, email address, phone number, date of birth, gender, photos,
            location, education, profession, family details, and other information you provide during registration or
            profile creation.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Horoscope Information:</strong> If provided, we collect details such as birth time, place, rashi,
            nakshatra, and other astrological information.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Device Information:</strong> IP address, browser type, operating system, and other technical information.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>To create and manage your account</li>
            <li>To provide matrimonial match suggestions based on your preferences</li>
            <li>To enable communication between members</li>
            <li>To improve our services and develop new features</li>
            <li>To send notifications about matches, messages, and account activities</li>
            <li>To ensure the safety and security of our platform</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We share your profile information with other registered users as part of our matrimonial matching service.
            We do not sell or rent your personal information to third parties for marketing purposes.
          </p>
          <p className="text-gray-700 mb-4">
            We may share information with:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Service providers who perform services on our behalf</li>
            <li>Law enforcement agencies when required by law</li>
            <li>Other users as part of the matrimonial matching process</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">4. Your Choices</h2>
          <p className="text-gray-700 mb-4">
            You can update or correct your personal information by accessing your account settings.
            You can control your profile visibility and who can contact you through privacy settings.
            You can opt-out of promotional emails by following the unsubscribe instructions.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information.
            However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">6. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting
            the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions or concerns about this Privacy Policy, please contact us at:
            <a href="mailto:privacy@brahminsoulmate.com" className="text-brahmin-primary hover:underline ml-1">
              privacy@brahminsoulmate.com
            </a>
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600">Last updated: May 4, 2025</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
