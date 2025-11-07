import React from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-brahmin-primary mb-6">Terms and Conditions</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using the BrahminSoulmate matrimonial service, you agree to be bound by these Terms and Conditions.
            If you do not agree to these terms, please do not use our services.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">2. Eligibility</h2>
          <p className="text-gray-700 mb-4">
            Our services are available to individuals who are at least 18 years of age and are seeking matrimonial matches.
            By registering, you confirm that you are of legal marriageable age according to the laws of your country of residence.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            You are responsible for maintaining the confidentiality of your account information and password.
            You agree to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">4. Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            Our <Link to="/privacy" className="text-brahmin-primary hover:underline">Privacy Policy</Link> describes how we collect,
            use, and disclose information about you. By using our services, you consent to our collection
            and use of personal data as outlined in the Privacy Policy.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">5. User Conduct</h2>
          <p className="text-gray-700 mb-4">
            You agree not to use our services for any purpose that is unlawful or prohibited by these terms.
            This includes not harassing or stalking other users, not posting false or misleading information,
            and not using our services for commercial solicitation.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">6. Termination</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to suspend or terminate your account at our sole discretion,
            without notice, for conduct that we believe violates these Terms and Conditions
            or is harmful to other users, us, or third parties, or for any other reason.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">7. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We may modify these terms at any time by posting the revised terms on our website.
            Your continued use of our services after such changes constitutes your acceptance of the revised terms.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">8. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms and Conditions, please contact us at:
            <a href="mailto:contact@brahminsoulmate.com" className="text-brahmin-primary hover:underline ml-1">
              contact@brahminsoulmate.com
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

export default Terms;
