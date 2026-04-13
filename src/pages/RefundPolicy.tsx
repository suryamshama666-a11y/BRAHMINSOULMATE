import React from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-brahmin-primary mb-6">Refund Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-gray-700 mb-6">
            Last updated: February 13, 2026
          </p>
          
          <p className="text-gray-700 mb-6">
            At BrahminSoulmate, we want you to be satisfied with your subscription. This Refund Policy 
            outlines the terms and conditions under which refunds may be issued for our premium membership 
            plans and services.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">1. Subscription Refunds</h2>
          
          <h3 className="text-lg font-medium mb-3">1.1 7-Day Money-Back Guarantee</h3>
          <p className="text-gray-700 mb-4">
            We offer a 7-day money-back guarantee for all first-time subscribers. If you are not satisfied 
            with your premium subscription, you may request a full refund within 7 days of your initial 
            purchase, provided that:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>This is your first subscription purchase with BrahminSoulmate</li>
            <li>You have not used more than 50 profile views during the subscription period</li>
            <li>You have not sent more than 20 interests/messages during the subscription period</li>
            <li>You submit your refund request within 7 days of purchase</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-3">1.2 After 7 Days</h3>
          <p className="text-gray-700 mb-4">
            Refund requests made after the 7-day guarantee period will be evaluated on a case-by-case basis. 
            We may offer:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Pro-rated refund:</strong> Based on the remaining subscription period</li>
            <li><strong>Account credit:</strong> For use towards future subscriptions</li>
            <li><strong>Subscription extension:</strong> Additional time added to your current plan</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">2. Non-Refundable Items</h2>
          <p className="text-gray-700 mb-4">
            The following are non-refundable:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Renewal subscriptions:</strong> Automatic renewals after the initial subscription period</li>
            <li><strong>Profile boost purchases:</strong> One-time profile visibility boosts</li>
            <li><strong>Astrological services:</strong> Horoscope matching reports and consultations</li>
            <li><strong>Event registrations:</strong> Community event tickets and registrations</li>
            <li><strong>Gift subscriptions:</strong> Subscriptions purchased as gifts for others</li>
            <li><strong>Used services:</strong> Where significant usage has occurred (at our discretion)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">3. Service Interruptions</h2>
          <p className="text-gray-700 mb-4">
            If our service experiences significant downtime or technical issues that prevent you from using 
            premium features:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>We will automatically extend your subscription by the duration of the outage</li>
            <li>For outages exceeding 48 hours, you may request a pro-rated refund</li>
            <li>We will notify affected users via email about service restoration</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">4. Account Termination</h2>
          
          <h3 className="text-lg font-medium mb-3">4.1 Termination by User</h3>
          <p className="text-gray-700 mb-4">
            If you choose to delete your account:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Refunds will be processed according to the terms above</li>
            <li>Any remaining subscription time will be forfeited</li>
            <li>Account data will be deleted according to our Privacy Policy</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-3">4.2 Termination by BrahminSoulmate</h3>
          <p className="text-gray-700 mb-4">
            If your account is terminated due to violation of our Terms of Service:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>No refund will be provided</li>
            <li>You will lose access to all premium features immediately</li>
            <li>Any pending matches or messages will be deleted</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">5. How to Request a Refund</h2>
          <p className="text-gray-700 mb-4">
            To request a refund, please follow these steps:
          </p>
          <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
            <li>Log into your BrahminSoulmate account</li>
            <li>Go to Account Settings → Subscription → Request Refund</li>
            <li>Fill out the refund request form with your reason for cancellation</li>
            <li>Submit your request</li>
          </ol>
          <p className="text-gray-700 mb-4">
            Alternatively, you can email us directly at:
            <a href="mailto:refunds@brahminsoulmate.com" className="text-brahmin-primary hover:underline ml-1">
              refunds@brahminsoulmate.com
            </a>
          </p>
          <p className="text-gray-700 mb-4">
            Please include your registered email address and order ID in your refund request.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">6. Refund Processing</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Processing time:</strong> Refunds are processed within 5-7 business days</li>
            <li><strong>Refund method:</strong> Refunds are credited to the original payment method</li>
            <li><strong>Bank processing:</strong> Your bank may take an additional 5-10 business days to reflect the refund</li>
            <li><strong>Notification:</strong> You will receive an email confirmation once the refund is processed</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">7. Payment Method Specifics</h2>
          
          <h3 className="text-lg font-medium mb-3">7.1 Credit/Debit Cards</h3>
          <p className="text-gray-700 mb-4">
            Refunds will be credited back to the same card used for the purchase. If your card has been 
            cancelled or expired, please contact our support team for alternative refund options.
          </p>
          
          <h3 className="text-lg font-medium mb-3">7.2 UPI Payments</h3>
          <p className="text-gray-700 mb-4">
            UPI refunds will be credited to the same UPI ID used for payment. Please ensure your UPI ID 
            is still active.
          </p>
          
          <h3 className="text-lg font-medium mb-3">7.3 Net Banking</h3>
          <p className="text-gray-700 mb-4">
            Refunds will be credited to the same bank account used for payment. Bank account details 
            are automatically retrieved from the original transaction.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">8. Disputes and Chargebacks</h2>
          <p className="text-gray-700 mb-4">
            If you have a concern about a charge, please contact us directly before initiating a 
            chargeback with your bank. We are committed to resolving issues promptly and fairly.
          </p>
          <p className="text-gray-700 mb-4">
            Initiating a chargeback without first contacting us may result in:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Temporary suspension of your account</li>
            <li>Difficulty in processing future payments</li>
            <li>Longer resolution time</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">9. Exceptions</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to make exceptions to this policy in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Technical issues that significantly impacted your experience</li>
            <li>Billing errors on our part</li>
            <li>Special promotional offers with different refund terms</li>
            <li>Extenuating personal circumstances (evaluated case-by-case)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Refund Policy from time to time. Changes will be effective immediately 
            upon posting to this page. For existing subscriptions, the policy in effect at the time 
            of purchase will apply.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            For questions about refunds or to request a refund:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:refunds@brahminsoulmate.com" className="text-brahmin-primary hover:underline">refunds@brahminsoulmate.com</a></p>
            <p className="text-gray-700"><strong>Phone:</strong> +91-XXXXXXXXXX (Mon-Sat, 10 AM - 6 PM IST)</p>
            <p className="text-gray-700"><strong>Response Time:</strong> Within 24-48 hours</p>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Related Policies</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-brahmin-primary hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-brahmin-primary hover:underline">Terms and Conditions</Link></li>
              <li><Link to="/cookie-policy" className="text-brahmin-primary hover:underline">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
