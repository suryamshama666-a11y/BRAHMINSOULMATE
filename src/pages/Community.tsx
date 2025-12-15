import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Users, Calendar, Heart, Plus, Eye, ThumbsUp, Reply, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { forumService, ForumPost } from '@/services/api/forum.service';
import { eventsService, Event } from '@/services/api/events.service';
import { useToast } from '@/hooks/use-toast';

export default function Community() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [newPost, setNewPost] = useState({ title: '', content: '', category: '' });

  useEffect(() => {
    loadPosts();
    loadEvents();
  }, []);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const postsData = await forumService.getPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([
        {
          id: '1',
          user_id: 'user-1',
          title: "Tips for writing a great matrimony profile",
          content: "Share your best tips!",
          category: "General Discussion",
          views: 234,
          likes: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: { full_name: "Priya Sharma", profile_picture: "/placeholder.svg" },
          comment_count: 12
        },
        {
          id: '2',
          user_id: 'user-2',
          title: "How to approach families for matrimony",
          content: "Looking for advice",
          category: "Relationship Advice",
          views: 156,
          likes: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: { full_name: "Rajesh Kumar", profile_picture: "/placeholder.svg" },
          comment_count: 8
        },
        {
          id: '3',
          user_id: 'user-3',
          title: "Success story: Found my soulmate here!",
          content: "Amazing experience",
          category: "Success Stories",
          views: 567,
          likes: 25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: { full_name: "Anita Iyer", profile_picture: "/placeholder.svg" },
          comment_count: 25
        }
      ]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const eventsData = await eventsService.getUpcomingEvents();
      setEvents(eventsData.slice(0, 3));
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([
        {
          id: '1',
          title: "Brahmin Cultural Meet - Mumbai",
          event_date: "2025-08-15T18:00:00",
          location: "Mumbai, Maharashtra",
          description: "Cultural gathering",
          capacity: 50,
          participant_count: 45,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: "Spiritual Discourse & Meditation",
          event_date: "2025-08-20T17:30:00",
          location: "Bangalore, Karnataka",
          description: "Meditation session",
          capacity: 40,
          participant_count: 28,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await forumService.createPost(newPost.category, newPost.title, newPost.content);
      toast({ title: 'Success', description: 'Post created successfully!' });
      setShowCreatePost(false);
      setNewPost({ title: '', content: '', category: '' });
      await loadPosts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create post', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await forumService.toggleLike(postId);
      await loadPosts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Please login to like posts', variant: 'destructive' });
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await eventsService.registerForEvent(eventId);
      toast({ title: 'Success', description: 'You have joined the event!' });
      await loadEvents();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to join event', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

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
            <TabsTrigger value="forum" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
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

              {loadingPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow border-2 border-gray-100">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg flex-1 pr-2">{post.title}</h3>
                          <Badge variant="outline" className="shrink-0">{post.category}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <img 
                            src={post.user?.profile_picture || '/placeholder.svg'} 
                            alt={post.user?.full_name || 'User'}
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                          />
                          <a 
                            href={`/profile/${post.user_id}`}
                            className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
                          >
                            {post.user?.full_name || 'Anonymous'}
                          </a>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Reply className="h-4 w-4 mr-1" />
                            {post.comment_count || 0}
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views}
                          </div>
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center hover:text-red-600 transition-colors ${post.is_liked ? 'text-red-600' : ''}`}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Community Events</h2>
                <Button onClick={() => window.location.href = '/events'} variant="outline">
                  View All Events
                </Button>
              </div>

              {loadingEvents ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow border-2 border-gray-100">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><Calendar className="h-4 w-4 inline mr-2" />{formatDate(event.event_date)} at {formatTime(event.event_date)}</p>
                          <p><Users className="h-4 w-4 inline mr-2" />{event.participant_count || 0}/{event.capacity} attending</p>
                          <p>{event.location}</p>
                        </div>
                        <Button 
                          className="mt-3" 
                          variant={event.is_registered ? "outline" : "default"}
                          onClick={() => handleJoinEvent(event.id)}
                          disabled={event.is_registered}
                        >
                          {event.is_registered ? 'Joined' : 'Join Event'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Young Professionals", members: 156, description: "For working professionals aged 25-35" },
                  { name: "Traditional Values", members: 89, description: "Focused on traditional matrimony approach" }
                ].map((group, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-2 border-gray-100">
                    <CardContent className="p-6">
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
                {posts.slice(0, 5).map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={post.user?.profile_picture || '/placeholder.svg'} 
                          alt={post.user?.full_name || 'User'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm">
                            <a href={`/profile/${post.user_id}`} className="font-semibold text-red-600 hover:underline">
                              {post.user?.full_name || 'Anonymous'}
                            </a>
                            {' '}posted in{' '}
                            <span className="font-semibold text-gray-900">{post.category}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{post.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Post</h3>
              <div className="space-y-4">
                <Select value={newPost.category} onValueChange={(v) => setNewPost(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {forumService.categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Post title" 
                  value={newPost.title} 
                  onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))} 
                />
                <Textarea 
                  placeholder="Write your post..." 
                  value={newPost.content} 
                  onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))} 
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost} disabled={submitting} className="bg-red-600 hover:bg-red-700">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>Cancel</Button>
                </div>
              </div>
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