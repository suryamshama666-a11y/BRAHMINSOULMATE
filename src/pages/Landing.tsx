import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Users, Video, Star } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100">
            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-serif font-bold text-red-800 mb-6">
                        Brahmin Soulmate Connect
                    </h1>
                    <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                        Find your perfect life partner within the Brahmin community.
                        Connect with like-minded individuals who share your values and traditions.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/register">
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
                                Join Now
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 px-8 py-3 text-lg">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                        <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Find Matches</h3>
                        <p className="text-gray-600">Discover compatible profiles based on your preferences</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                        <Users className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Community</h3>
                        <p className="text-gray-600">Join a trusted community of Brahmin families</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                        <Video className="h-12 w-12 text-red-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Video Dates</h3>
                        <p className="text-gray-600">Meet virtually before meeting in person</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                        <Star className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Success Stories</h3>
                        <p className="text-gray-600">Join thousands of successful matches</p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-3xl font-serif font-bold text-red-800 mb-4">
                        Ready to Find Your Soulmate?
                    </h2>
                    <p className="text-gray-700 mb-6">
                        Join thousands of Brahmin singles who have found their perfect match
                    </p>
                    <Link to="/register">
                        <Button className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 text-lg">
                            Get Started Today
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;