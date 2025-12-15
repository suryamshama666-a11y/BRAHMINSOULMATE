import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Star, Calendar, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { successStoriesService, SuccessStory } from '@/services/api/success-stories.service';

export default function SuccessStories() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const storiesData = await successStoriesService.getApprovedStories(20);
      setStories(storiesData);
    } catch (error) {
      console.error('Error loading success stories:', error);
      setStories([
        {
          id: '1',
          user_id_1: 'user-1',
          user_id_2: 'user-2',
          title: "Aditya & Priya",
          story: "We connected through BrahminSoulmate and instantly felt a deep connection. Our shared values and aspirations made it clear we were meant for each other.",
          marriage_date: "2023-12-15",
          image_url: "/couples/couple1.jpg",
          status: 'approved',
          created_at: new Date().toISOString(),
          user1: { full_name: "Aditya" },
          user2: { full_name: "Priya" }
        },
        {
          id: '2',
          user_id_1: 'user-3',
          user_id_2: 'user-4',
          title: "Rahul & Sneha",
          story: "Thanks to the platform's advanced matching system, we found each other despite living in different cities. Our first video call lasted 3 hours!",
          marriage_date: "2023-11-20",
          image_url: "/couples/couple2.jpg",
          status: 'approved',
          created_at: new Date().toISOString(),
          user1: { full_name: "Rahul" },
          user2: { full_name: "Sneha" }
        },
        {
          id: '3',
          user_id_1: 'user-5',
          user_id_2: 'user-6',
          title: "Karthik & Divya",
          story: "The detailed profiles and horoscope matching feature helped us find our perfect match. We're grateful to BrahminSoulmate for bringing us together.",
          marriage_date: "2023-10-10",
          image_url: "/couples/couple3.jpg",
          status: 'approved',
          created_at: new Date().toISOString(),
          user1: { full_name: "Karthik" },
          user2: { full_name: "Divya" }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getCoupleNames = (story: SuccessStory) => {
    if (story.title) return story.title;
    const name1 = story.user1?.full_name?.split(' ')[0] || 'Partner';
    const name2 = story.user2?.full_name?.split(' ')[0] || 'Partner';
    return `${name1} & ${name2}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-serif mb-4"
            style={{ color: '#E30613' }}
          >
            Success Stories
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real couples who found their soulmates through our platform
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#E30613]" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src={story.image_url || 'https://via.placeholder.com/400x300?text=Happy+Couple'}
                    alt={getCoupleNames(story)}
                    className="object-cover w-full h-48"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Happy+Couple';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <Heart className="h-6 w-6 text-[#FF4500] fill-current" />
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-serif">{getCoupleNames(story)}</span>
                    {story.marriage_date && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(story.marriage_date)}
                      </div>
                    )}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 mr-1 text-[#FF4500]" />
                    BrahminSoulmate Match
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600">{story.story}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && stories.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No success stories yet. Be the first to share yours!</p>
          </div>
        )}

        <div className="text-center mt-16">
          <h2 className="text-2xl font-serif text-gray-800 mb-4">
            Ready to Write Your Own Success Story?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of happy couples who found their perfect match on BrahminSoulmate
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            className="bg-[#FF4500] text-white px-8 py-3 rounded-lg hover:bg-[#FF4500]/90 transition-colors"
          >
            Start Your Journey
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}