import React from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-brahmin-primary mb-6">Cookie Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-gray-700 mb-6">
            Last updated: February 13, 2026
          </p>
          
          <p className="text-gray-700 mb-6">
            This Cookie Policy explains how BrahminSoulmate ("we", "us", or "our") uses cookies and similar 
            technologies on our website. By continuing to use our website, you consent to our use of cookies 
            as described in this policy.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">1. What Are Cookies?</h2>
          <p className="text-gray-700 mb-4">
            Cookies are small text files that are stored on your device when you visit our website. They help 
            us provide you with a better experience by remembering your preferences, understanding how you use 
            our site, and improving our services.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">2. Types of Cookies We Use</h2>
          
          <h3 className="text-lg font-medium mb-3">2.1 Essential Cookies</h3>
          <p className="text-gray-700 mb-4">
            These cookies are necessary for the website to function properly. They enable core functionality 
            such as security, network management, and accessibility. The website cannot function properly 
            without these cookies.
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Session cookies:</strong> Maintain your logged-in state during your visit</li>
            <li><strong>Security cookies:</strong> Help detect and prevent security threats</li>
            <li><strong>CSRF tokens:</strong> Prevent cross-site request forgery attacks</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-3">2.2 Functional Cookies</h3>
          <p className="text-gray-700 mb-4">
            These cookies enable enhanced functionality and personalization, such as remembering your 
            preferences and settings.
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Language preference:</strong> Remembers your selected language</li>
            <li><strong>Theme preference:</strong> Remembers your dark/light mode selection</li>
            <li><strong>Search filters:</strong> Saves your last used search criteria</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-3">2.3 Analytics Cookies</h3>
          <p className="text-gray-700 mb-4">
            These cookies help us understand how visitors interact with our website by collecting and 
            reporting information anonymously.
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Page views:</strong> Track which pages you visit</li>
            <li><strong>Time on site:</strong> Measure how long you spend on our site</li>
            <li><strong>Referral source:</strong> Identify how you found our website</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-3">2.4 Marketing Cookies</h3>
          <p className="text-gray-700 mb-4">
            These cookies are used to deliver relevant advertisements and track the effectiveness of 
            our marketing campaigns.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">3. Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4">
            We may use third-party services that set their own cookies on your device. These include:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
            <li><strong>Sentry:</strong> For error tracking and performance monitoring</li>
            <li><strong>Razorpay:</strong> For payment processing (when making payments)</li>
            <li><strong>Supabase:</strong> For authentication and database services</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">4. Managing Cookies</h2>
          <p className="text-gray-700 mb-4">
            You can control and manage cookies in several ways:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies</li>
            <li><strong>Cookie consent banner:</strong> You can accept or decline non-essential cookies when you first visit our site</li>
            <li><strong>Opt-out links:</strong> Some third-party cookies can be disabled through the third party's website</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Please note that blocking some cookies may affect your experience on our website and some 
            features may not function properly.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">5. Cookie Consent</h2>
          <p className="text-gray-700 mb-4">
            When you first visit our website, you will see a cookie consent banner. You can choose to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Accept All:</strong> Allow all cookies including analytics and marketing</li>
            <li><strong>Essential Only:</strong> Only allow cookies necessary for the website to function</li>
            <li><strong>Manage Preferences:</strong> Choose which types of cookies to allow</li>
          </ul>
          <p className="text-gray-700 mb-4">
            You can change your cookie preferences at any time by clicking the "Cookie Settings" link 
            in our website footer.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            Different cookies are stored for different periods:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent cookies:</strong> Stored for up to 2 years, depending on the purpose</li>
            <li><strong>Analytics data:</strong> Retained for 26 months</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">7. Updates to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Cookie Policy from time to time. Any changes will be posted on this page 
            with an updated revision date. We encourage you to review this policy periodically.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">8. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about our use of cookies, please contact us at:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Email: <a href="mailto:privacy@brahminsoulmate.com" className="text-brahmin-primary hover:underline">privacy@brahminsoulmate.com</a></li>
            <li>Address: BrahminSoulmate Support Team</li>
          </ul>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Related Policies</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-brahmin-primary hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-brahmin-primary hover:underline">Terms and Conditions</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
