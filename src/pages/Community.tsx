import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Calendar, Heart, Plus, Eye, ThumbsUp, Reply } from 'lucide-react';
import Footer from '@/components/Footer';

export default function Community() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock categories for now
  const categories = [
    { id: '1', name: 'General Discussion', description: 'General topics and discussions' },
    { id: '2', name: 'Matrimony Tips', description: 'Tips and advice for finding your soulmate' },
    { id: '3', name: 'Success Stories', description: 'Share your success stories' }
  ];

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Community Hub
          </h1>
          <p className="text-gray-600">Connect, share, and engage with the matrimonial community</p>
        </div>

        <Tabs defaultValue="forum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-orange-50 border border-orange-200">
            <TabsTrigger 
              value="forum"
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Forum
            </TabsTrigger>
            <TabsTrigger 
              value="events"
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="groups"
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Heart className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forum">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Forum Discussions</h2>
                <Button onClick={() => setShowCreatePost(true)} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    title: "Tips for writing a great matrimony profile",
                    author: "Priya Sharma",
                    replies: 12,
                    views: 234,
                    category: "Tips & Advice"
                  },
                  {
                    title: "How to approach families for matrimony",
                    author: "Rajesh Kumar",
                    replies: 8,
                    views: 156,
                    category: "General Discussion"
                  },
                  {
                    title: "Success story: Found my soulmate here!",
                    author: "Anita Iyer",
                    replies: 25,
                    views: 567,
                    category: "Success Stories"
                  }
                ].map((post, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">by {post.author}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Reply className="h-4 w-4 mr-1" />
                          {post.replies} replies
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views} views
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Like
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Community Events</h2>
                <Button onClick={() => setShowCreateEvent(true)} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    title: "Brahmin Cultural Meet - Mumbai",
                    date: "Aug 15, 2025",
                    time: "6:00 PM",
                    location: "Mumbai, Maharashtra",
                    attendees: 45
                  },
                  {
                    title: "Spiritual Discourse & Meditation",
                    date: "Aug 20, 2025",
                    time: "5:30 PM",
                    location: "Bangalore, Karnataka",
                    attendees: 28
                  }
                ].map((event, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><Calendar className="h-4 w-4 inline mr-2" />{event.date} at {event.time}</p>
                        <p><Users className="h-4 w-4 inline mr-2" />{event.attendees} attending</p>
                        <p>{event.location}</p>
                      </div>
                      <Button className="mt-3" variant="outline">Join Event</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Community Groups</h2>
                <Button onClick={() => setShowCreateGroup(true)} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    name: "Young Professionals",
                    members: 156,
                    description: "For working professionals aged 25-35"
                  },
                  {
                    name: "Traditional Values",
                    members: 89,
                    description: "Focused on traditional matrimony approach"
                  }
                ].map((group, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                      <p className="text-gray-600 mb-2">{group.description}</p>
                      <p className="text-sm text-gray-500 mb-3">{group.members} members</p>
                      <Button variant="outline">Join Group</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Recent Activity</h2>

              <div className="space-y-4">
                {[
                  {
                    user: "Priya Sharma",
                    action: "posted in",
                    target: "Tips & Advice",
                    time: "2 hours ago"
                  },
                  {
                    user: "Rajesh Kumar",
                    action: "joined group",
                    target: "Young Professionals",
                    time: "4 hours ago"
                  },
                  {
                    user: "Anita Iyer",
                    action: "attending event",
                    target: "Cultural Meet - Mumbai",
                    time: "1 day ago"
                  }
                ].map((activity, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-semibold">{activity.target}</span>
                        <span className="text-gray-500 ml-2">{activity.time}</span>
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Simple Modal Placeholders */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Post</h3>
              <p className="text-gray-600 mb-4">Post creation feature coming soon!</p>
              <Button onClick={() => setShowCreatePost(false)}>Close</Button>
            </div>
          </div>
        )}

        {showCreateEvent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Event</h3>
              <p className="text-gray-600 mb-4">Event creation feature coming soon!</p>
              <Button onClick={() => setShowCreateEvent(false)}>Close</Button>
            </div>
          </div>
        )}

        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Group</h3>
              <p className="text-gray-600 mb-4">Group creation feature coming soon!</p>
              <Button onClick={() => setShowCreateGroup(false)}>Close</Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
